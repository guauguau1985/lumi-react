import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 👇 MUY IMPORTANTE para GitHub Pages de un repo llamado "lumi-react"
export default defineConfig({
  base: "/lumi-react/",       // <-- este es el fix
  plugins: [react()],
});
