import { MongoClient, ServerApiVersion } from "mongodb";
import { env } from "../config/env.js";

if (!env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not configured.");
}

const client = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db("food-my-way");

export { client, db };
