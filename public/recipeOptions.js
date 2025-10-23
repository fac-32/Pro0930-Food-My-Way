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
    //this.addFoodGoalBtn = addFoodGoalBtn;
    this.targetIngredientSelect = targetIngredientSelect;
    this.generateRecipeBtn = generateRecipeBtn;
    //this.promptDisplay = promptDisplay;

    this.promptCriteria = {
      dietary: [],
      foodGoal: null,
      substitution: null,
    };

    this._setupListeners();
  }

  // add eventlisteners to form elements to update criteria
  _setupListeners() {
    // Dietary selection
    this.dietarySelect.addEventListener("change", () => {
      const selected = Array.from(this.dietarySelect.selectedOptions).map(opt => opt.value);
      this.promptCriteria.dietary = selected;
    });
    // Food goal selection
    this.foodGroupSelect.addEventListener("change", () => {
      const foodGroup = this.foodGroupSelect.value;
      const adjustment = Array.from(this.adjustmentRadios).find(r => r.checked)?.value ?? "increase";
      this.promptCriteria.foodGoal = (adjustment === "increase" ? "Increase" : "Decrease") + " " + foodGroup;
    });
    // Adjustment radio buttons
    this.adjustmentRadios.forEach(radio =>
    radio.addEventListener('change', () => {
      const foodGroup = this.foodGroupSelect.value;
      if (foodGroup) {
        const adjustment = Array.from(this.adjustmentRadios).find(r => r.checked)?.value ?? "increase";
        this.promptCriteria.foodGoal = (adjustment === "increase" ? "Increase" : "Decrease") + " " + foodGroup;
        }
      })
  );
    // Ingredient substitution selection
    this.targetIngredientSelect.addEventListener("change", () => {
      const ingredient = this.targetIngredientSelect.value;
      this.promptCriteria.substitution = ingredient;
    });
  }


/*   this.addFoodGoalBtn.addEventListener("click", () => {
      const foodGroup = this.foodGroupSelect.value;
      if (!foodGroup) {
        alert("Please select a food group.");
        return;
      }
      const adjustment = Array.from(this.adjustmentRadios).find(r => r.checked)?.value ?? "increase";
      this.promptCriteria.foodGoal = (adjustment === "increase" ? "Increase" : "Decrease") + " " + foodGroup;
      this._updatePromptDisplay();
  });  */

/*     this.generateRecipeBtn.addEventListener("click", () => {
      const ingredient = this.targetIngredientSelect.value;
      if (!ingredient || ingredient === "-- target ingredient --") {
        alert("Please select an ingredient to substitute.");
        return;
      }
      this.promptCriteria.substitution = ingredient;
      //this._updatePromptDisplay();
    }); */

/*   _updatePromptDisplay() {
    const parts = [];
    if (this.promptCriteria.dietary.length > 0) {
      parts.push("Dietary: " + this.promptCriteria.dietary.join(", "));
    }
    if (this.promptCriteria.foodGoal) {
      parts.push("Food goal: " + this.promptCriteria.foodGoal);
    }
    if (this.promptCriteria.substitution) {
      parts.push("Substitution: " + this.promptCriteria.substitution);
    }
    this.promptDisplay.value = parts.join("\n");
  } */

  getCriteria() {
    return this.promptCriteria;
  }
}
