"use strict";

import { displayRecipe } from "./app.js";

document.addEventListener("DOMContentLoaded", async () => {
    // DOM element references for saved.html
    const savedRecipes = document.querySelector("#saved-recipes");

    const selectedRecipeTitle = document.querySelector("#selected-recipe-title");
    const selectedIngredientList = document.querySelector("#selected-recipe-ingredients");
    const selectedInstructions = document.querySelector("#selected-recipe-instructions");

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

                displaySelected(data, selectedRecipeTitle, selectedIngredientList, selectedInstructions);
            } catch ( error ) {
                console.error(`Error finding recipe: ${error}`);
            }
            // import and call displayRecipe function with stuff from db response
        }
    });
});

// populate html unordered list with saved recipe titles and their db ids as data attributes
function displayTitles(recipes, recipeContainer) {
    for ( let i = 0; i < recipes.length; i++ ) {
        const recipe = document.createElement("li");
        recipe.textContent = recipes[i].title;
        recipe.setAttribute("data-id", recipes[i]._id);

        recipeContainer.appendChild(recipe);
    }
}

function displaySelected(recipe, title, ingredients, instructions) {
    displayRecipe(recipe, title, ingredients, instructions, undefined, undefined);

}