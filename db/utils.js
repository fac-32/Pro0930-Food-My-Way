// utils.js
import { db } from "./client.js";

const recipes = db.collection("recipes");

// insert recipe into mongodb
const createRecipe = async (recipe) => {
  try {
    await recipes.insertOne(recipe);
    console.log("recipe successfully added!");
  } catch ( error ) {
    console.error(`Error inserting recipe: ${error}`);
  }
};

// return ids and titles from mongodb
const retrieveRecipes = async () => {
  try {
    const cursor = recipes.find({}, { projection: { title: 1 }});
    const recipeCollection = await cursor.toArray();
    return recipeCollection;
  } catch (error) {
    console.error(`Error finding recipes: ${error}`);
  }
};

export { createRecipe, retrieveRecipes }