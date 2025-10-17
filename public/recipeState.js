// public/recipeState.js
// Shared state module for recipe data
// Uses module-level variable to store selected recipe
// Provides getter and setter functions

// Module-level variable to hold the selected recipe
let original = null;
let generated = null;


// Export getter function
export function getOriginalRecipe() {
    return original;
}

// Export setter function
export function setOriginalRecipe(recipe) {
    original = recipe;
    console.log('Origial recipe updated:', recipe?.title);
}

// Export check function
export function hasOriginalRecipe() {
    return original !== null;
}

export function getGeneratedRecipe() {
    return generated;
}

export function setGeneratedRecipe(recipe) {
    generated = recipe;
    console.log('Generated recipe updated', recipe?.title);
}

export function hasGeneratedRecipe() {
    return generated !== null;
}
