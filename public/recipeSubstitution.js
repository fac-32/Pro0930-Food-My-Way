// public/recipeSubstitution.js
//  Client-side JavaScript to interact with the OpenAI API via the backend


// Get references to DOM elements
const recipeOutput = document.getElementById('substituted-recipe');

// Listen for substitution requests from app.js
document.addEventListener('recipe-substitution-requested', async (event) => {
    const { recipe, targetIngredient } = event.detail;
    await generateSubstitutedRecipe(recipe, targetIngredient, '');
});

/* // Add event listener to button -> MANUAL TESTING
generateRecipeBtn.addEventListener('click', async () => {

    const selectedRecipe = testRecipes.meals[0];

    if (!selectedRecipe) {
        recipeOutput.textContent = 'Please select a recipe first.';
        return;
    }

    const targetIngredient = ingredientInput.value;
    
    if (!targetIngredient) {
        recipeOutput.textContent = 'Please select an ingredient to generate a new recipe.';
        return;
    }

    recipeOutput.textContent = 'Loading...';

    await generateSubstitutedRecipe(selectedRecipe, targetIngredient, '');
    
}); */

// Call OpenAI API for recipe substitution
async function generateSubstitutedRecipe(recipe, ingredientToSubstitute, substitutionIngredient) {
    recipeOutput.textContent = 'Loading...';
    
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
        console.log(data);
        
        if (response.ok) {
            recipeOutput.textContent = data.newRecipe;
        } else {
            recipeOutput.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        recipeOutput.textContent = `Request failed: ${error.message}`;
    }
}