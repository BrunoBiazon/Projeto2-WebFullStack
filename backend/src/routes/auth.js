import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST registor
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username e password obrigatórios" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await User.create({ username, passwordHash, email });

    return res.json({ ok: true, username });
  } catch (err) {
    console.error("[auth/register]", err);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// POST login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username e password obrigatórios" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Senha inválida" });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token, username });
  } catch (err) {
    console.error("[auth/login]", err);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

export default router;
