import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function FoodTable({ foods = [], hasSearched = false }) {
  const [selectedFood, setSelectedFood] = useState(null);

  let itemsArray = [];
  if (Array.isArray(foods)) {
    itemsArray = foods;
  } else if (foods && typeof foods === "object") {
    itemsArray = Array.isArray(foods.items) ? foods.items : Array.isArray(foods.data) ? foods.data : [];
  } else {
    itemsArray = [];
  }

  function getName(item) {
    return item?.name || item?.product_name || item?.food_name || item?._id || "Sem nome";
  }

  function getCalories(item) {
    if (item?.calories !== undefined && item?.calories !== null && item?.calories !== "N/A")
      return item.calories;
    const n = item?.nutriments || {};
    return (
      n["energy-kcal_100g"] ??
      n["energy-kcal"] ??
      n["energy-kcal_value"] ??
      n["energy_100g"] ??
      n["energy_value"] ??
      item?.energy ??
      "N/A"
    );
  }

  function getCarbs(item) {
    const n = item?.nutriments || {};
    return n["carbohydrates_100g"] ?? n["carbohydrates"] ?? n["carbohydrate"] ?? item?.carbohydrates ?? "N/A";
  }

  function getProtein(item) {
    const n = item?.nutriments || {};
    return n["proteins_100g"] ?? n["proteins"] ?? n["protein"] ?? item?.protein ?? "N/A";
  }

  function getFat(item) {
    const n = item?.nutriments || {};
    return n["fat_100g"] ?? n["fat"] ?? n["fats"] ?? item?.fat ?? "N/A";
  }

  function pretty(value) {
    if (value === undefined || value === null || value === "N/A") return "N/A";
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    return Math.abs(num - Math.round(num)) < 0.05 ? String(Math.round(num)) : String(Number(num.toFixed(1)));
  }

  if (!itemsArray || itemsArray.length === 0) {
    if (hasSearched) {
      return <p style={{ textAlign: "center", color: "#b00" }}>Nenhum alimento encontrado.</p>;
    }
    return null;
  }

  return (
    <>
      <TableContainer component={Paper} className="food-table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="table-head-cell">Nome</TableCell>
              <TableCell align="right" className="table-head-cell">Calorias - Porção(100g)</TableCell>
              <TableCell align="right" className="table-head-cell">Carboidratos (g)</TableCell>
              <TableCell align="right" className="table-head-cell">Proteínas (g)</TableCell>
              <TableCell align="right" className="table-head-cell">Gordura (g)</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {itemsArray.map((food, idx) => {
              const id = food?.food_id || food?._id || food?.id || `${getName(food)}-${idx}`;
              return (
                <TableRow
                  key={id}
                  hover
                  className="table-row"
                  onClick={() => setSelectedFood(food)}
                >
                  <TableCell className="table-cell">{getName(food)}</TableCell>
                  <TableCell align="right" className="table-cell">{pretty(getCalories(food))}</TableCell>
                  <TableCell align="right" className="table-cell">{pretty(getCarbs(food))}</TableCell>
                  <TableCell align="right" className="table-cell">{pretty(getProtein(food))}</TableCell>
                  <TableCell align="right" className="table-cell">{pretty(getFat(food))}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedFood && (
        <div className="modal-overlay" onClick={() => setSelectedFood(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedFood(null)}>Fechar</button>
            <h2 className="modal-title">{getName(selectedFood)}</h2>

            <TableContainer component={Paper} className="food-table-container">
              <Table size="small" className="nutriments-table" aria-label="nutrients">
                <TableHead>
                  <TableRow>
                    <TableCell className="table-head-cell">Nutriente</TableCell>
                    <TableCell align="right" className="table-head-cell">Valor (por 100g)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Calorias (kcal)</TableCell>
                    <TableCell align="right">{pretty(getCalories(selectedFood))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Carboidratos (g)</TableCell>
                    <TableCell align="right">{pretty(getCarbs(selectedFood))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Proteínas (g)</TableCell>
                    <TableCell align="right">{pretty(getProtein(selectedFood))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Gordura (g)</TableCell>
                    <TableCell align="right">{pretty(getFat(selectedFood))}</TableCell>
                  </TableRow>

                  {selectedFood?.nutriments && Object.keys(selectedFood.nutriments).length > 0 && (
                    <>
                      <TableRow>
                        <TableCell colSpan={2} style={{ paddingTop: 12, fontWeight: 700 }}>Outros (raw)</TableCell>
                      </TableRow>

                      {Object.entries(selectedFood.nutriments).map(([k, v]) => (
                        <TableRow key={k}>
                          <TableCell style={{ textTransform: "capitalize" }}>{k}</TableCell>
                          <TableCell align="right">{String(v)}</TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      )}
    </>
  );
}
