import express from "express";
import {
  createRecipe,
  retrieveRecipes,
  findRecipe,
  deleteRecipe,
} from "../db/utils.js";
import { deleteImageFromCloudinary } from "../services/cloudinaryService.js";

const router = express.Router();

function sendServerError(res, message, error) {
  console.error(message, error);
  res.status(500).json({ error: message });
}

function getRecipeId(req) {
  return typeof req.query.id === "string" ? req.query.id.trim() : "";
}

function isValidRecipePayload(payload) {
  if (!payload || typeof payload !== "object") return false;

  const { title, amounts, ingredients, instructions } = payload;

  return (
    typeof title === "string" &&
    title.trim() !== "" &&
    Array.isArray(amounts) &&
    Array.isArray(ingredients) &&
    typeof instructions === "string" &&
    instructions.trim() !== ""
  );
}

router.post("/create", async (req, res) => {
  try {
    if (!isValidRecipePayload(req.body)) {
      res.status(400).json({
        error:
          "Invalid recipe payload. Required fields: title, amounts, ingredients, instructions.",
      });
      return;
    }

    const {
      title,
      amounts,
      ingredients,
      instructions,
      image,
      imagePublicId,
      justification,
    } =
      req.body;

    await createRecipe({
      title: title.trim(),
      amounts,
      ingredients,
      instructions: instructions.trim(),
      ...(image ? { image } : {}),
      ...(imagePublicId ? { imagePublicId } : {}),
      ...(justification ? { justification } : {}),
    });

    res.status(201).json({ message: `Your recipe for ${title} has been saved!` });
  } catch (error) {
    sendServerError(res, "Failed to save recipe", error);
  }
});

router.get("/retrieve", async (_req, res) => {
  try {
    const recipeCollection = await retrieveRecipes();
    res.status(200).json(recipeCollection);
  } catch (error) {
    sendServerError(res, "Error while fetching db recipes", error);
  }
});

router.get("/select", async (req, res) => {
  try {
    const id = getRecipeId(req);
    if (!id) {
      res.status(400).json({ error: "Missing recipe id" });
      return;
    }

    const recipe = await findRecipe(id);
    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    res.status(200).json(recipe);
  } catch (error) {
    sendServerError(res, "Error while fetching the selected recipe from db", error);
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const id = getRecipeId(req);
    if (!id) {
      res.status(400).json({ error: "Missing recipe id" });
      return;
    }

    const deletedRecipeResult = await deleteRecipe(id);
    const deletedRecipe = deletedRecipeResult?.value ?? deletedRecipeResult;
    if (!deletedRecipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    const imagePublicId = deletedRecipe.imagePublicId;
    if (imagePublicId) {
      try {
        await deleteImageFromCloudinary(imagePublicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary cleanup failed:", cloudinaryError);
        res.status(200).json({
          message: "Recipe deleted successfully",
          warning:
            "Recipe deleted, but image cleanup failed. You can remove it manually in Cloudinary.",
        });
        return;
      }
    }

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    sendServerError(res, "Error while deleting recipe", error);
  }
});

export { router as recipeRoutes };
