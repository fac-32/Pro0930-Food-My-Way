import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { client } from "./db/client.js";
import { env } from "./config/env.js";
import mealRoutes from "./routes/mealRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import openaiRoutes from "./routes/openai_api.js";
import { recipeRoutes } from "./routes/recipeRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "img-src 'self' https: data: blob:; " +
      "script-src 'self'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "connect-src 'self' https:; " +
      "font-src 'self' https: data:; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "frame-ancestors 'self'"
  );
  next();
});
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "7d",
    etag: true,
  })
);

app.get("/saved", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "saved.html"));
});

app.use("/api/meals", mealRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/openai", openaiRoutes);
app.use("/recipe", recipeRoutes);

async function startServer() {
  try {
    await client.connect();
    await client.db("food-my-way").command({ ping: 1 });
    console.log("Connected to MongoDB");

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});

startServer();
