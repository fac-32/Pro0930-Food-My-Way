export function formatRecipe(unformatted) {
  const meal = unformatted?.meals?.[0];
  if (!meal) return null;

  const recipe = {
    title: meal.strMeal,
    image: meal.strMealThumb,
    amounts: [],
    ingredients: [],
    instructions: meal.strInstructions,
  };

  for (let i = 1; i <= 20 && meal[`strIngredient${i}`]; i++) {
    recipe.amounts.push(meal[`strMeasure${i}`].toLowerCase());
    recipe.ingredients.push(meal[`strIngredient${i}`].toLowerCase());
  }

  return recipe;
}
