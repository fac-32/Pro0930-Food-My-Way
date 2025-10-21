// public/recipeSubstitution.js
//  Client-side JavaScript to interact with the OpenAI API via the backend

import { displayRecipe } from "./app.js";
import { setSelectedRecipe, getSelectedRecipe, hasSelectedRecipe } from './recipeState.js';
import { RecipeOptionsManager } from "./recipeOptions.js";

document.addEventListener("DOMContentLoaded", () => {
    // Food preference and substitution selection elements
    const dietarySelect = document.getElementById("dietary-tags");
    const foodGroupSelect = document.getElementById("food-group-select");
    const adjustmentRadios = document.getElementsByName("adjustment");
    const ingredientDropdown = document.getElementById("target-ingredient");

    // Recipe generation elements
    const generateRecipeBtn = document.getElementById("generate-recipe");
    const promptDisplay = document.getElementById("prompt-display");
    const recipeOptionsForm = document.getElementById("recipe-options-form");
    const newRecipeTitle = document.querySelector("#new-recipe-title");
    const substitutionReasoning = document.querySelector("#substitution-reasoning");
    const newIngredientList = document.querySelector("#new-recipe-ingredients");
    const newInstructions = document.querySelector("#new-recipe-instructions");
    
      // Initialize the options manager module
    const optionsManager = new RecipeOptionsManager({
        dietarySelect,
        foodGroupSelect,
        adjustmentRadios,
        //addFoodGoalBtn: document.getElementById("add-food-goal"),
        targetIngredientSelect: ingredientDropdown,
        generateRecipeBtn,
        promptDisplay
    });

    // Handle substitution request
    recipeOptionsForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Check recipe selected and valid ingredient chosen
        if (!hasSelectedRecipe()) {
            alert('Please select a recipe first');
            return;
        }
        const targetIngredient = ingredientDropdown.value;
        if (!targetIngredient || targetIngredient === '-- target ingredient --') {
            alert('Please select an ingredient to substitute');
            return;
        }

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
        const selectedRecipe = getSelectedRecipe();
        console.log('Selected recipe for substitution:', selectedRecipe);

/*         // Dispatch event for other modules to handle
        await generateSubstitutedRecipe(selectedRecipe, targetIngredient, '');    */
        newRecipeTitle.textContent = 'Loading...';
    
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
                //ingredientToSubstitute: targetIngredient,
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
    console.log('Module NOT in use - delete later');
    /* newRecipeTitle.textContent = 'Loading...';
    
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
        
        const data = await response.json();
        
        if (response.ok) {
            displayRecipe(JSON.parse(data.newRecipe), newRecipeTitle, newIngredientList, newInstructions, undefined, substitutionReasoning);
        } else {
            newRecipeTitle.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        newRecipeTitle.textContent = `Request failed: ${error.message}`;
    } */
}