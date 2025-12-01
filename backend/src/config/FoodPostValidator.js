import Cache from "../config/cache.js";

class FoodPostValidator {
  static instance = null;

  static getInstance() {
    if (!FoodPostValidator.instance) {
      FoodPostValidator.instance = new FoodPostValidator();
    }
    return FoodPostValidator.instance;
  }

  async validate(food = {}) {
    const errors = [];

    const nome = (food.title || food.name || food.nome || "").toString().trim();

    await this._validateTitle(nome, errors);
    this._validateCalories(food.calorias ?? food.calories, errors);

    const nutriments = food.nutriments || {
      carbohydrates: food.carboidratos ?? food.carbohydrates,
      protein: food.proteina ?? food.protein,
      fat: food.gordura ?? food.fat,
    };
    this._validateNutriments(nutriments, errors);

    const mapped = errors.map((e) => {
      const field = e.field || e.campo || "unknown";
      const value = e.value !== undefined ? e.value : e.valor;
      const ptMsg = e.msg || e.mensagem || String(e.message || "Erro");
      const enMsg = e.message || e.msg || String(e.message || "Error");
      return {
        field,
        value,
        msg: ptMsg,
        message: enMsg,
        campo: field,
        valor: value,
        mensagem: ptMsg,
      };
    });

    const ok = mapped.length === 0;
    return {
      valid: ok,
      errors: mapped,
      valido: ok,
      erros: mapped,
    };
  }

  async _validateTitle(nome, errors) {
    if (!nome || nome.toString().trim().length < 2) {
      errors.push({
        field: "title",
        value: nome,
        msg: "Nome muito curto",
        message: "Title too short",
      });
      return;
    }

    const cached = Cache.getFoodExact(nome);
    if (cached) {
      errors.push({
        field: "title",
        value: nome,
        msg: "Este alimento já está cadastrado",
        message: "Food already exists",
      });
    }
  }

  _validateCalories(calorias, errors) {
    if (calorias != null && isNaN(Number(calorias))) {
      errors.push({
        field: "calories",
        value: calorias,
        msg: "Calorias deve ser um número",
        message: "Calories must be a number",
      });
    }
  }

  _validateNutriments(nutriments = {}, errors) {
    if (!nutriments) return;
    const keys = [
      { key: "carbohydrates", pt: "carboidratos" },
      { key: "protein", pt: "proteina" },
      { key: "fat", pt: "gordura" },
    ];

    for (const k of keys) {
      const val = nutriments[k.key] ?? nutriments[k.pt];
      if (val != null && isNaN(Number(val))) {
        errors.push({
          field: k.key,
          value: val,
          msg: `O nutriente ${k.pt} deve ser numérico`,
          message: `${k.key} must be numeric`,
        });
      }
    }
  }
}

export default FoodPostValidator;
