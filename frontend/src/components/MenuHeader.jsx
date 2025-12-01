import React from "react";
import Tooltip from "@mui/material/Tooltip";
import "./style.css"; 
import { useAuth } from "../contexts/AuthContext";
import Login from "./LoginPage";
import AddFood from "./AddFood";

function MenuHeader() {
  return (
    <div className="menu-Header">
      <Tooltip title="Representam a quantidade de energia que o corpo obtém dos alimentos ou gasta nas atividades. o Balanço delas define ganho ou perda de peso(Déficit calórico , Superávit calórico).">
        <div className="menu-item">Calorias</div>
      </Tooltip>

      <Tooltip title="Principal fonte de energia rápida para o corpo e o cérebro. São convertidos em glicose para manter funções vitais e atividades do dia a dia.">
        <div className="menu-item">Carboidratos</div>
      </Tooltip>

      <Tooltip title="Responsáveis pela construção e reparo dos tecidos, incluindo músculos, pele e órgãos. Também participam da produção de enzimas e hormônios.">
        <div className="menu-item">Proteínas</div>
      </Tooltip>

      <Tooltip title="Fornecem energia de longa duração, ajudam na absorção de vitaminas (A, D, E e K) e protegem órgãos vitais. Também participam de funções hormonais.">
        <div className="menu-item">Gorduras</div>
      </Tooltip>
      <Tooltip title="API">
      <div className="menu-item" onClick={() => window.location.href = "https://world.openfoodfacts.org"}>API</div>
    </Tooltip>

    </div>
  );
}

export default MenuHeader;
