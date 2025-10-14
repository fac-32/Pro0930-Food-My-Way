// client.js
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// MONGODB_URI=mongodb+srv://[USER]:[PASSWORD]@[CLUSTER].abc123.mongodb.net/[DB NAME]
const uri = process.env.MONGODB_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// 'testing' is the name of my database within the cluster I have connected to
const db = client.db("testing");

export { client, db };