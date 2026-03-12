import { fetchJson } from "../../utils/api.js";
import { formatRecipe } from "../recipes/recipeFormatter.js";

function bindIngredientValidation(ingredientInput) {
  if (!ingredientInput) return;

  ingredientInput.addEventListener("input", () => {
    const inputIngredient = ingredientInput.value.trim();

    ingredientInput.setCustomValidity("");

    if (!inputIngredient) {
      ingredientInput.setCustomValidity("Please enter your search ingredient.");
    } else if (!/^[\-A-Za-z\s&]+$/.test(inputIngredient)) {
      ingredientInput.setCustomValidity(
        "Your ingredient should contain only letters."
      );
    }
  });
}

function renderMealCards(meals, container, onMealSelect) {
  container.innerHTML = "";

  if (!meals || meals.length === 0) {
    container.innerHTML =
      "<p class=\"empty-meals\">No recipes found for that ingredient. Try another one.</p>";
    return;
  }

  meals.forEach((meal) => {
    const card = document.createElement("div");
    card.classList.add("meal-card");
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" decoding="async" width="240" height="180">
      <h3>${meal.strMeal}</h3>
    `;

    card.addEventListener("click", async () => {
      const loadingState = document.querySelector("#meal-select-loading");
      if (loadingState) loadingState.classList.remove("is-hidden");
      try {
        const recipeData = await fetchJson(`/api/meals/${meal.idMeal}`);
        const recipe = formatRecipe(recipeData);
        if (recipe) await onMealSelect(recipe);
      } finally {
        if (loadingState) loadingState.classList.add("is-hidden");
      }
    });

    container.appendChild(card);
  });
}

export function initMealSearch({ ingredientForm, ingredientInput, container, onMealSelect }) {
  bindIngredientValidation(ingredientInput);

  if (!ingredientForm) return;

  ingredientForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!ingredientInput.checkValidity()) {
      ingredientInput.reportValidity();
      return;
    }

    const loadingState = document.querySelector("#meals-loading");
    container.innerHTML = "";
    if (loadingState) loadingState.classList.remove("is-hidden");

    try {
      const data = await fetchJson(
        `/api/meals?ingredient=${encodeURIComponent(ingredientInput.value)}`
      );
      renderMealCards(data.meals || [], container, onMealSelect);
    } catch (error) {
      container.innerHTML = `<p>Error: ${error}</p>`;
    } finally {
      if (loadingState) loadingState.classList.add("is-hidden");
    }
  });
}
