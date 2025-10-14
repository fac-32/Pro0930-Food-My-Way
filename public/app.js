"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const ingredientForm = document.querySelector("#ingredient-form");
    const ingredient = document.querySelector("#ingredient-input");

    const container = document.getElementById('mealsContainer');

    const recipeTitle = document.querySelector("#recipe-title");
    const ingredientList = document.querySelector("#recipe-ingredients");
    const instructions = document.querySelector("#recipe-instructions");
    
    const dropdown = document.querySelector("#target-ingredient");
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

    // pass valid input to backend
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
                    card.addEventListener('click', () => {
        console.log(meal.idMeal); // logs the clicked meal object
        return meal; // returning doesn't have a visible effect here, but useful if you want to use it in another function
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

    // placeholder for routing to the backend which calls OpenAI
    substituteForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // TO DO: check if selection is valid, fetch improved recipe from backend, and display it
        console.log(`you want to substitute ${dropdown.value}?`); // debug message

    });

    // mock recipe for testing format and display functions
    const recipeString = 
        `{  "meals": 
            [{  "idMeal":"52772",
                "strMeal":"Teriyaki Chicken Casserole",
                "strMealAlternate":null,
                "strCategory":"Chicken",
                "strArea":"Japanese",
                "strInstructions":"Preheat oven to 350\u00b0 F. Spray a 9x13-inch baking pan with non-stick spray.... Remove from oven and let stand 5 minutes before serving. Drizzle each serving with remaining sauce. Enjoy!",
                "strMealThumb":"https:\/\/www.themealdb.com\/images\/media\/meals\/wvpsxx1468256321.jpg",
                "strTags":"Meat,Casserole",
                "strYoutube":"https:\/\/www.youtube.com\/watch?v=4aZr5hZXP_s",

                "strIngredient1":"soy sauce",
                "strIngredient2":"water",
                "strIngredient3":"brown sugar",
                "strIngredient4":"ground ginger",
                "strIngredient5":"minced garlic",
                "strIngredient6":"cornstarch",
                "strIngredient7":"chicken breasts",
                "strIngredient8":"stir-fry vegetables",
                "strIngredient9":"brown rice",
                "strIngredient10":"","strIngredient11":"","strIngredient12":"","strIngredient13":"","strIngredient14":"","strIngredient15":"","strIngredient16":null,"strIngredient17":null,"strIngredient18":null,"strIngredient19":null,"strIngredient20":null,
                "strMeasure1":"3\/4 cup",
                "strMeasure2":"1\/2 cup",
                "strMeasure3":"1\/4 cup",
                "strMeasure4":"1\/2 teaspoon",
                "strMeasure5":"1\/2 teaspoon",
                "strMeasure6":"4 Tablespoons",
                "strMeasure7":"2",
                "strMeasure8":"1 (12 oz.)",
                "strMeasure9":"3 cups",
                "strMeasure10":"","strMeasure11":"","strMeasure12":"","strMeasure13":"","strMeasure14":"","strMeasure15":"","strMeasure16":null,"strMeasure17":null,"strMeasure18":null,"strMeasure19":null,"strMeasure20":null,
                "strSource":null,"strImageSource":null,
                "strCreativeCommonsConfirmed":null,
                "dateModified":null
            }]
        }`
    const recipeObject = JSON.parse(recipeString); // make test recipe object
    const button = document.getElementById('recipe-button'); // test button
    // test to display recipe and drop down on click
    button.addEventListener("click", () => {
        displayRecipe(formatRecipe(recipeObject), recipeTitle, ingredientList, instructions, dropdown);
    });    
});

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

// fill html containers with details from recipe object
function displayRecipe(recipe, title, ingredients, instructions, dropdown) {
    title.textContent = recipe.title;
    instructions.textContent = recipe.instructions;

    // clear previous recipe and dropdown/selector options
    dropdown.textContent = "";
    ingredients.textContent = "";

    for ( let i = 0; i < recipe.ingredients.length; i++ ) {
        const amount = recipe.amounts[i];
        const name = recipe.ingredients[i];

        // add ingredient with corresponding amount to the list
        const ingredientItem = document.createElement("li");
        ingredientItem.textContent = `${amount} ${name}`;
        ingredients.appendChild(ingredientItem);

        // add ingredient name to dropdown selector tag
        const ingredientOption = document.createElement("option");
        ingredientOption.setAttribute("value", name);
        ingredientOption.textContent = name;
        dropdown.appendChild(ingredientOption);
    }
}