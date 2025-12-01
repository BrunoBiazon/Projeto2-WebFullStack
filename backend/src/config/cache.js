class Cache {
  constructor() {
    this.store = new Map();
  }

  set(key, value) {
    try {
      const raw = typeof value === "string" ? value : JSON.stringify(value);
      this.store.set(String(key), raw);
    } catch (err) {
      console.warn("[Cache.set] erro:", err);
    }
  }

  get(key) {
    try {
      if (!this.store.has(String(key))) return null;
      const raw = this.store.get(String(key));
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    } catch (err) {
      console.warn("[Cache.get] erro:", err);
      return null;
    }
  }

  flushAll() {
    this.store.clear();
  }

  _foodKey(titleOrObjOrCode) {
    try {
      let raw = "";

      if (titleOrObjOrCode == null) {
        raw = "";
      } else if (typeof titleOrObjOrCode === "string") {
        raw = titleOrObjOrCode;
      } else if (typeof titleOrObjOrCode === "object") {
        raw =
          titleOrObjOrCode.title ||
          titleOrObjOrCode.name ||
          titleOrObjOrCode.nome ||
          titleOrObjOrCode.code ||
          "";
      } else {
        raw = String(titleOrObjOrCode);
      }

      raw = String(raw).trim();
      if (!raw) return "food:__UNKNOWN__";

      let key = raw.toUpperCase();
      key = key.replace(/\s+/g, "_");
      key = key.replace(/[:\\/]/g, "");
      key = key.replace(/[^\w\-_.]/g, "");
      return `food:${key}`;
    } catch (err) {
      console.warn("[Cache._foodKey] erro:", err);
      return "food:__ERROR__";
    }
  }

  setFood(food) {
    if (!food) return;
    const key = this._foodKey(food);
    this.set(key, food);
  }

  getFoodExact(titleOrCodeOrObj) {
    if (!titleOrCodeOrObj) return null;
    const key = this._foodKey(titleOrCodeOrObj);
    return this.get(key);
  }

  getAllFoods() {
    const arr = [];
    for (const [key, raw] of this.store.entries()) {
      if (typeof key === "string" && key.startsWith("food:")) {
        try { arr.push(JSON.parse(raw)); } catch { arr.push(raw); }
      }
    }
    return arr;
  }
}

const cache = new Cache();
export default cache;
