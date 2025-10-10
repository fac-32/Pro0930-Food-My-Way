import express, { response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fetch meals from MealDB API
app.get('/api/meals', async (req, res) => {
  try {
    // concatenate all recipe results
    const collection = { meals: [] }; // TO DO: collection can be changed to store just a list of meal IDs?
    
    // call the mealdb api with the same form three times
    // first for searching by recipe name
    const searchResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${req.query.ingredient}`);
    const searchData = await searchResponse.json();
    if ( Array.isArray(searchData.meals) ) collection.meals.push(...searchData.meals);

    // second for searching by main ingredient
    const ingredientResponce = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${req.query.ingredient}`);
    const ingredientData = await ingredientResponce.json();
    if ( Array.isArray(ingredientData.meals) ) collection.meals.push(...ingredientData.meals);

    // thirdly for searching by category e.g. seafood
    const categoryResponce = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${req.query.ingredient}`);
    const categoryData = await categoryResponce.json();
    if ( Array.isArray(categoryData.meals) ) collection.meals.push(...categoryData.meals);
    
    // TO DO: handle when collection is { meals: null } and no recipes are found

    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
