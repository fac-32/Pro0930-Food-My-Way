export class RecipeOptionsManager {
  constructor({
    dietarySelect,
    foodGroupSelect,
    adjustmentRadios,
    targetIngredientSelect,
    generateRecipeBtn,
  }) {
    this.dietarySelect = dietarySelect;
    this.foodGroupSelect = foodGroupSelect;
    this.adjustmentRadios = adjustmentRadios;
    this.targetIngredientSelect = targetIngredientSelect;
    this.generateRecipeBtn = generateRecipeBtn;

    this.promptCriteria = this._createDefaultCriteria();
    this._setupListeners();
  }

  _createDefaultCriteria() {
    return {
      dietary: null,
      foodGoal: null,
      substitution: null,
    };
  }

  _getSelectedAdjustment() {
    return (
      Array.from(this.adjustmentRadios).find((radio) => radio.checked)?.value ||
      "increase"
    );
  }

  _updateFoodGoal() {
    const foodGroup = this.foodGroupSelect.value;
    if (!foodGroup) {
      this.promptCriteria.foodGoal = null;
      return;
    }

    const adjustment = this._getSelectedAdjustment();
    const prefix = adjustment === "increase" ? "Increase" : "Decrease";
    this.promptCriteria.foodGoal = `${prefix} ${foodGroup}`;
  }

  _setupListeners() {
    this.dietarySelect.addEventListener("change", () => {
      const selected = Array.from(this.dietarySelect.selectedOptions).map(
        (option) => option.value
      );
      this.promptCriteria.dietary = selected.length > 0 ? selected : null;
    });

    this.foodGroupSelect.addEventListener("change", () => {
      this._updateFoodGoal();
    });

    this.adjustmentRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this._updateFoodGoal();
      });
    });

    this.targetIngredientSelect.addEventListener("change", () => {
      const ingredient = this.targetIngredientSelect.value;
      this.promptCriteria.substitution = ingredient || null;
    });
  }

  getCriteria() {
    return this.promptCriteria;
  }

  resetCriteria() {
    this.promptCriteria = this._createDefaultCriteria();
  }
}
