"use strict";

import { displayRecipe } from "./app.js";

document.addEventListener("DOMContentLoaded", async () => {
    // DOM element references for saved.html
    const savedRecipes = document.querySelector("#saved-recipes");

    const selectedRecipeTitle = document.querySelector("#selected-recipe-title");
    const selectedIngredientList = document.querySelector("#selected-recipe-ingredients");
    const selectedInstructions = document.querySelector("#selected-recipe-instructions");

    const recipeContainer = document.querySelector("#recipe-container");

    // on load, try to get recipes from db and display in list
    try {
        const response = await fetch("/recipe/retrieve");
        if (!response.ok) {
            const errText = await response.text();
            throw new Error("Server returned error: " + errText);
        }
        const data = await response.json();
        displayTitles(data, savedRecipes);
    } catch ( error ) {
        console.log(`Error fetching db recipes: ${error}`);
    }

    // when a recipe title is clicked from the list, display the full recipe
    savedRecipes.addEventListener("click", async (event) => {
        let targetRecipe = event.target;

        if ( targetRecipe.id !== "savedRecipes" ) {
            try {
                const response = await fetch(`/recipe/select?id=${targetRecipe.getAttribute("data-id")}`);
                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error("Server returned error: " + errText);
                }

            const data = await response.json();
            displaySelected(data, selectedRecipeTitle, selectedIngredientList, selectedInstructions, recipeContainer);
            } catch ( error ) {
                console.error(`Error finding recipe: ${error}`);
            }
        }
    });
});

// populate html unordered list with saved recipe titles and their db ids as data attributes
function displayTitles(recipes, recipeContainer) {
    for ( let i = 0; i < recipes.length; i++ ) {
        // create list item with recipe title and append
        const recipe = document.createElement("li");
        recipe.textContent = recipes[i].title;
        recipe.setAttribute("data-id", recipes[i]._id);

        recipeContainer.appendChild(recipe);
    }
}

// display full recipe with the standard function and an additional delete button
function displaySelected(recipe, title, ingredients, instructions, container) {
    // display using standard function: show title, ingredients list, and instructions
    displayRecipe(recipe, title, ingredients, instructions, undefined, undefined);
    // create delete additional button
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("value", recipe._id);
    button.textContent = "DELETE";

    // on button click, send delete request to remove element with same id from the database
    button.addEventListener("click", async (event) => {
        try {
            const response = await fetch(`/recipe/delete?id=${recipe._id}`, { method: "DELETE" });
            // if item deleted successfully
            if ( response.status === 200 ) {
                // clear it from the list
                document.querySelector(`[data-id="${recipe._id}"]`).remove();
                // clear displayed recipe
                title.textContent = "";
                ingredients.textContent = "";
                instructions.textContent = "";
                button.style.visibility = "hidden";
            }
        } catch ( error ) {
            console.error(`Error deleting recipe: ${error}`);
        }
    });

    // replace previous recipe button so they don't pile up
    container.replaceChild(button, container.lastElementChild);
}