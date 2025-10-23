// routes/openai_api.js
// Express router for OpenAI API endpoint

import { Router } from 'express';
const router = Router();
import { formatRecipePrompt } from '../middleware/formatRecipePrompt.js';
import { generateRecipeSubstitution } from '../controllers/openaiController.js';

// POST endpoint for OpenAI requests:  /api/openai/substitute
// Uses validation middleware, then calls controller
//router.post('/openai_api', formatRecipePrompt, handleOpenAIRequest);
router.post('/substitute', generateRecipeSubstitution);

export default router;
