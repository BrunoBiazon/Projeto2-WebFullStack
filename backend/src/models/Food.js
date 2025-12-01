import mongoose from "mongoose";

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  calories: { type: Number, default: 0 },
  carbohydrates: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  source: { type: String, default: "manual" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }
}, { timestamps: true });

export default mongoose.model("Food", FoodSchema);
