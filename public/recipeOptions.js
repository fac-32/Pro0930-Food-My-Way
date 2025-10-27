// public/recipeOptions.js

export class RecipeOptionsManager {
  constructor({
    dietarySelect,
    foodGroupSelect,
    adjustmentRadios,
    targetIngredientSelect,
    generateRecipeBtn
  }) {
    this.dietarySelect = dietarySelect;
    this.foodGroupSelect = foodGroupSelect;
    this.adjustmentRadios = adjustmentRadios;
    this.targetIngredientSelect = targetIngredientSelect;
    this.generateRecipeBtn = generateRecipeBtn;

    this.promptCriteria = {
      dietary: null,
      foodGoal: null,
      substitution: null,
    };

    this._setupListeners();
  }

  // add eventlisteners to form elements to update criteria
  _setupListeners() {
    // Dietary selection -> allow multiple selections
    this.dietarySelect.addEventListener("change", () => {
      const selected = Array.from(this.dietarySelect.selectedOptions).map(opt => opt.value);
      this.promptCriteria.dietary = selected.length > 0 ? selected : null;
    });
    // Food goal selection -> single selection only
    this.foodGroupSelect.addEventListener("change", () => {
      const foodGroup = this.foodGroupSelect.value;
      if (!foodGroup) {
        // Clear foodGoal if user selects the placeholder option (empty value)
        this.promptCriteria.foodGoal = null;
        return;
      }
      const adjustment = Array.from(this.adjustmentRadios).find(r => r.checked)?.value ?? "increase";
      this.promptCriteria.foodGoal = (adjustment === "increase" ? "Increase" : "Decrease") + " " + foodGroup;
    });
    // Adjustment radio buttons -> only update if food group is also selected
    this.adjustmentRadios.forEach(radio =>
    radio.addEventListener('change', () => {
      const foodGroup = this.foodGroupSelect.value;
      if (!foodGroup) {
        this.promptCriteria.foodGoal = null;
        return;
      }
        const adjustment = Array.from(this.adjustmentRadios).find(r => r.checked)?.value ?? "increase";
        this.promptCriteria.foodGoal = (adjustment === "increase" ? "Increase" : "Decrease") + " " + foodGroup;
      })
  );
    // Ingredient substitution selection -> single select only
    this.targetIngredientSelect.addEventListener("change", () => {
      const ingredient = this.targetIngredientSelect.value;
      this.promptCriteria.substitution = ingredient ? ingredient : null;
    });
  }

  // Retrieve current criteria for recipe generation
  getCriteria() {
    return this.promptCriteria;
  }

  // Reset all criteria to defaults
  resetCriteria() {
    this.promptCriteria = {
      dietary: null,
      foodGoal: null,
      substitution: null,
    };
  }
}
