import { Router } from "express";
import { getNutritionForIngredients } from "../services/nutritionService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const ingredientList = req.query.ingredientList;
    const ingredientData = await getNutritionForIngredients(ingredientList);
    res.json(ingredientData);
  } catch (error) {
    console.error("Error fetching nutrition info:", error);
    res.status(500).json({ error: "Failed to fetch nutrition information" });
  }
});

export default router;
