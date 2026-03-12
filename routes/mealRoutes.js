import { Router } from "express";
import { getMealById, searchMealsByIngredientTerm } from "../services/mealDbService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const meals = await searchMealsByIngredientTerm(req.query.ingredient);
    res.json(meals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await getMealById(req.params.id);
    res.json(data);
  } catch (error) {
    console.error("Error fetching meal by ID:", error);
    res.status(500).json({ error: "Failed to fetch meal details" });
  }
});

export default router;
