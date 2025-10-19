
// Express router for MealDB API endpoints - lookup by ID
// ./routes/mealById.js
import express from 'express';

const router = express.Router();

// Define the route - note: path is just '/:id' not '/api/meals/:id'
router.get('/:id', async (req, res) => {
    try {
        const mealId = req.params.id;
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        if (!response.ok) {
    const errText = await response.text();
    throw new Error("Server returned error: " + errText);
}

const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error('Error fetching meal by ID:', error);
        res.status(500).json({ error: 'Failed to fetch meal details' });
    }
});

// Export the router as default
export default router;

