// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import './index.css';

// Función para inicializar Telegram WebApp de manera segura
const initializeTelegramWebApp = () => {
  try {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
  } catch (error) {
    console.warn('Telegram WebApp no está disponible:', error);
  }
};

// Inicializar Telegram WebApp
initializeTelegramWebApp();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
