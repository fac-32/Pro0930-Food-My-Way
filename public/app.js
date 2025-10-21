'use strict'

// Import state management functions
import {
  getOriginalRecipe,
  setOriginalRecipe,
  hasOriginalRecipe,
  getGeneratedRecipe,
  hasGeneratedRecipe,
} from './recipeState.js'

document.addEventListener('DOMContentLoaded', () => {
  // DOM element references for index.html
  const ingredientForm = document.querySelector('#ingredient-form')
  const ingredient = document.querySelector('#ingredient-input')

  const container = document.getElementById('mealsContainer')

  const recipeTitle = document.querySelector('#recipe-title')
  const ingredientList = document.querySelector('#recipe-ingredients')
  const instructions = document.querySelector('#recipe-instructions')
  const recipeImage = document.querySelector('#recipe-image')

  const ingredientDropdown = document.querySelector('#target-ingredient')
  //const substituteForm = document.querySelector('#substitute-form')

  const saveForm = document.querySelector('#save-recipe-form')

  // display validity error message while typing
  if (ingredient) {
    ingredient.addEventListener('input', () => {
      const inputIngredient = ingredient.value.trim()

      ingredient.setCustomValidity('')

      if (!inputIngredient) {
        // check if empty
        ingredient.setCustomValidity('Please enter your search ingredient.')
      } else if (!/^[\-A-Za-z\s&]+$/.test(inputIngredient)) {
        // check for symbols and numbers
        ingredient.setCustomValidity(
          'Your ingredient should contain only letters.'
        )
      }
    })
  }

  // Search for meals if passed validation
  if (ingredientForm) {
    ingredientForm.addEventListener('submit', async (event) => {
      event.preventDefault()
/*       // reset previous meal selection, and clear recipe display area
      setOriginalRecipe(null);
      // -> TO DO: use displayRecipe to clear recipe display area but have error using cmd below
      //displayRecipe(getOriginalRecipe, '','','',[]);
      recipeTitle.textContent = '';
      ingredientList.textContent = '';
      instructions.textContent = ''; 
      recipeImage.style.display = 'none'; */

      // when validation has passed route to backend
      if (ingredient.checkValidity()) {
        try {
          const response = await fetch(
            `/api/meals?ingredient=${encodeURIComponent(ingredient.value)}`
          ) // calls backend
          if (!response.ok) {
            const errText = await response.text()
            throw new Error('Server returned error: ' + errText)
          }

          const data = await response.json()

          function renderMealsRow(data) {
            const container = document.getElementById('mealsContainer')
            container.innerHTML = '' // clear previous meals

            data.meals.forEach((meal) => {
              const card = document.createElement('div')
              card.classList.add('meal-card')
              card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
    `

              // Click to fetch and display recipe details
              card.addEventListener('click', async () => {
                const recipeResponse = await fetch(`/api/meals/${meal.idMeal}`)
                const recipeData = await recipeResponse.json()
                const recipe = formatRecipe(recipeData)
                setOriginalRecipe(recipe)
                displayRecipe(
                  recipe,
                  recipeTitle,
                  ingredientList,
                  instructions,
                  ingredientDropdown
                )
                const recipeSection = document.getElementById('recipe-section')
                recipeSection.style.display = 'block'
                setTimeout(() => recipeSection.classList.add('visible'), 10)
              })

              container.appendChild(card)
            })
          }
          renderMealsRow(data)
        } catch (error) {
          container.innerHTML = `<p>Error: ${error}</p>`
        }
      } else {
        // display custom failed validity message
        ingredient.reportValidity()
      }
    })
  }

  // save an original or generated recipe to db
  if (saveForm) {
    saveForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      if (event.submitter.value === 'original') {
        if (!hasOriginalRecipe()) {
          alert('You need to select a recipe to save')
          return
        }
      } else {
        if (!hasGeneratedRecipe()) {
          alert('You need to generate a recipe to save')
          return
        }
      }

      try {
        const response = await fetch('/recipe/create', {
          method: 'POST',
          body: JSON.stringify(
            event.submitter.value === 'original'
              ? getOriginalRecipe()
              : getGeneratedRecipe()
          ),
          headers: { 'Content-Type': 'application/json' },
        })
        if (!response.ok) {
          const errText = await response.text()
          throw new Error('Server returned error: ' + errText)
        }

        const data = await response.json()
      } catch (error) {
        console.error(`Error saving recipe: ${error}`)
      }
    })
  }
})

// Format recipe data from API response
// return recipe as an object with only the values we want to use/display
function formatRecipe(unformatted) {
  const recipe = {
    title: unformatted.meals[0].strMeal,
    image: unformatted.meals[0].strMealThumb, // ✅ add this line
    amounts: [],
    ingredients: [],
    instructions: unformatted.meals[0].strInstructions,
  }

  for (let i = 1; i <= 20 && unformatted.meals[0][`strIngredient${i}`]; i++) {
    recipe.amounts.push(unformatted.meals[0][`strMeasure${i}`].toLowerCase())
    recipe.ingredients.push(
      unformatted.meals[0][`strIngredient${i}`].toLowerCase()
    )
  }

  return recipe
}

// Display recipe in the UI
// fill html containers with details from recipe object
export function displayRecipe(
  recipe,
  title,
  ingredients,
  instructions,
  dropdown = '',
  reasoning = ''
) {
  // get the image element
  const recipeImage = document.querySelector('#recipe-image')

  // set recipe data
  title.textContent = recipe.title
  instructions.textContent = recipe.instructions

  // add image if exists

  // Keep previous image if new recipe has no image
  if (recipe.image) {
    recipeImage.src = recipe.image
    recipeImage.style.display = 'block'
  } else if (!recipeImage.src) {
    // only hide it if there was no image before
    recipeImage.style.display = 'none'
  }

  // clear previous ingredients and dropdown/selector options
  ingredients.innerHTML = ''
  if (dropdown) dropdown.innerHTML = '<option>-- target ingredient --</option>'

  for (let i = 0; i < recipe.ingredients.length; i++) {
    const amount = recipe.amounts[i]
    const name = recipe.ingredients[i]

    const ingredientItem = document.createElement('li')
    ingredientItem.textContent = `${amount} ${name}`
    ingredients.appendChild(ingredientItem)

    if (dropdown) {
      const ingredientOption = document.createElement('option')
      ingredientOption.value = name
      ingredientOption.textContent = name
      dropdown.appendChild(ingredientOption)
    }
  }

  // if reasoning tag is provided, populate it with the openai's justification for the substitution
  if (reasoning) {
    reasoning.textContent = recipe.justification // clear previous
  }
}
