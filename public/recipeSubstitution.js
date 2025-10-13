// public/substituteRecipe.js
//  Client-side JavaScript to interact with the OpenAI API via the backend

// import testrecipe
import testRecipes from './testRecipes.json' with { type: 'json' };

// Get references to DOM elements
const generateRecipeBtn = document.getElementById('generateRecipeBtn');
const ingredientInput = document.getElementById('ingredientInput');
const recipeOutput = document.getElementById('recipeOutput');

// Add event listener to button
generateRecipeBtn.addEventListener('click', async () => {
    const userPrompt = ingredientInput.value;
    
    if (!userPrompt) {
        recipeOutput.textContent = 'Please select an ingredient to generate a new recipe.';
        return;
    }
    
    console.log('User selected ingredient to substitute:', userPrompt);
    console.log('Original Recipe:', testRecipes.meals[0].strInstructions);
    recipeOutput.textContent = 'Loading...';
    const substitutionIngredient = ''; // Hardcoded fallback
    
    try {
        // Send POST request to backend API endpoint
        const response = await fetch('/api/openai/substitute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ originalRecipe : testRecipes.meals[0].strInstructions
                , ingredientToSubstitute: userPrompt
                , substitutionIngredient: substitutionIngredient
             })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Display the structured response from OpenAI
            recipeOutput.textContent = data.newRecipe;
        } else {
            recipeOutput.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        recipeOutput.textContent = `Request failed: ${error.message}`;
    }
});
