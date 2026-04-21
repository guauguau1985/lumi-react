import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwind from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/lumi-react/",

  plugins: [
    react(),
    tsconfigPaths(),
    tailwind(),

    VitePWA({
      registerType: "autoUpdate",

      workbox: {
        navigateFallback: "/lumi-react/index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp}"],
      },

      includeAssets: [
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/maskable-512.png",
        "offline.html",
        "sw.js",
      ],

      manifest: {
        name: "Lumi - aprendo a mi ritmo",
        short_name: "Lumi App",
        description:
          "Juegos de matemáticas, programación y ecología para niños, con Lumi.",
        start_url: "/lumi-react/#/",
        scope: "/lumi-react/",
        display: "standalone",
        orientation: "landscape",

        background_color: "#F9FCF2",
        theme_color: "#F9FCF2",

        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});