import express from "express";
import { createRecipe, retrieveRecipes, findRecipe, deleteRecipe } from "../db/utils.js";

const router = express.Router();

router.post("/create", (req, res) => {
  const { title, amounts, ingredients, instructions } = req.body;
  createRecipe({
    title: title,
    amounts: amounts,
    ingredients: ingredients,
    instructions: instructions
  });
  res.json({ message: `Your recipe for ${saveTitle} has been saved!` });
});

router.get("/retrieve", async (req, res) => {
  try {
    const recipeCollection = await retrieveRecipes();
    res.json(recipeCollection);
  } catch ( error ) {
    res.status(500).json({ error: "Error while fetching db recipes" });
  }
});

router.get("/select", async (req, res) => {
  try {
    const recipe = await findRecipe(req.query.id);
    res.json(recipe);
  } catch ( error ) {
    res.status(500).json({ error: "Error while fetching the selected recipe from db" });
  }
});

router.delete("/delete", async (req, res) => {
  const id = req.query.id;
  try {
    await deleteRecipe(id);
  } catch ( error ) {
    res.status(500).json({ error: "Error while deleting recipe" });
  }
});

// const recipe = {
//         title: unformatted.meals[0].strMeal,
//         amounts: [],
//         ingredients: [],
//         instructions: unformatted.meals[0].strInstructions
//     };

export { router as recipeRoutes };