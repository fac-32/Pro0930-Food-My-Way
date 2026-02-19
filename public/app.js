"use strict";

import { setOriginalRecipe } from "./recipeState.js";
import { initMealSearch } from "./features/meals/searchMeals.js";
import { initSaveRecipeForm } from "./features/recipes/saveRecipe.js";
import { displayRecipe } from "./features/recipes/recipeRenderer.js";
import { getNutritionInfo } from "./features/nutrition/nutrition.js";
import { initTabGroups } from "./features/ui/tabs.js";

document.addEventListener("DOMContentLoaded", () => {
  const ingredientForm = document.querySelector("#ingredient-form");
  const ingredientInput = document.querySelector("#ingredient-input");
  const mealsContainer = document.getElementById("mealsContainer");

  const recipeTitle = document.querySelector("#recipe-title");
  const ingredientList = document.querySelector("#recipe-ingredients");
  const instructions = document.querySelector("#recipe-instructions");
  const nutritionElement = document.querySelector("#recipe-nutrition");
  const ingredientDropdown = document.querySelector("#target-ingredient");
  const recipeSection = document.getElementById("recipe-section");

  const saveForm = document.querySelector("#save-recipe-form");

  initMealSearch({
    ingredientForm,
    ingredientInput,
    container: mealsContainer,
    onMealSelect: async (recipe) => {
      setOriginalRecipe(recipe);
      displayRecipe(
        recipe,
        recipeTitle,
        ingredientList,
        instructions,
        ingredientDropdown
      );
      await getNutritionInfo(recipe, nutritionElement);
      recipeSection.style.display = "block";
      setTimeout(() => recipeSection.classList.add("visible"), 10);
    },
  });

  initSaveRecipeForm(saveForm);
  initTabGroups();
});

export { displayRecipe, getNutritionInfo };
