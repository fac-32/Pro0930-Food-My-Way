// Middleware to string together a prompt in request body
function createPromptForSubIng(req, res, next) {
    const { prompt } = req.body;
    const { subIngredient } = req.body;

    // Format the prompt for OpenAI API
    const formattedPrompt = `Give me a recipe like this ${prompt} with ${subIngredient} as a substitute ingredient.`;
    
    // If validation passes, proceed to next middleware or route handler
    next();
}

export  { createPromptForSubIng };
