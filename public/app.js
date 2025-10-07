"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#ingredient-form");
    const ingredient = document.querySelector("#ingredient-input");
    
    const button = document.getElementById('loadMeals');
    const container = document.getElementById('mealsContainer');

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

    // pass valid input to api
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if ( ingredient.checkValidity() ) {
            console.log("valid input will be routed to backend");
            // when validation has passed
            // route to backend e.g. fetch(`/recipe?ingredient=${ingredient.value}`)

        } else {
            ingredient.reportValidity();
        }
    });

    button.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/meals'); // calls your backend
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
    });
});