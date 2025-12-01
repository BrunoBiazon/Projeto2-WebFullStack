import React, { useState } from "react";
import { registerUser } from "../contexts/api";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const validate = () => {
    if (!username || !username.trim()) return "username é obrigatório";
    if (!password || !password.trim()) return "password é obrigatório";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "email inválido";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const payload = { username: username.trim(), password: password, email: email.trim() || undefined };
    setBusy(true);
    try {
      const res = await registerUser(payload);
      setSuccess("Registrado com sucesso. Faça login.");
      setUsername(""); setEmail(""); setPassword("");
    } catch (err) {
      console.error("[register] erro:", err);
      const msg = String(err?.message || err || "Erro ao registrar");
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-container register">
      <h2>Registrar</h2>

      <form onSubmit={handleSubmit} noValidate className="register-form">
        <div className="form-row-vertical">
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={busy}
            autoComplete="username"
          />
        </div>

        <div className="form-row-vertical">
          <TextField
            fullWidth
            label="Email (opcional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            autoComplete="email"
          />
        </div>

        <div className="form-row-vertical">
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            autoComplete="new-password"
          />
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <div className="form-actions-row">
          <Button type="submit" variant="contained" color="primary" disabled={busy}>
            {busy ? "Registrando..." : "Registrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
