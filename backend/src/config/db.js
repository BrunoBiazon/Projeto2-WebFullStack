import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/proj";
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("MongoDB conectado com sucesso");
}
