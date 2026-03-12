"use strict";

import { displayRecipe } from "./features/recipes/recipeRenderer.js";
import { fetchJson } from "./utils/api.js";

function clearRecipeDisplay(title, ingredients, instructions, image, button) {
  title.textContent = "";
  ingredients.textContent = "";
  instructions.textContent = "";
  if (image) {
    image.removeAttribute("src");
    image.style.display = "none";
  }
  if (button) button.remove();
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
  instructions,
  image,
}) {
  button.addEventListener("click", async () => {
    try {
      await fetchJson(`/recipe/delete?id=${recipeId}`, { method: "DELETE" });
      const listItem = document.querySelector(`[data-id="${recipeId}"]`);
      if (listItem) listItem.remove();
      clearRecipeDisplay(title, ingredients, instructions, image, button);
    } catch (error) {
      console.error(`Error deleting recipe: ${error}`);
    }
  });
}

function renderSelectedRecipe({
  recipe,
  title,
  ingredients,
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
  container.classList.add("recipe-display");

  const existingButton = container.querySelector("button");
  if (existingButton) existingButton.remove();

  const deleteButton = createDeleteButton(recipe._id);
  attachDeleteHandler({
    button: deleteButton,
    recipeId: recipe._id,
    title,
    ingredients,
    instructions,
    image,
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
  const savedRecipes = document.querySelector("#saved-recipes");
  const selectedRecipeTitle = document.querySelector("#selected-recipe-title");
  const selectedIngredientList = document.querySelector(
    "#selected-recipe-ingredients"
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
        instructions: selectedInstructions,
        image: selectedRecipeImage,
        container: recipeContainer,
      });
    } catch (error) {
      console.error(`Error finding recipe: ${error}`);
    }
  });
});
