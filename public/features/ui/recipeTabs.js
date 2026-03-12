export function renderRecipeTabs(container) {
  if (!container) return;

  const ingredientsId = container.dataset.ingredientsId;
  const nutritionId = container.dataset.nutritionId;
  const ingredientsLabel = container.dataset.ingredientsLabel || "Ingredients";
  const nutritionLabel = container.dataset.nutritionLabel || "Nutrition";

  if (!ingredientsId || !nutritionId) return;

  const defaultTab = container.dataset.defaultTab || "ingredients";
  const isIngredientsDefault = defaultTab === "ingredients";

  container.innerHTML = `
    <div class="tab-buttons">
      <button class="tab-btn${isIngredientsDefault ? " active" : ""}" data-tab="${ingredientsId}">
        ${ingredientsLabel}
      </button>
      <button class="tab-btn${!isIngredientsDefault ? " active" : ""}" data-tab="${nutritionId}">
        ${nutritionLabel}
      </button>
    </div>

    <div class="tab-content${isIngredientsDefault ? " active" : ""}" id="${ingredientsId}-tab">
      <ul id="${ingredientsId}" class="recipe-list"></ul>
    </div>
    <div class="tab-content${!isIngredientsDefault ? " active" : ""}" id="${nutritionId}-tab">
      <ul id="${nutritionId}" class="recipe-list"></ul>
    </div>
  `;
}

export function initRecipeTabs() {
  const containers = document.querySelectorAll(".recipe-tabs");
  containers.forEach(renderRecipeTabs);
}
