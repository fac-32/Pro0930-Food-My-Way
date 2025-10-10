import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from "openai";
import {} from "dotenv/config";
import recipes from "./public/recipes.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.OPENAI_API_KEY;

// Middleware to serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fetch meals from MealDB API
app.get('/api/meals', async (req, res) => {
  try {
    const response = await fetch(
      'https://www.themealdb.com/api/json/v1/1/filter.php?i=chicken_breast'
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Start the server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// async function getRecipes() {
//   const response = await fetch('./recipes.json')
//   const recipes = await response.json()
// console.log(JSON.stringify(recipes));
// }

// getRecipes()

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-4o",
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: "Modify the recipe but substitute the basil with something else in the same JSON format", //soft code text
        },
        {
          type: "input_text",
          text: JSON.stringify(recipes),
        },
      ],
    },
  ],
});

console.log(response.output_text);
