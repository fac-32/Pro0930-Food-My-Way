import express, { response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import openaiRoutes from './routes/openai_api.js';
import mealByIdRoutes from './routes/mealById.js';
import {} from "dotenv/config";


// Remember to call client.connect() before using the database
// This is typically done once when your server starts

// Example in your main server file:
import { client } from './db/client.js';
import { recipeRoutes } from './routes/recipeRoutes.js';

await client.connect();
console.log('Connected to MongoDB!');

    
// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware to serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.get("/saved", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "saved.html"));
});

// Search meals by ingredient: Fetch meals from MealDB API
app.get('/api/meals', async (req, res) => {
  try {
    // concatenate all recipe results
    const collection = { meals: [] }; // TO DO: collection can be changed to store just a list of meal IDs?
    const ingredient = req.query.ingredient;

    // call the mealdb api with the same form three times
    // first for searching by recipe name
    const searchResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${ingredient}`);
    const searchData = await searchResponse.json();
    if ( Array.isArray(searchData.meals) ) collection.meals.push(...searchData.meals);

    // second for searching by main ingredient
    const ingredientResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
    const ingredientData = await ingredientResponse.json();
    if ( Array.isArray(ingredientData.meals) ) collection.meals.push(...ingredientData.meals);

    // thirdly for searching by category e.g. seafood
    const categoryResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${ingredient}`);
    const categoryData = await categoryResponse.json();
    if ( Array.isArray(categoryData.meals) ) collection.meals.push(...categoryData.meals);
    
    // TO DO: handle when collection is { meals: null } and no recipes are found

    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Import and use routes
app.use('/api/meals', mealByIdRoutes);  // Mount the meal by ID route
app.use('/api/openai', openaiRoutes);
app.use('/recipe',recipeRoutes)

async function startServer() {
  try {
    //connects to client
    await client.connect();
    console.log("Connected to MongoDB!");
    // Send a ping to confirm a successful connection
    await client.db("food-my-way").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    //used to start the server and listens for requests
    app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Mongo session closed when local dev server is stopped (and some deployment platforms)
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});

startServer();

// Start the server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

