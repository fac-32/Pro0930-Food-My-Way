// utils.js
import { db } from "./client.js";

const recipes = db.collection("recipes");

const createRecipe = async (recipe) => {
  try {
    await recipes.insertOne(recipe);
    console.log("recipe successfully added!");
    
  } catch (error) {
    console.error(error);
  }
};

export { createRecipe }