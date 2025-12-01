import React, { useState } from "react";
import { postFood } from "../contexts/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AddFood() {
  const [nome, setNome] = useState("");
  const [calorias, setCalorias] = useState("");
  const [carboidratos, setCarboidratos] = useState("");
  const [proteina, setProteina] = useState("");
  const [gordura, setGordura] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!token) {
      setMsg({ type: "error", text: "Faça login para adicionar alimentos." });
      return;
    }
    if (!nome || nome.trim().length < 3) {
      setMsg({ type: "error", text: "O nome deve ter pelo menos 3 caracteres." });
      return;
    }

    const payload = {
      name: nome.trim(),
      calories: Number(calorias) || 0,
      carbohydrates: Number(carboidratos) || 0,
      protein: Number(proteina) || 0,
      fat: Number(gordura) || 0,
      source: "usuario",
    };

    try {
      setLoading(true);
      await postFood(payload);
      setMsg({ type: "success", text: "Alimento adicionado com sucesso!" });
      setNome(""); setCalorias(""); setCarboidratos(""); setProteina(""); setGordura("");
      setTimeout(() => navigate("/"), 700);
    } catch (err) {
      console.error("[AddFood] erro:", err);
      let text = err?.message || "Erro ao adicionar alimento.";
      const body = err && err.body ? err.body : null;
      if (body) {
        if (Array.isArray(body.errors) && body.errors.length > 0) {
          text = body.errors.map(it => it.msg || it.message || it.mensagem || JSON.stringify(it)).join("; ");
        } else if (Array.isArray(body.erros) && body.erros.length > 0) {
          text = body.erros.map(it => it.msg || it.mensagem || JSON.stringify(it)).join("; ");
        } else if (body.error || body.message) {
          text = body.error || body.message;
        } else {
          try { text = JSON.stringify(body); } catch {}
        }
      }
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-food-container">
      <h2 className="add-food-title">Adicionar Alimento</h2>

      <form className="add-food-form" onSubmit={handleSubmit}>
        <label className="form-label">Nome do alimento</label>
        <input className="form-input" placeholder="Exemplo: Arroz branco" value={nome} onChange={(e) => setNome(e.target.value)} required />

        <div className="form-row">
          <div className="form-col">
            <label className="form-label">Calorias (por 100g)</label>
            <input className="form-input" value={calorias} onChange={(e) => setCalorias(e.target.value)} />
          </div>
          <div className="form-col">
            <label className="form-label">Carboidratos (g)</label>
            <input className="form-input" value={carboidratos} onChange={(e) => setCarboidratos(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <label className="form-label">Proteína (g)</label>
            <input className="form-input" value={proteina} onChange={(e) => setProteina(e.target.value)} />
          </div>
          <div className="form-col">
            <label className="form-label">Gordura (g)</label>
            <input className="form-input" value={gordura} onChange={(e) => setGordura(e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="app-button" disabled={loading}>{loading ? "Enviando..." : "Adicionar"}</button>
        </div>

        {msg && <div className={msg.type === "error" ? "error" : "success"} style={{ marginTop: 12 }}>{msg.text}</div>}
      </form>
    </div>
  );
}
