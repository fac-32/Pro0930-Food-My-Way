"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#ingredient-form");
    const ingredient = document.querySelector("#ingredient-input");

    const container = document.getElementById('mealsContainer');

    const recipeTitle = document.querySelector("#recipe-title");
    const ingredientList = document.querySelector("#recipe-ingredients");
    const instructions = document.querySelector("#recipe-instructions");

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
    form.addEventListener("submit", async (event) => {
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

    // test button
    const button = document.getElementById('recipe-button');
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

    // TEST BUTTON : display recipe and drop down on click
    button.addEventListener("click", () => {
        displayRecipe(formatRecipe(recipeObject), recipeTitle, ingredientList, instructions);
    });    
});

// return recipe as an object with only the values we want to use/display
function formatRecipe(unformatted) {
    const recipe = {
        title: unformatted.meals[0].strMeal,
        ingredients: [],
        instructions: unformatted.meals[0].strInstructions
    };

    // loop breaks when the value of the ingredient is null or ""
    for ( let i = 1; i <= 20 && unformatted.meals[0][`strIngredient${i}`]; i++ ) {
        recipe.ingredients.push([
                unformatted.meals[0][`strMeasure${i}`].toLowerCase(), 
                unformatted.meals[0][`strIngredient${i}`].toLowerCase()
            ]);
    }

    return recipe;
}

// fill html containers with details from recipe object
function displayRecipe(recipe, title, ingredients, instructions) {
    title.textContent = recipe.title;
    instructions.textContent = recipe.instructions;

    for ( let i = 0; i < recipe.ingredients.length; i++ ) {
        const amount = recipe.ingredients[i][0];
        const name = recipe.ingredients[i][1];

        const ingredientItem = document.createElement("li");
        ingredientItem.textContent = `${amount} ${name}`;
        ingredients.appendChild(ingredientItem);
    }
}