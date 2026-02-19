import { displayRecipe } from './features/recipes/recipeRenderer.js'
import { getNutritionInfo } from './features/nutrition/nutrition.js'
import {
  getOriginalRecipe,
  hasOriginalRecipe,
  getGeneratedRecipe,
  setGeneratedRecipe,
} from './recipeState.js'
import { RecipeOptionsManager } from './recipeOptions.js'
import { fetchJson } from './utils/api.js'

function toCommaSeparatedString(value) {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'string') return value
  return ''
}

function hasAtLeastOneCriterion(criteria) {
  return Boolean(criteria.substitution || criteria.dietary || criteria.foodGoal)
}

function clearGeneratedRecipeUI({
  newRecipeTitle,
  substitutionReasoning,
  newIngredientList,
  newInstructions,
  newNutritionList,
}) {
  // Clear previous generated state immediately so users see fresh request feedback.
  if (newRecipeTitle) newRecipeTitle.textContent = 'Loading...'
  if (substitutionReasoning) substitutionReasoning.textContent = ''
  if (newIngredientList) newIngredientList.textContent = ''
  if (newInstructions) newInstructions.textContent = ''
  if (newNutritionList) newNutritionList.textContent = ''
}

function buildSubstitutionPayload(selectedRecipe, criteria) {
  return {
    originalRecipe: selectedRecipe.instructions,
    recipeTitle: selectedRecipe.title,
    allIngredients: selectedRecipe.ingredients.map(
      (ing, i) => `${selectedRecipe.amounts[i]} ${ing}`
    ),
    substitutionIngredient: '',
    dietaryTags: toCommaSeparatedString(criteria.dietary),
    ingredientToSubstitute: toCommaSeparatedString(criteria.substitution),
    foodGoal: toCommaSeparatedString(criteria.foodGoal),
  }
}

function applyResetHandler({
  resetBtn,
  ingredientDropdown,
  dietarySelect,
  foodGroupSelect,
  optionsManager,
}) {
  if (!resetBtn) return

  resetBtn.addEventListener('click', () => {
    ingredientDropdown.value = ''
    dietarySelect.value = ''
    foodGroupSelect.value = ''
    optionsManager.resetCriteria()
  })
}

async function renderGeneratedRecipe({
  parsedRecipe,
  newRecipeTitle,
  newIngredientList,
  newInstructions,
  substitutionReasoning,
  newNutritionList,
}) {
  displayRecipe(
    parsedRecipe,
    newRecipeTitle,
    newIngredientList,
    newInstructions,
    undefined,
    substitutionReasoning
  )

  const recipeForNutrition = getGeneratedRecipe() || parsedRecipe
  if (newNutritionList) {
    try {
      await getNutritionInfo(recipeForNutrition, newNutritionList)
    } catch (error) {
      console.warn('getNutritionInfo failed:', error)
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const dietarySelect = document.getElementById('dietary-tags')
  const foodGroupSelect = document.getElementById('food-group-select')
  const adjustmentRadios = document.getElementsByName('adjustment')
  const ingredientDropdown = document.getElementById('target-ingredient')

  const generateRecipeBtn = document.getElementById('generate-recipe')
  const recipeOptionsForm = document.getElementById('substitute-form')

  const newRecipeTitle = document.querySelector('#new-recipe-title')
  const substitutionReasoning = document.querySelector('#substitution-reasoning')
  const newIngredientList = document.querySelector('#new-recipe-ingredients')
  const newNutritionList = document.querySelector('#new-recipe-nutrition')
  const newInstructions = document.querySelector('#new-recipe-instructions')

  const optionsManager = new RecipeOptionsManager({
    dietarySelect,
    foodGroupSelect,
    adjustmentRadios,
    targetIngredientSelect: ingredientDropdown,
    generateRecipeBtn,
  })

  recipeOptionsForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (!hasOriginalRecipe()) {
      alert('Please select a recipe first')
      return
    }

    const criteria = optionsManager.getCriteria()
    if (!hasAtLeastOneCriterion(criteria)) {
      alert(
        'Please select at least one option (ingredient substitution, dietary preferences, or food goals) to generate a recipe'
      )
      return
    }

    const selectedRecipe = getOriginalRecipe()

    clearGeneratedRecipeUI({
      newRecipeTitle,
      substitutionReasoning,
      newIngredientList,
      newInstructions,
      newNutritionList,
    })

    try {
      const data = await fetchJson('/api/openai/substitute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildSubstitutionPayload(selectedRecipe, criteria)),
      })

      const parsed = JSON.parse(data.newRecipe)
      setGeneratedRecipe(parsed)

      await renderGeneratedRecipe({
        parsedRecipe: parsed,
        newRecipeTitle,
        newIngredientList,
        newInstructions,
        substitutionReasoning,
        newNutritionList,
      })
    } catch (error) {
      if (newRecipeTitle) {
        newRecipeTitle.textContent = `Request failed: ${error.message}`
      }
      console.error('Substitution request failed:', error)
    }
  })

  const resetBtn = document.getElementById('reset-options')
  applyResetHandler({
    resetBtn,
    ingredientDropdown,
    dietarySelect,
    foodGroupSelect,
    optionsManager,
  })
})
