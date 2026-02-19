export function displayRecipe(
  recipe,
  title,
  ingredients,
  instructions,
  dropdown = undefined,
  reasoning = undefined
) {
  const recipeImage = document.querySelector("#recipe-image");

  title.textContent = recipe.title;
  instructions.textContent = recipe.instructions;

  if (typeof recipe.image !== "undefined" && recipeImage) {
    recipeImage.src = recipe.image;
    recipeImage.style.display = "block";
  }

  ingredients.textContent = "";
  if (typeof dropdown !== "undefined") {
    dropdown.innerHTML =
      '<option value="" disabled selected>Select ingredient</option>';
  }

  for (let i = 0; i < recipe.ingredients.length; i++) {
    const amount = recipe.amounts[i];
    const name = recipe.ingredients[i];

    const ingredientItem = document.createElement("li");
    ingredientItem.textContent = `${amount} ${name}`;
    ingredients.appendChild(ingredientItem);

    if (typeof dropdown !== "undefined") {
      const ingredientOption = document.createElement("option");
      ingredientOption.value = name;
      ingredientOption.textContent = name;
      dropdown.appendChild(ingredientOption);
    }
  }

  if (typeof reasoning !== "undefined") {
    reasoning.textContent = recipe.justification || "";
  }
}
