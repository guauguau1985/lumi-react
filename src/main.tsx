import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "./App";
import AppProviders from "@/app/AppShell";
import { GamificationProvider } from "./gamification/GamificationContext";

import "./styles/global.css";

const rootElement = document.getElementById("root") as HTMLElement;

createRoot(rootElement).render(
  <HashRouter>
    <GamificationProvider>
      <AppProviders>
        <App />
      </AppProviders>
    </GamificationProvider>
  </HashRouter>
);

// 🔧 Registro del Service Worker para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;

    navigator.serviceWorker
      .register(swUrl)
      .catch((err) => console.error("Error registrando service worker:", err));
  });
}
