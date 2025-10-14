// routes/openai_api.js
// Express router for OpenAI API endpoint

import { Router } from 'express';
const router = Router();
import { createPromptForSubIng } from '../middleware/createPromptForSubIng.js';
import { generateRecipeSubstitution } from '../controllers/openaiController.js';

// POST endpoint for OpenAI requests
// Uses validation middleware, then calls controller
//router.post('/openai_api', createPromptForSubIng, handleOpenAIRequest);
router.post('/openai_api', generateRecipeSubstitution);


export default router;
