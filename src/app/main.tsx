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
