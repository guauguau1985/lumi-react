import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import AppProviders from "@/app/AppShell"
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <AppProviders>
      <App />
    </AppProviders>
  </HashRouter>
);
