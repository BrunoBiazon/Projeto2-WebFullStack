import React, { useContext } from "react";
import { FoodContext } from "../contexts/FoodContext";
import { searchFood } from "../contexts/api";
import FoodTable from "./tabela";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export default function App() {
  const { state, dispatch } = useContext(FoodContext);

  const handleSearch = async () => {
    if (!state.query || !state.query.trim()) {
      dispatch({ type: "SEARCH_ERROR", payload: "Digite algo para pesquisar." });
      return;
    }

    dispatch({ type: "SEARCH_START" });

    const timeoutMs = 8000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), timeoutMs);
    });

    try {
      console.log("[search] iniciando busca por:", state.query);

      const p = searchFood(state.query);
      const res = await Promise.race([p, timeoutPromise]);

      console.log("[search] resposta raw:", res);
      let normalized;

      if (Array.isArray(res)) {
        normalized = {
          source: "off",
          items: res,
          meta: { total: res.length, page: 1, limit: res.length },
        };
      } else {
        const itemsFromItems = Array.isArray(res.items) ? res.items : null;
        const itemsFromData = Array.isArray(res.data) ? res.data : null;
        const items = itemsFromItems ?? itemsFromData ?? [];

        const itemsWithSource = items.map((it) => ({
          ...it,
          source: it.source ?? it._origin ?? "db", 
          name: it.name ?? it.product_name ?? it.title ?? "",
        }));

        const origin = itemsFromItems || itemsFromData ? "backend" : "off";

        normalized = {
          source: origin,
          items: itemsWithSource,
          meta: res.meta ?? {
            total: res.total ?? itemsWithSource.length,
            page: res.page ?? 1,
            limit: res.limit ?? 20,
          },
        };
      }

      if (!normalized.items || normalized.items.length === 0) {
        dispatch({ type: "SEARCH_ERROR", payload: "Nenhum resultado encontrado." });
        return;
      }

      dispatch({ type: "SEARCH_SUCCESS", payload: normalized });

      console.log(
        "[search] sucesso:",
        normalized.items.length,
        "items (source:",
        normalized.source,
        ")"
      );
    } catch (err) {
      console.error("[search] erro:", err);

      if (err?.message === "timeout") {
        dispatch({ type: "SEARCH_ERROR", payload: "Serviço demorou muito. Tente novamente." });
        return;
      }

      const msgText = String(err?.message || err || "").toLowerCase();
      if (msgText === "unauthorized" || msgText.includes("401") || msgText.includes("token")) {
        dispatch({ type: "SEARCH_ERROR", payload: "Entre em alguma conta para consultar." });
      } else {
        dispatch({ type: "SEARCH_ERROR", payload: "Erro ao buscar alimentos." });
      }

      dispatch({ type: "SEARCH_CLEAR" });
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Buscar Alimentos</h1>

      <div className="search-row">
        <TextField
          className="search-input"
          label="Pesquisar alimento"
          variant="outlined"
          value={state.query}
          onChange={(e) => dispatch({ type: "SET_QUERY", payload: e.target.value })}
          fullWidth
        />
        <Button
          className="search-button"
          variant="contained"
          color="primary"
          onClick={handleSearch}
        >
          Buscar
        </Button>
      </div>

      {state.loading && <p className="loading">Carregando...</p>}
      {state.error && <p className="error">{state.error}</p>}
      {state.source && (
        <p className="source-note">
          <strong>Alimentos Encontrados:</strong>
        </p>
      )}

      <div className="table-wrapper">
        <FoodTable foods={state.foods} tableBg="#e0e0e0" />
      </div>
    </div>
  );
}
