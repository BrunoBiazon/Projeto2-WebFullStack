import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import perfectExpressSanitizer from "perfect-express-sanitizer"; // ✔ biblioteca correta

import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import foodsRoutes from "./src/routes/foods.js";

const app = express();

app.use(cors());
app.use(express.json());

// medidas segurança - sanitização de entradas
app.use((req, res, next) => {
  perfectExpressSanitizer.sanitize.prepareSanitize(req.body,  { xss: true, noSql: true, sql: true });
  perfectExpressSanitizer.sanitize.prepareSanitize(req.query, { xss: true, noSql: true, sql: true });
  perfectExpressSanitizer.sanitize.prepareSanitize(req.params,{ xss: true, noSql: true, sql: true });
  next();
});

app.get("/", (req, res) => {
  res.json({ ok: true, message: "API backend funcionando" });
});
app.use("/auth", authRoutes);
app.use("/foods", foodsRoutes);

const PORT = Number(process.env.PORT || 3001);

async function start() {
  try {
    console.log("-> iniciando connectDB()...");
    await connectDB();
    console.log("-> connectDB() finalizado com sucesso");

    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT} (PID ${process.pid})`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Erro: porta ${PORT} já está em uso.`);
      } else {
        console.error("Server error:", err);
      }
    });

    process.on("unhandledRejection", (reason, p) => {
      console.error("Unhandled Rejection at Promise", p, "reason:", reason);
    });

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception thrown:", err);
    });

    return server;
  } catch (err) {
    console.error("Erro ao iniciar servidor:", err);
    process.exit(1);
  }
}

start();
