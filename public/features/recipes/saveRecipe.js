import {
  getOriginalRecipe,
  hasOriginalRecipe,
  getGeneratedRecipe,
  hasGeneratedRecipe,
} from "../../recipeState.js";
import { fetchJson } from "../../utils/api.js";

function getImageElementByType(type) {
  return document.querySelector(type === "generated" ? "#new-recipe-image" : "#recipe-image");
}

function showSaveSuccessFeedback(submitter, recipeType) {
  if (!submitter) return;

  const imageElement = getImageElementByType(recipeType);
  const previousText = submitter.textContent;

  submitter.disabled = true;
  submitter.textContent = "Saved!";
  submitter.classList.add("save-success-btn");

  if (imageElement && imageElement.getAttribute("src")) {
    imageElement.classList.add("save-success-image");
  }

  setTimeout(() => {
    submitter.disabled = false;
    submitter.textContent = previousText;
    submitter.classList.remove("save-success-btn");
    if (imageElement) imageElement.classList.remove("save-success-image");
  }, 1400);
}

export function initSaveRecipeForm(saveForm) {
  if (!saveForm) return;

  saveForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const recipeType = event.submitter?.value;

    if (recipeType === "original") {
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
          recipeType === "original"
            ? getOriginalRecipe()
            : getGeneratedRecipe()
        ),
        headers: { "Content-Type": "application/json" },
      });

      showSaveSuccessFeedback(event.submitter, recipeType);
    } catch (error) {
      console.error(`Error saving recipe: ${error}`);
    }
  });
}
