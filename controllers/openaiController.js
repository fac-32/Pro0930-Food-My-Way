import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateRecipeSubstitution(req, res) {
  try {
    const {
      originalRecipe,
      recipeTitle,
      allIngredients,
      ingredientToSubstitute,
      substitutionIngredient,
      dietaryTags = null,
      foodGoal = null,
    } = req.body;

    console.log("generateRecipeSubstitution called!");

    const instructionsList = Array.isArray(originalRecipe)
      ? originalRecipe.join("\n")
      : originalRecipe;

    const conditions = [];

    if (ingredientToSubstitute && ingredientToSubstitute.trim() !== "") {
      conditions.push(
        `Replace or substitute the ingredient "${ingredientToSubstitute}" while maintaining recipe balance and flavor.`
      );
    }

    if (dietaryTags && dietaryTags.trim() !== '') {
      conditions.push(
        `Ensure the recipe adheres to: ${dietaryTags} dietary restrictions.`
      );
    }

    if (foodGoal && foodGoal.trim() !== "") {
      conditions.push(`Modify the recipe to ${foodGoal}.`);
    }

    const recipeConstraints =
      conditions.length > 0
        ? `\nModify this recipe by following these constraints:\n- ${conditions.join(
            "\n- "
          )}`
        : "";

    const substitute =
      substitutionIngredient || "a suitable healthy alternative";

    const userPrompt = `
You are a helpful cooking assistant that generates new, realistic recipes.

The original recipe is titled "${recipeTitle}".
Ingredients:
${allIngredients.join("\n")}

Steps:
${instructionsList}

${recipeConstraints}

Generate a clear, structured recipe in JSON with the fields:
"title", "ingredients" (array of strings), "amounts" (parallel array), and "instructions" (array of steps).
If any substitutions or constraints are requested in "recipeConstraints", reflect those faithfully in the new recipe.
`;
    console.log("Prompt generated:", userPrompt);

    // Nested try-catch only for OpenAI call
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional chef specializing in recipe adaptation and ingredient substitutions.",
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "recipe_schema",
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                amounts: {
                  type: "array",
                  items: { type: "string" },
                },
                ingredients: {
                  type: "array",
                  items: { type: "string" },
                },
                instructions: { type: "string" },
                justification: { type: "string" },
              },
              required: ["title", "amounts", "ingredients", "instructions"],
              additionalProperties: false,
            },
          },
        },
        max_tokens: 1000,
        temperature: 0.7,
      });

      const substitutedRecipe =
        response.choices[0].message.content.trim();

      res.json({
        success: true,
        originalRecipe,
        substitution: `${ingredientToSubstitute} → ${substitutionIngredient}`,
        newRecipe: substitutedRecipe,
        tokensUsed: response.usage.total_tokens,
      });
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate recipe substitution",
        details: error.message,
      });
    }
  } catch (error) {
    console.error("Error generating recipe substitution:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export { generateRecipeSubstitution };


// async function handleOpenAIRequest(req, res) {
//     const { prompt } = req.body;
    
//     try {
//         // Make the API call to OpenAI
//         const response = await post(
//             'https://api.openai.com/v1/chat/completions',
//             {
//                 model: 'gpt-3.5-turbo',
//                 messages: [
//                     { role: 'system', content: 'You are a helpful assistant.' },
//                     { role: 'user', content: prompt }
//                 ],
//                 max_tokens: 150,
//                 temperature: 0.7
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
//                 }
//             }
//         );
        
//         // Extract and format the response
//         const aiResponse = response.data.choices[0].message.content.trim();
        
//         // Send structured response back to frontend
//         res.json({ 
//             success: true,
//             response: aiResponse,
//             model: response.data.model,
//             tokens: response.data.usage.total_tokens
//         });
        
//     } catch (error) {
//         console.error('Error calling OpenAI API:', error.response?.data || error.message);
        
//         res.status(500).json({ 
//             error: 'An error occurred while processing your request',
//             details: error.response?.data?.error?.message || error.message
//         });
//     }
// }

// export { handleOpenAIRequest };
