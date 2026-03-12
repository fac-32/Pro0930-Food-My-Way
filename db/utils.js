import { ObjectId } from "bson";
import { db } from "./client.js";

const recipes = db.collection("recipes");

export async function createRecipe(recipe) {
  try {
    return await recipes.insertOne(recipe);
  } catch (error) {
    console.error(`Error inserting recipe: ${error}`);
    throw error;
  }
}

export async function retrieveRecipes() {
  try {
    const cursor = recipes.find({}, { projection: { title: 1, image: 1 } });
    return await cursor.toArray();
  } catch (error) {
    console.error(`Error finding recipes: ${error}`);
    throw error;
  }
}

export async function findRecipe(id) {
  try {
    return await recipes.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          title: 1,
          amounts: 1,
          ingredients: 1,
          instructions: 1,
          image: 1,
          imagePublicId: 1,
          justification: 1,
          nutrition: 1,
        },
      }
    );
  } catch (error) {
    console.error(`Error finding recipe with this id: ${error}`);
    throw error;
  }
}

export async function deleteRecipe(id) {
  try {
    return await recipes.findOneAndDelete({ _id: new ObjectId(id) });
  } catch (error) {
    console.error(`Error deleting recipe: ${error}`);
    throw error;
  }
}
