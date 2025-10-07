"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#ingredient-form");
    const ingredient = document.querySelector("#ingredient-input");

    ingredient.addEventListener("input", () => {
        const inputIngredient = ingredient.value.trim();
        
        ingredient.setCustomValidity("");

        if ( !inputIngredient ) { // check if empty
            ingredient.setCustomValidity("Please enter your search ingredient.");
        } else if ( !/^[\-A-Za-z\s&]+$/.test(inputIngredient) ) { // check for symbols and numbers
            ingredient.setCustomValidity("Your ingredient should contain only letters.")
        }
    });

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
});