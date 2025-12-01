import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="profile-menu" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="profile-button" aria-haspopup="true" aria-expanded={open}>
        <span className="profile-avatar">{user?.username ? user.username.charAt(0).toUpperCase() : "U"}</span>
        <span className="profile-username">{user?.username || "Usuário"}</span>
        <span className="profile-arrow">▾</span>
      </button>

      {open && (
        <div className="profile-dropdown" role="menu">
          <button onClick={() => { setOpen(false); navigate("/AddFood"); }} className="profile-dropdown-item">
            Adicionar Alimento
          </button>

          <button onClick={() => { setOpen(false); onLogout && onLogout(); }} className="profile-dropdown-item">
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
