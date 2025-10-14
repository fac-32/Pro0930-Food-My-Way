// utils.js
import { client, db } from "./client.js";

const users = db.collection("users");

const createProfile = async (profile) => {
  try {
    await users.insertOne(profile);
    console.log("profile successfully added!");
    
  } catch (error) {
    console.error(error);
  }
};

export { createProfile }