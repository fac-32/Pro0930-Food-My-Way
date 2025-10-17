import express from "express";
import { createRecipe } from "../db/utils.js";

const router = express.Router();

router.post("/create", (req, res) => {
  const { recipeTitle } = req.body;
  createRecipe({
    recipe: recipeTitle,
  });
  res.send(`
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <title>Mongo page</title>
        <link rel="stylesheet" href="/style.css" />
        </head>
        <h1 class="style">Thank you for saving a recipe ${recipeTitle}</h1>
        <button class="style" onClick="location.href='/'">Home</button>
    </html>`);
});

export { router as recipeRoutes };