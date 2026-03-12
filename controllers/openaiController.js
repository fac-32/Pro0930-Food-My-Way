import OpenAI from "openai";
import { env } from "../config/env.js";
import { uploadImageToCloudinary } from "../services/cloudinaryService.js";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const DEFAULT_TITLE = "Untitled Recipe";
const FALLBACK_SUBSTITUTION = "No direct substitution selected";
const OPENAI_FAILURE_MESSAGE = "Failed to generate recipe substitution";
const OPENAI_IMAGE_FAILURE_MESSAGE = "Failed to generate recipe image";
const SYSTEM_PROMPT =
  "You are a professional chef specializing in recipe adaptation and ingredient substitutions. Always return valid JSON only.";
const IMAGE_MODEL = env.OPENAI_IMAGE_MODEL;
const IMAGE_SIZE = "1024x1024";
const IMAGE_QUALITY = "medium";

function asTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeToStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string" ? item.trim() : String(item).trim()
      )
      .filter(Boolean);
  }

  const text = asTrimmedString(value);
  if (text) {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeInstructions(value) {
  if (Array.isArray(value)) {
    return value
      .map((step, index) => {
        const cleanStep =
          typeof step === "string" ? step.trim() : String(step).trim();
        return cleanStep ? `${index + 1}. ${cleanStep}` : null;
      })
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "string") return asTrimmedString(value);

  return "";
}

function parseModelJson(rawContent) {
  if (typeof rawContent !== "string") return {};
  const trimmed = rawContent.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // Some model responses may still wrap JSON in markdown fences.
    const cleaned = trimmed
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    return JSON.parse(cleaned);
  }
}

function ensureParallelArrays(recipe) {
  // Frontend rendering expects matching indices between amounts and ingredients.
  const maxLen = Math.max(recipe.amounts.length, recipe.ingredients.length);
  while (recipe.amounts.length < maxLen) recipe.amounts.push("to taste");
  while (recipe.ingredients.length < maxLen)
    recipe.ingredients.push("ingredient");
}

function buildConstraintList({
  ingredientToSubstitute,
  dietaryTags,
  foodGoal,
}) {
  const conditions = [];
  const ingredient = asTrimmedString(ingredientToSubstitute);
  const tags = asTrimmedString(dietaryTags);
  const goal = asTrimmedString(foodGoal);

  if (ingredient) {
    conditions.push(
      `Replace or substitute the ingredient "${ingredient}" while maintaining recipe balance and flavor.`
    );
  }

  if (tags) {
    conditions.push(`Ensure the recipe adheres to: ${tags} dietary restrictions.`);
  }

  if (goal) {
    conditions.push(`Modify the recipe to ${goal}.`);
  }

  return conditions;
}

function buildUserPrompt({ title, ingredientsList, instructionsList, conditions }) {
  const recipeConstraints =
    conditions.length > 0
      ? `\nModify this recipe by following these constraints:\n- ${conditions.join(
          "\n- "
        )}`
      : "";

  return `
You are a helpful cooking assistant that generates new, realistic recipes.

The original recipe is titled "${title}".
Ingredients:
${ingredientsList.join("\n")}

Steps:
${instructionsList}

${recipeConstraints}

Return valid JSON with the fields:
- "title" (string)
- "ingredients" (array of strings)
- "amounts" (array of strings, same length as ingredients)
- "instructions" (string)
- "justification" (string, optional)

If substitutions or constraints are requested, reflect those faithfully in the new recipe.
`;
}

function normalizeGeneratedRecipe(parsed, fallbackTitle) {
  const normalized = {
    title: asTrimmedString(parsed.title) || fallbackTitle,
    amounts: normalizeToStringArray(parsed.amounts),
    ingredients: normalizeToStringArray(parsed.ingredients),
    instructions: normalizeInstructions(parsed.instructions),
    ...(asTrimmedString(parsed.justification)
      ? { justification: asTrimmedString(parsed.justification) }
      : {}),
  };

  ensureParallelArrays(normalized);
  return normalized;
}

function buildImagePrompt(recipe) {
  const title = asTrimmedString(recipe?.title) || DEFAULT_TITLE;
  const ingredients = Array.isArray(recipe?.ingredients)
    ? recipe.ingredients.slice(0, 8).join(", ")
    : "";
  return `Professional food photography of "${title}". ${
    ingredients ? `Main ingredients: ${ingredients}.` : ""
  } Plated meal, realistic lighting, appetizing composition, no text, no watermark.`;
}

function extractImageData(response) {
  const imageResult = response?.data?.[0];
  if (!imageResult) return null;

  if (imageResult.url) return imageResult.url;
  if (imageResult.b64_json) {
    return `data:image/png;base64,${imageResult.b64_json}`;
  }
  return null;
}

export async function generateRecipeSubstitution(req, res) {
  try {
    if (!env.OPENAI_API_KEY) {
      res.status(500).json({
        success: false,
        error: OPENAI_FAILURE_MESSAGE,
        details:
          "OPENAI_API_KEY is not configured. Add it to your environment and restart the server.",
      });
      return;
    }

    const {
      originalRecipe,
      recipeTitle,
      allIngredients,
      ingredientToSubstitute,
      dietaryTags = null,
      foodGoal = null,
    } = req.body;

    const safeRecipeTitle = asTrimmedString(recipeTitle) || DEFAULT_TITLE;

    const ingredientsList = Array.isArray(allIngredients)
      ? allIngredients.filter(Boolean)
      : [];

    const instructionsList = Array.isArray(originalRecipe)
      ? originalRecipe.join("\n")
      : typeof originalRecipe === "string"
      ? originalRecipe
      : "";

    const conditions = buildConstraintList({
      ingredientToSubstitute,
      dietaryTags,
      foodGoal,
    });
    const userPrompt = buildUserPrompt({
      title: safeRecipeTitle,
      ingredientsList,
      instructionsList,
      conditions,
    });

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.7,
    });

    const raw = response.choices?.[0]?.message?.content?.trim() || "{}";
    const parsed = parseModelJson(raw);
    const normalizedRecipe = normalizeGeneratedRecipe(parsed, safeRecipeTitle);

    res.json({
      success: true,
      originalRecipe,
      substitution: asTrimmedString(ingredientToSubstitute) || FALLBACK_SUBSTITUTION,
      newRecipe: JSON.stringify(normalizedRecipe),
      tokensUsed: response.usage?.total_tokens ?? null,
    });
  } catch (error) {
    console.error("Error generating recipe substitution:", error);
    res.status(500).json({
      success: false,
      error: OPENAI_FAILURE_MESSAGE,
      details: error?.message || "Unknown OpenAI API error",
    });
  }
}

export async function generateRecipeImage(req, res) {
  try {
    if (!env.OPENAI_API_KEY) {
      res.status(500).json({
        success: false,
        error: OPENAI_IMAGE_FAILURE_MESSAGE,
        details:
          "OPENAI_API_KEY is not configured. Add it to your environment and restart the server.",
      });
      return;
    }

    const recipe = req.body?.recipe;
    if (!recipe || typeof recipe !== "object") {
      res.status(400).json({
        success: false,
        error: OPENAI_IMAGE_FAILURE_MESSAGE,
        details: "Missing recipe payload for image generation.",
      });
      return;
    }

    const response = await client.images.generate({
      model: IMAGE_MODEL,
      prompt: buildImagePrompt(recipe),
      size: IMAGE_SIZE,
      quality: IMAGE_QUALITY,
    });

    const image = extractImageData(response);
    if (!image) {
      res.status(500).json({
        success: false,
        error: OPENAI_IMAGE_FAILURE_MESSAGE,
        details: "No image was returned by the image generation API.",
      });
      return;
    }

    const uploaded = await uploadImageToCloudinary({
      file: image,
      title: recipe?.title || DEFAULT_TITLE,
    });

    res.json({
      success: true,
      imageUrl: uploaded.imageUrl,
      imagePublicId: uploaded.imagePublicId,
    });
  } catch (error) {
    console.error("Error generating recipe image:", error);
    res.status(500).json({
      success: false,
      error: OPENAI_IMAGE_FAILURE_MESSAGE,
      details: error?.message || "Unknown OpenAI image API error",
    });
  }
}
