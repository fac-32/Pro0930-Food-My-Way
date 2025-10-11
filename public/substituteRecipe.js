// public/substituteRecipe.js
//  Client-side JavaScript to interact with the OpenAI API via the backend

// import testrecipe
import testRecipes from './testRecipes.json' with { type: 'json' };

// Get references to DOM elements
const getSubRecipe = document.getElementById('getSubRecipe');
const subIngredients = document.getElementById('subIngredients');
const subRecipe = document.getElementById('disp-sub-recipe');

// Add event listener to button
getSubRecipe.addEventListener('click', async () => {
    const userPrompt = subIngredients.value;
    
    if (!userPrompt) {
        subRecipe.textContent = 'Please select an ingredient to generate a new recipe.';
        return;
    }
    
    console.log('User selected ingredient to substitute:', userPrompt);
    console.log('Original Recipe:', testRecipes.meals[0].strInstructions);
    subRecipe.textContent = 'Loading...';
    const substitutionIngredient = 'a suitable substitute';  // Hardcoded fallback
    try {
        // Send POST request to backend API endpoint
        const response = await fetch('/api/openai_api', {
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
            subRecipe.textContent = data.newRecipe;
        } else {
            subRecipe.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        subRecipe.textContent = `Request failed: ${error.message}`;
    }
});
