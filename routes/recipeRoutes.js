import express from "express";
import { createRecipe } from "../db/utils.js";

const router = express.Router();

router.post("/create", (req, res) => {
  const { recipeTitle } = req.body;
  createRecipe({
    recipe: recipeTitle,
  });
  res.json({ message: `Your recipe for ${recipeTitle} has been saved!` });
});

export { router as recipeRoutes };