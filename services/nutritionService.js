import { env } from "../config/env.js";

const NUTRITION_API_URL = "https://api.calorieninjas.com/v1/nutrition";

export async function getNutritionForIngredients(ingredientList) {
  const response = await fetch(
    `${NUTRITION_API_URL}?query=${encodeURIComponent(ingredientList || "")}`,
    {
      method: "GET",
      headers: {
        "X-Api-Key": env.CALORIENINJAS_API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Nutrition API request failed: ${errText}`);
  }

  return response.json();
}
