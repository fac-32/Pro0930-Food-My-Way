import {
  getOriginalRecipe,
  hasOriginalRecipe,
  getGeneratedRecipe,
  hasGeneratedRecipe,
} from "../../recipeState.js";
import { fetchJson } from "../../utils/api.js";

export function initSaveRecipeForm(saveForm) {
  if (!saveForm) return;

  saveForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (event.submitter.value === "original") {
      if (!hasOriginalRecipe()) {
        alert("You need to select a recipe to save");
        return;
      }
    } else if (!hasGeneratedRecipe()) {
      alert("You need to generate a recipe to save");
      return;
    }

    try {
      await fetchJson("/recipe/create", {
        method: "POST",
        body: JSON.stringify(
          event.submitter.value === "original"
            ? getOriginalRecipe()
            : getGeneratedRecipe()
        ),
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(`Error saving recipe: ${error}`);
    }
  });
}
