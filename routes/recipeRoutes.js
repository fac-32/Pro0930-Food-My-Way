import express from "express";
import { createRecipe } from "../db/utils.js";

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

// const recipe = {
//         title: unformatted.meals[0].strMeal,
//         amounts: [],
//         ingredients: [],
//         instructions: unformatted.meals[0].strInstructions
//     };

export { router as recipeRoutes };