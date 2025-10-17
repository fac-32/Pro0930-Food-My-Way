import dotenv from 'dotenv';
import OpenAI from 'openai';

//const apiKey = process.env.OPENAI_API_KEY

dotenv.config();

// Create an OpenAI client instance with the API key 
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Controller function to handle OpenAI requests
async function generateRecipeSubstitution(req, res) {
    const { originalRecipe, ingredientToSubstitute, substitutionIngredient } = req.body;
    
     console.log('generateRecipeSubstitution called!');
     
    // Use provided substitute or let AI suggest one
    const substitute = substitutionIngredient || 'a suitable healthy alternative';
    
    // Format the prompt for recipe substitution
    const prompt = `You are a professional chef and recipe developer. 
    
Given this original recipe:
${originalRecipe}

Please create a similar recipe where you substitute "${ingredientToSubstitute}" with "${substitute}". 

Maintain the same cooking style and format, but adjust quantities and cooking instructions as needed for the substitution. Provide the complete modified recipe.`;
    
//console.log('Generated Prompt:', prompt);
    try {
        // Make the OpenAI API call
        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { 
                    role: "system", 
                    content: "You are a professional chef specializing in recipe adaptation and ingredient substitutions." 
                },
                { 
                    role: "user", 
                    content: prompt //JSON.stringify(prompt)
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "recipe_schema",
                    schema: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            amounts: { 
                                type: "array", 
                                items: { type: "string", pattern: "^[\-a-z0-9\s\.]+$" }, 
                                description: "each item must contain only the quantities with units (use shorthand e.g. tbs and tsp), must correspond to the ingredient in the same index, and have no ingredient names" 
                            },
                            ingredients: { 
                                type: "array", 
                                items: { type: "string", pattern: "^[\-a-z\s]+$" }, 
                                description: "each item must contain only the ingredient name with no quantities" 
                            },
                            instructions: { 
                                type: "string", 
                                description: "must be a single unbroken paragraph of plain text instructions without line breaks or step numbers" 
                            }
                        },
                        required: ["title", "amounts", "ingredients", "instructions"],
                        additionalProperties: false
                    }
                }
            },
            max_tokens: 1000,
            temperature: 0.7
        });
        
        // Extract the recipe from response
        const substitutedRecipe = response.choices[0].message.content.trim();

        // Send structured response back to frontend
        res.json({ 
            success: true,
            originalRecipe: originalRecipe,
            substitution: `${ingredientToSubstitute} → ${substitutionIngredient}`,
            newRecipe: substitutedRecipe,
            tokensUsed: response.usage.total_tokens
        });
        
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate recipe substitution',
            details: error.message
        });
    }
}

export { generateRecipeSubstitution };

// async function handleOpenAIRequest(req, res) {
//     const { prompt } = req.body;
    
//     try {
//         // Make the API call to OpenAI
//         const response = await post(
//             'https://api.openai.com/v1/chat/completions',
//             {
//                 model: 'gpt-3.5-turbo',
//                 messages: [
//                     { role: 'system', content: 'You are a helpful assistant.' },
//                     { role: 'user', content: prompt }
//                 ],
//                 max_tokens: 150,
//                 temperature: 0.7
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
//                 }
//             }
//         );
        
//         // Extract and format the response
//         const aiResponse = response.data.choices[0].message.content.trim();
        
//         // Send structured response back to frontend
//         res.json({ 
//             success: true,
//             response: aiResponse,
//             model: response.data.model,
//             tokens: response.data.usage.total_tokens
//         });
        
//     } catch (error) {
//         console.error('Error calling OpenAI API:', error.response?.data || error.message);
        
//         res.status(500).json({ 
//             error: 'An error occurred while processing your request',
//             details: error.response?.data?.error?.message || error.message
//         });
//     }
// }

// export { handleOpenAIRequest };
