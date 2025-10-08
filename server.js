import express from "express"; // if using ES modules
import OpenAI from "openai";
import {} from "dotenv/config";
import recipes from "./public/recipes.json" with { type: "json" };

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.OPENAI_API_KEY;

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Hello from Express backend!");
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
