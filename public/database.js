"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    // DOM element references for database.html
    const savedRecipes = document.querySelector("#saved-recipes");

    // on load, try to get recipes from db and display in list
    try {
        const response = await fetch("/recipe/retrieve");
        const data = await response.json();
        displayTitles(data, savedRecipes);
    } catch ( error ) {
        console.log(`Error fetching db recipes: ${error}`);
    }
});

// populate html unordered list with saved recipe titles and their db ids as data attributes
function displayTitles(recipes, recipeContainer) {
    for ( let i = 0; i < recipes.length; i++ ) {
        const recipe = document.createElement("li");
        recipe.textContent = recipes[i].title;
        recipe.setAttribute("data-id", recipes[i]._id);

        recipeContainer.appendChild(recipe);
    }
    console.log(recipes[0]);
}