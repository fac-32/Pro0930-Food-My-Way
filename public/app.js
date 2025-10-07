const button = document.getElementById('loadMeals');
const container = document.getElementById('mealsContainer');

button.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/meals'); // calls your backend
    const data = await response.json();

     container.innerHTML = ''; // clear previous
    data.meals.slice(0, 4).forEach(meal => {

      const card = document.createElement('div');
      card.classList.add('meal-card');
      card.innerHTML = `
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
              <h3>${meal.strMeal}</h3>
            `;

      container.appendChild(card);
      
    });
  }   catch (error) {
          container.innerHTML = `<p>Error: ${error}</p>`;
        }
});