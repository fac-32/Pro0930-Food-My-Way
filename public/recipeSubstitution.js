// public/recipeSubstitution.js
//  Client-side JavaScript to interact with the OpenAI API via the backend

import { displayRecipe } from "./app.js";
import { getOriginalRecipe, hasOriginalRecipe } from './recipeState.js';
import { RecipeOptionsManager } from "./recipeOptions.js";

document.addEventListener("DOMContentLoaded", () => {
    // Food preference and substitution selection elements
    const dietarySelect = document.getElementById("dietary-tags");
    const foodGroupSelect = document.getElementById("food-group-select");
    const adjustmentRadios = document.getElementsByName("adjustment");
    const ingredientDropdown = document.getElementById("target-ingredient");
    // const addFoodGoalBtn = document.getElementById("add-food-goal")
    // Recipe generation elements
    const generateRecipeBtn = document.getElementById("generate-recipe");
    // const promptDisplay = document.getElementById("prompt-display");
    const recipeOptionsForm = document.getElementById('substitute-form');//("recipe-options-form");
    const newRecipeTitle = document.querySelector("#new-recipe-title");
    const substitutionReasoning = document.querySelector("#substitution-reasoning");
    const newIngredientList = document.querySelector("#new-recipe-ingredients");
    const newInstructions = document.querySelector("#new-recipe-instructions");
    
      // Initialize the options manager module
    const optionsManager = new RecipeOptionsManager({
        dietarySelect,
        foodGroupSelect,
        adjustmentRadios,
        targetIngredientSelect: ingredientDropdown,
        generateRecipeBtn
    });

    // Handle substitution request
    recipeOptionsForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Check recipe selected and valid ingredient chosen
        if (!hasOriginalRecipe()) {
            alert('Please select a recipe first');
            return;
        }
 /*        const targetIngredient = ingredientDropdown.value;
        if (!targetIngredient || targetIngredient === '-- target ingredient --') {
            alert('Please select an ingredient to substitute');
            return;
        } */

        // Gather criteria from the modular manager
        const criteria = optionsManager.getCriteria();

        // Allow submission if any of the options are selected
        if (
        (!criteria.substitution || criteria.substitution === "") &&
        criteria.dietary.length === 0 &&
        !criteria.foodGoal
        ) {
        alert('Please select at least one option (ingredient substitution, dietary preferences, or food goals) to generate a recipe');
        return;
        }
        const selectedRecipe = getOriginalRecipe();
        //console.log('Selected recipe for substitution:', selectedRecipe);

        // Clear previous text on substitution display areas
    newRecipeTitle.textContent = 'Loading...';
    substitutionReasoning.textContent = '';
    newIngredientList.textContent = '';
    newInstructions.textContent = '';
    
    try {
        const response = await fetch('/api/openai/substitute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                originalRecipe: selectedRecipe.instructions,
                recipeTitle: selectedRecipe.title,
                allIngredients: selectedRecipe.ingredients.map((ing, i) => 
                    `${selectedRecipe.amounts[i]} ${ing}`
                ),
                substitutionIngredient: '',
                ingredientToSubstitute: criteria.substitution || '',
                substitutionIngredient: '', // You may extend this in future
                dietaryTags: criteria.dietary,
                foodGoal: criteria.foodGoal
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayRecipe(JSON.parse(data.newRecipe), newRecipeTitle, newIngredientList, newInstructions, undefined, substitutionReasoning);
        } else {
            newRecipeTitle.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        newRecipeTitle.textContent = `Request failed: ${error.message}`;
    } 
    });   
});

// Call OpenAI API for recipe substitution
async function generateSubstitutedRecipe(recipe, ingredientToSubstitute, substitutionIngredient) {
    
    // Clear previous text on substitution display areas
    console.log('Module NOT in use - delete later');
    /* newRecipeTitle.textContent = 'Loading...';
    substitutionReasoning.textContent = '';
    newIngredientList.textContent = '';
    newInstructions.textContent = '';

    try {
        const response = await fetch('/api/openai/substitute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                originalRecipe: recipe.instructions,
                recipeTitle: recipe.title,
                allIngredients: recipe.ingredients.map((ing, i) => 
                    `${recipe.amounts[i]} ${ing}`
                ),
                ingredientToSubstitute: ingredientToSubstitute,
                substitutionIngredient: substitutionIngredient
            })
        });
        
        if (!response.ok) {
    const errText = await response.text();
    throw new Error("Server returned error: " + errText);
}

const data = await response.json();

        
        if (response.ok) {
            setGeneratedRecipe(JSON.parse(data.newRecipe));
            displayRecipe(JSON.parse(data.newRecipe), newRecipeTitle, newIngredientList, newInstructions, undefined, substitutionReasoning);
        } else {
            newRecipeTitle.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        newRecipeTitle.textContent = `Request failed: ${error.message}`;
    } */
}