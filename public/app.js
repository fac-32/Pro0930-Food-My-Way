"use strict";

// Import state management functions
import { setSelectedRecipe, getSelectedRecipe, hasSelectedRecipe } from './recipeState.js';

document.addEventListener("DOMContentLoaded", () => {
    // DOM element references
    const ingredientForm = document.querySelector("#ingredient-form");
    const ingredient = document.querySelector("#ingredient-input");

    const container = document.getElementById('mealsContainer');

    const recipeTitle = document.querySelector("#recipe-title");
    const ingredientList = document.querySelector("#recipe-ingredients");
    const instructions = document.querySelector("#recipe-instructions");
    
    const ingredientDropdown = document.querySelector("#target-ingredient");
    const substituteForm = document.querySelector("#substitute-form");


    // display validity error message while typing
    ingredient.addEventListener("input", () => {
        const inputIngredient = ingredient.value.trim();
        
        ingredient.setCustomValidity("");

        if ( !inputIngredient ) { // check if empty
            ingredient.setCustomValidity("Please enter your search ingredient.");
        } else if ( !/^[\-A-Za-z\s&]+$/.test(inputIngredient) ) { // check for symbols and numbers
            ingredient.setCustomValidity("Your ingredient should contain only letters.")
        }
    });

    // Search for meals if passed validation
    ingredientForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // when validation has passed route to backend
        if ( ingredient.checkValidity() ) {
            try {
                const response = await fetch(`/api/meals?ingredient=${encodeURIComponent(ingredient.value)}`); // calls backend
                const data = await response.json();

                container.innerHTML = ''; // clear previous
                data.meals.slice(0, 4).forEach(meal => {

                    const card = document.createElement('div');
                    card.classList.add('meal-card');
                    card.innerHTML = `
                            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                            <h3>${meal.strMeal}</h3>
                            `;
                    // Add click handler to select recipe by clicking the meal card and display details
                    card.addEventListener('click', async () => {
                        // Fetch full recipe details using meal ID
                        const recipeResponse = await fetch(`/api/meals/${meal.idMeal}`);
                        const recipeData = await recipeResponse.json();
                        const recipe = formatRecipe(recipeData);
                        // Store in shared state module
                        setSelectedRecipe(recipe);
                        displayRecipe(recipe, recipeTitle, ingredientList, instructions, ingredientDropdown);
                    });
                    
                    container.appendChild(card);
                
                });
            } catch (error) {
                container.innerHTML = `<p>Error: ${error}</p>`;
            }
        } else {
            // display custom failed validity message
            ingredient.reportValidity();
        }
    });

    // Handle substitution request
    // pass the selected recipe and ingredient to openai_api route -> routing to the backend which calls OpenAI
    substituteForm.addEventListener("submit", async (event) => {
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
        //console.log('Selected recipe for substitution:', selectedRecipe);
        // Dispatch event for other modules to handle
        const substitutionEvent = new CustomEvent('recipe-substitution-requested', {
            detail: {
                recipe: getSelectedRecipe(),
                targetIngredient: targetIngredient
            }
        });
        document.dispatchEvent(substitutionEvent);
    });   
});

// Format recipe data from API response
// return recipe as an object with only the values we want to use/display
function formatRecipe(unformatted) {
    const recipe = {
        title: unformatted.meals[0].strMeal,
        amounts: [],
        ingredients: [],
        instructions: unformatted.meals[0].strInstructions
    };

    // loop breaks when the value of the ingredient is null or ""
    for ( let i = 1; i <= 20 && unformatted.meals[0][`strIngredient${i}`]; i++ ) {
        recipe.amounts.push(unformatted.meals[0][`strMeasure${i}`].toLowerCase());
        recipe.ingredients.push(unformatted.meals[0][`strIngredient${i}`].toLowerCase());
    }

    return recipe;
}

// Display recipe in the UI
// fill html containers with details from recipe object
export function displayRecipe(recipe, title, ingredients, instructions, dropdown="", reasoning="") {
    title.textContent = recipe.title;
    instructions.textContent = recipe.instructions;

    // clear previous ingredients and dropdown/selector options
    ingredients.innerHTML = '';
    if ( dropdown ) dropdown.innerHTML = '<option>-- target ingredient --</option>';


    for ( let i = 0; i < recipe.ingredients.length; i++ ) {
        const amount = recipe.amounts[i];
        const name = recipe.ingredients[i];

        // add ingredient with corresponding amount to the list
        const ingredientItem = document.createElement("li");
        ingredientItem.textContent = `${amount} ${name}`;
        ingredients.appendChild(ingredientItem);

        // if drop-down tag is provided, populate it with ingredient options
        if ( dropdown ) {
            // add ingredient name to dropdown selector tag
            const ingredientOption = document.createElement("option");
            ingredientOption.setAttribute("value", name);
            ingredientOption.textContent = name;
            dropdown.appendChild(ingredientOption);
        }
    }

    // if reasoning tag is provided, populate it with the openai's justification for the substitution
    if ( reasoning ) {
        const justification = document.createElement("div");
        justification.textContent = recipe.justification;

        reasoning.appendChild(justification);
    }
}