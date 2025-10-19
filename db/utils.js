// utils.js
import { ObjectId } from "mongodb";
import { db } from "./client.js";

const recipes = db.collection("recipes");

// insert recipe into mongodb
const createRecipe = async (recipe) => {
  try {
    const result = await recipes.insertOne(recipe);
    console.log("recipe successfully added!");
    return result;  // ✅ This is the important part
  } catch (error) {
    console.error(`Error inserting recipe: ${error}`);
    throw error; // ✅ Also rethrow the error so the route handler can catch it
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

const findRecipe =  async (id) => {
  try {
    const cursor = recipes.findOne({ _id: new ObjectId(id) }, { projection: { title: 1, amounts: 1, ingredients: 1, instructions: 1 } });
    return cursor;
  } catch ( error ) {
    console.log(`Error finding recipe with this id: ${error}`);
  }
};

export { createRecipe, retrieveRecipes, findRecipe }