//  Client-side JavaScript to interact with the OpenAI API via the backend

import { displayRecipe, getNutritionInfo } from './app.js'
import {
  getOriginalRecipe,
  hasOriginalRecipe,
  getGeneratedRecipe,
  setGeneratedRecipe,
} from './recipeState.js'
import { RecipeOptionsManager } from './recipeOptions.js'

document.addEventListener('DOMContentLoaded', () => {
  // --- Imports from HEAD/main merged correctly ---
  // Food preference and substitution selection elements
  const dietarySelect = document.getElementById('dietary-tags')
  const foodGroupSelect = document.getElementById('food-group-select')
  const adjustmentRadios = document.getElementsByName('adjustment')
  const ingredientDropdown = document.getElementById('target-ingredient')

  // Recipe generation elements
  const generateRecipeBtn = document.getElementById('generate-recipe')
  const recipeOptionsForm = document.getElementById('substitute-form')

  // Recipe display elements
  const newRecipeTitle = document.querySelector('#new-recipe-title')
  const substitutionReasoning = document.querySelector(
    '#substitution-reasoning'
  )
  const newIngredientList = document.querySelector('#new-recipe-ingredients')
  const newNutritionList = document.querySelector('#new-recipe-nutrition')
  const newInstructions = document.querySelector('#new-recipe-instructions')

  // Initialize the options manager
  const optionsManager = new RecipeOptionsManager({
    dietarySelect,
    foodGroupSelect,
    adjustmentRadios,
    targetIngredientSelect: ingredientDropdown,
    generateRecipeBtn,
  })

  // Handle substitution request
  recipeOptionsForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    // Check recipe selected and valid ingredient chosen
    if (!hasOriginalRecipe()) {
      alert('Please select a recipe first')
      return
    }

    // Gather criteria from the modular manager
    const criteria = optionsManager.getCriteria()

    // Allow submission if any of the options are selected
    if (
      (!criteria.substitution || criteria.substitution === '') &&
      (!criteria.dietary || criteria.dietary === '') &&
      !criteria.foodGoal
    ) {
      alert(
        'Please select at least one option (ingredient substitution, dietary preferences, or food goals) to generate a recipe'
      )
      return
    }

    const selectedRecipe = getOriginalRecipe()

    // Clear previous text on substitution display areas
    if (newRecipeTitle) newRecipeTitle.textContent = 'Loading...'
    if (substitutionReasoning) substitutionReasoning.textContent = ''
    if (newIngredientList) newIngredientList.textContent = ''
    if (newInstructions) newInstructions.textContent = ''
    if (newNutritionList) newNutritionList.textContent = ''

    try {
      const response = await fetch('/api/openai/substitute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalRecipe: selectedRecipe.instructions,
          recipeTitle: selectedRecipe.title,
          allIngredients: selectedRecipe.ingredients.map(
            (ing, i) => `${selectedRecipe.amounts[i]} ${ing}`
          ),
          substitutionIngredient: '',
          // convert arrays to comma-separated strings when sending to backend
          dietaryTags: toCommaSeparatedString(criteria.dietary),
          ingredientToSubstitute: toCommaSeparatedString(criteria.substitution),
          foodGoal: toCommaSeparatedString(criteria.foodGoal),
          // ingredientToSubstitute: criteria.substitution || '',
          // dietaryTags: criteria.dietary,
          // foodGoal: criteria.foodGoal,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // data.newRecipe expected to be a JSON string (based on original code)
        const parsed = JSON.parse(data.newRecipe)

        // Update generated recipe state if available
        if (typeof setGeneratedRecipe === 'function') {
          try {
            setGeneratedRecipe(parsed)
          } catch (e) {
            // silently continue if recipeState doesn't implement setGeneratedRecipe exactly like this
            console.warn('setGeneratedRecipe failed:', e)
          }
        }

        // Display the parsed recipe (uses your existing displayRecipe signature)
        displayRecipe(
          parsed,
          newRecipeTitle,
          newIngredientList,
          newInstructions,
          undefined,
          substitutionReasoning
        )

        // Fetch & display nutrition info — use getGeneratedRecipe() if available,
        // otherwise use the parsed recipe directly.
        const recipeForNutrition =
          (typeof getGeneratedRecipe === 'function' && getGeneratedRecipe()) ||
          parsed

        if (typeof getNutritionInfo === 'function' && newNutritionList) {
          try {
            // getNutritionInfo may expect (recipe, element) as in original code
            await getNutritionInfo(recipeForNutrition, newNutritionList)
          } catch (e) {
            console.warn('getNutritionInfo failed:', e)
          }
        }
      } else {
        if (newRecipeTitle) newRecipeTitle.textContent = `Error: ${data.error}`
      }
    } catch (error) {
      if (newRecipeTitle)
        newRecipeTitle.textContent = `Request failed: ${error.message}`
      console.error('Substitution request failed:', error)
    }
  })
  // Reset button handler
  const resetBtn = document.getElementById('reset-options');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ingredientDropdown.value = '';
      dietarySelect.value = '';
      foodGroupSelect.value = '';
      
      // Reset internal promptCriteria state
      optionsManager.resetCriteria(); 
    });
  }
})

function toCommaSeparatedString(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') return value;
  return ''; // or null
}
