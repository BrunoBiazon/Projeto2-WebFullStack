import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../contexts/api";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser({ username, password });
      login(res.token, { username: res.username });
      navigate("/");
    } catch (err) {
      console.error("login error:", err);
      const msg = err?.message || (err && err.error) || "Erro ao logar";
      setError(msg);
    }
  };

  return (
    <div className="auth-container">
      <h2>Entrar</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-row-vertical">
          <input
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-row-vertical">
          <input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions-row">
          <button type="submit" className="app-button submit-button">Entrar</button>
        </div>
      </form>
    </div>
  );
}
