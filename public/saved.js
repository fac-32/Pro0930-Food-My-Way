"use strict";

import { displayRecipe } from "./features/recipes/recipeRenderer.js";
import {
  getNutritionInfo,
  renderNutritionSummary,
} from "./features/nutrition/nutrition.js";
import { initTabGroups } from "./features/ui/tabs.js";
import { initRecipeTabs } from "./features/ui/recipeTabs.js";
import { fetchJson } from "./utils/api.js";

function clearRecipeDisplay(
  title,
  ingredients,
  nutrition,
  instructions,
  image,
  button,
  container
) {
  title.textContent = "";
  ingredients.textContent = "";
  nutrition.textContent = "";
  instructions.textContent = "";
  if (image) {
    image.removeAttribute("src");
    image.style.display = "none";
  }
  if (button) button.remove();
  if (container) container.classList.add("is-empty");
}

function renderRecipeTitles(recipes, recipeContainer) {
  recipeContainer.innerHTML = "";

  recipes.forEach((recipe) => {
    const item = document.createElement("li");
    if (recipe.image) {
      const image = document.createElement("img");
      image.src = recipe.image;
      image.alt = recipe.title;
      item.appendChild(image);
    }

    const title = document.createElement("h3");
    title.textContent = recipe.title;
    item.appendChild(title);

    item.setAttribute("data-id", recipe._id);
    recipeContainer.appendChild(item);
  });
}

function createDeleteButton(recipeId) {
  const button = document.createElement("button");
  button.type = "button";
  button.value = recipeId;
  button.textContent = "DELETE";
  button.classList.add("delete-btn");
  return button;
}

function attachDeleteHandler({
  button,
  recipeId,
  title,
  ingredients,
  nutrition,
  instructions,
  image,
  container,
}) {
  button.addEventListener("click", async () => {
    try {
      await fetchJson(`/recipe/delete?id=${recipeId}`, { method: "DELETE" });
      const listItem = document.querySelector(`[data-id="${recipeId}"]`);
      if (listItem) listItem.remove();
      clearRecipeDisplay(
        title,
        ingredients,
        nutrition,
        instructions,
        image,
        button,
        container
      );
    } catch (error) {
      console.error(`Error deleting recipe: ${error}`);
    }
  });
}

function renderSelectedRecipe({
  recipe,
  title,
  ingredients,
  nutrition,
  instructions,
  image,
  container,
}) {
  displayRecipe(
    recipe,
    title,
    ingredients,
    instructions,
    undefined,
    undefined,
    image
  );
  if (recipe?.nutrition) {
    renderNutritionSummary(recipe.nutrition, nutrition);
  } else {
    getNutritionInfo(recipe, nutrition);
  }
  container.classList.add("recipe-display");
  container.classList.remove("is-empty");

  const existingDeleteButton = container.querySelector(".delete-btn");
  if (existingDeleteButton) existingDeleteButton.remove();

  const tabButtons = container.querySelectorAll(".tab-btn");
  const tabContents = container.querySelectorAll(".tab-content");
  tabButtons.forEach((btn) => btn.classList.remove("active"));
  tabContents.forEach((content) => content.classList.remove("active"));
  const ingredientsButton = container.querySelector(
    `.tab-btn[data-tab="${ingredients.id}"]`
  );
  const ingredientsTab = container.querySelector(`#${ingredients.id}-tab`);
  if (ingredientsButton) ingredientsButton.classList.add("active");
  if (ingredientsTab) ingredientsTab.classList.add("active");

  const deleteButton = createDeleteButton(recipe._id);
  attachDeleteHandler({
    button: deleteButton,
    recipeId: recipe._id,
    title,
    ingredients,
    nutrition,
    instructions,
    image,
    container,
  });
  container.appendChild(deleteButton);
}

function getClickedRecipeId(target, rootContainer) {
  if (!target || target === rootContainer) return null;
  if (!(target instanceof HTMLElement)) return null;

  const recipeListItem = target.closest("li[data-id]");
  if (!recipeListItem || !rootContainer.contains(recipeListItem)) return null;

  return recipeListItem.getAttribute("data-id");
}

document.addEventListener("DOMContentLoaded", async () => {
  initRecipeTabs();
  const savedRecipes = document.querySelector("#saved-recipes");
  const loadingState = document.querySelector("#saved-loading");
  const selectedRecipeTitle = document.querySelector("#selected-recipe-title");
  const selectedIngredientList = document.querySelector(
    "#selected-recipe-ingredients"
  );
  const selectedNutritionList = document.querySelector(
    "#selected-recipe-nutrition"
  );
  const selectedInstructions = document.querySelector(
    "#selected-recipe-instructions"
  );
  const selectedRecipeImage = document.querySelector("#selected-recipe-image");
  const recipeContainer = document.querySelector("#recipe-container");

  try {
    const data = await fetchJson("/recipe/retrieve");
    renderRecipeTitles(data, savedRecipes);
  } catch (error) {
    console.error(`Error fetching db recipes: ${error}`);
  } finally {
    if (loadingState) loadingState.classList.add("is-hidden");
  }

  savedRecipes.addEventListener("click", async (event) => {
    const recipeId = getClickedRecipeId(event.target, savedRecipes);
    if (!recipeId) return;

    try {
      const recipe = await fetchJson(`/recipe/select?id=${recipeId}`);
      renderSelectedRecipe({
        recipe,
        title: selectedRecipeTitle,
        ingredients: selectedIngredientList,
        nutrition: selectedNutritionList,
        instructions: selectedInstructions,
        image: selectedRecipeImage,
        container: recipeContainer,
      });
    } catch (error) {
      console.error(`Error finding recipe: ${error}`);
    }
  });

  initTabGroups();
});
