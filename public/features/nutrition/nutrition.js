import { fetchJson } from "../../utils/api.js";

function constructIngredientsString(recipe) {
  const ingredientsArray = [];
  for (let i = 0; i < recipe.ingredients.length; i++) {
    ingredientsArray.push(` ${recipe.amounts[i]} ${recipe.ingredients[i]}`);
  }
  return ingredientsArray;
}

function displayNutrition(data, nutritionElement) {
  nutritionElement.innerHTML = "";

  const nutritionInfo = {
    serving_size_g: 0,
    calories: 0,
    fat_total_g: 0,
    fiber_g: 0,
    protein_g: 0,
    sodium_mg: 0,
    sugar_g: 0,
  };

  data.items.forEach((ingredient) => {
    nutritionInfo.serving_size_g += ingredient.serving_size_g;
    nutritionInfo.calories += ingredient.calories;
    nutritionInfo.fat_total_g += ingredient.fat_total_g;
    nutritionInfo.fiber_g += ingredient.fiber_g;
    nutritionInfo.protein_g += ingredient.protein_g;
    nutritionInfo.sodium_mg += ingredient.sodium_mg;
    nutritionInfo.sugar_g += ingredient.sugar_g;
  });

  nutritionInfo.serving_size_g =
    "Serving size: " + Math.round(nutritionInfo.serving_size_g * 10) / 10 + "g";
  nutritionInfo.calories =
    "Calories: " + Math.round(nutritionInfo.calories * 10) / 10;
  nutritionInfo.fat_total_g =
    "Fat: " + Math.round(nutritionInfo.fat_total_g * 10) / 10 + "g";
  nutritionInfo.fiber_g =
    "Fibre: " + Math.round(nutritionInfo.fiber_g * 10) / 10 + "g";
  nutritionInfo.protein_g =
    "Protein: " + Math.round(nutritionInfo.protein_g * 10) / 10 + "g";
  nutritionInfo.sodium_mg =
    "Sodium: " + Math.round(nutritionInfo.sodium_mg * 10) / 10 + "mg";
  nutritionInfo.sugar_g =
    "Sugar: " + Math.round(nutritionInfo.sugar_g * 10) / 10 + "g";

  for (const nutrient in nutritionInfo) {
    const nutritionItem = document.createElement("li");
    nutritionItem.textContent = nutritionInfo[nutrient];
    nutritionElement.appendChild(nutritionItem);
  }
}

export async function getNutritionInfo(recipe, nutritionElement) {
  const ingredients = constructIngredientsString(recipe);
  try {
    const data = await fetchJson(
      `/api/nutrition?ingredientList=${encodeURIComponent(ingredients)}`
    );
    displayNutrition(data, nutritionElement);
  } catch (error) {
    console.error("getNutritionInfo call error in nutrition.js", error);
  }
}
