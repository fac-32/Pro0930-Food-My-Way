const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

async function fetchMealDb(pathname) {
  const response = await fetch(`${MEALDB_BASE_URL}${pathname}`);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`MealDB request failed: ${errText}`);
  }
  return response.json();
}

export async function searchMealsByIngredientTerm(ingredient) {
  const term = (ingredient || "").trim();
  if (!term) return { meals: [] };

  const [searchData, ingredientData, categoryData] = await Promise.all([
    fetchMealDb(`/search.php?s=${encodeURIComponent(term)}`),
    fetchMealDb(`/filter.php?i=${encodeURIComponent(term)}`),
    fetchMealDb(`/filter.php?c=${encodeURIComponent(term)}`),
  ]);

  const collection = { meals: [] };
  if (Array.isArray(searchData.meals)) collection.meals.push(...searchData.meals);
  if (Array.isArray(ingredientData.meals)) {
    collection.meals.push(...ingredientData.meals);
  }
  if (Array.isArray(categoryData.meals)) collection.meals.push(...categoryData.meals);

  return collection;
}

export async function getMealById(mealId) {
  return fetchMealDb(`/lookup.php?i=${encodeURIComponent(mealId)}`);
}
