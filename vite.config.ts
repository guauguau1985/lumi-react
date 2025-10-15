export default defineConfig({
  base: "/lumi-react/",   // <-- Debe coincidir con el nombre del repo
  plugins: [
    react(),
    tsconfigPaths(),
    tailwind(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png","icons/icon-512.png"],
      manifest: {
        name: "Lumi App",
        short_name: "Lumi",
        start_url: "/lumi-react/#/",
        scope: "/lumi-react/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#78c077",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        navigateFallback: "/lumi-react/index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,webp}"],
      },
    })
  ],
});
