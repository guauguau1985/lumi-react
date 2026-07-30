import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "@/App";
import AppProviders from "@/app/AppShell";
import { AuthProvider } from "@/features/auth/AuthContext";
import { GamificationProvider } from "@/gamification/GamificationContext";
import { LessonComplete } from "@/components/gamification/LessonComplete";
import { StreakFlow } from "@/components/gamification/StreakFlow";
import { LeagueWelcome } from "@/components/gamification/LeagueWelcome";

import "@/shared/styles/index.css";

const rootElement = document.getElementById("root") as HTMLElement;

createRoot(rootElement).render(
  <HashRouter>
    <AuthProvider>
      <GamificationProvider>
        <AppProviders>
          <App />
        </AppProviders>
        <LessonComplete />
        <StreakFlow />
        <LeagueWelcome />
      </GamificationProvider>
    </AuthProvider>
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
