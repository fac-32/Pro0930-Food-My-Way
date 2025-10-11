// Example database function to log substituted recipes
async function saveSubstitutedRecipe(user,recipe) {
    // Database connection and insertion logic
    // e.g., using MongoDB, PostgreSQL, etc.
    console.log('Logging to database:', { user,recipe });
    
    // Example with hypothetical db connection:
    // await db.collection('subRecipes').insertOne({
    //     user,
    //     recipe,
    //     timestamp: new Date()
    // });
}

export default { saveSubstitutedRecipe };
