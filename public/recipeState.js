// public/recipeState.js
// Shared state module for recipe data
// Uses module-level variable to store selected recipe
// Provides getter and setter functions

// Module-level variable to hold the selected recipe
let selectedRecipe = null;

// Export getter function
export function getSelectedRecipe() {
    return selectedRecipe;
}

// Export setter function
export function setSelectedRecipe(recipe) {
    selectedRecipe = recipe;
    console.log('Selected recipe updated:', recipe?.title);
}

// Export check function
export function hasSelectedRecipe() {
    return selectedRecipe !== null;
}
