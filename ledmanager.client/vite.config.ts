import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "^/api": {
        target: "https://localhost:7245",
        secure: false,
        changeOrigin: true,
      },
      "/uploads/": {
        target: "https://localhost:7245",
        secure: false,
        changeOrigin: true,
      },
      "/neon-backgrounds/": {
        target: "https://localhost:7245",
        secure: false,
        changeOrigin: true,
      },
      "/system/": {
        target: "https://localhost:7245",
        secure: false,
        changeOrigin: true,
      },
      "/content/": {
        target: "https://localhost:7245",
        secure: false,
        changeOrigin: true,
      },
      "/brands/": {
        target: "https://localhost:7245",
        secure: false,
        changeOrigin: true,
      },
      "/banners-video/": {
        target: "https://localhost:7245",
        secure: false,
        changeOrigin: true,
      },
      "/banners/": {
        target: "https://localhost:7245",
        secure: false,
        changeOrigin: true,
      },
      "/thumbnails/": {
        target: "https://localhost:7245",
        secure: false,
        changeOrigin: true,
      },
    },
    port: 58088,
  },
});
