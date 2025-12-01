import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ProfileMenu from "./ProfileMenu";

export default function Header() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  function goHome() {
    navigate("/");
  }

  return (
    <header className="header">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1100,
          margin: "auto",
          padding: "8px 12px",
        }}
      >
        <div
          onClick={goHome}
          style={{
            fontWeight: "bold",
            fontSize: 18,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          Saiba o Macros
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!token ? (
            <>
              <button
                className="app-button"
                style={{ marginRight: 8 }}
                onClick={() => navigate("/login")}
              >
                Entrar
              </button>

              <button
                className="app-button"
                onClick={() => navigate("/register")}
              >
                Registrar
              </button>
            </>
          ) : (
            <>
              {/* ProfileMenu exibe avatar inicial + username + menu com Sair */}
              <ProfileMenu user={user} onLogout={() => { logout(); navigate("/"); }} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
