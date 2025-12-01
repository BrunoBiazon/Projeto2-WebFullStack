import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './style.css';

import Header from "../components/Header.jsx";
import MenuHeader from "../components/MenuHeader.jsx";
import Footer from "../components/Footer.jsx";

import App from "../components/App.jsx";
import LoginPage from "../components/LoginPage.jsx";
import RegisterPage from "../components/RegisterPage.jsx";
import AddFood from "../components/AddFood.jsx";


import { FoodProvider } from "../contexts/FoodContext";
import { AuthProvider } from "../contexts/AuthContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <FoodProvider>
        <BrowserRouter>
          <Header />
          <MenuHeader />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/AddFood" element={<AddFood />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </FoodProvider>
    </AuthProvider>
  </React.StrictMode>
);
