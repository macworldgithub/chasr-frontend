import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/auth": {
        target: "https://chasr-backend.omnisuiteai.com",
        changeOrigin: true,
      },
      "/integrations": {
        target: "https://chasr-backend.omnisuiteai.com",
        changeOrigin: true,
      },
      "/webhooks": {
        target: "https://chasr-backend.omnisuiteai.com",
        changeOrigin: true,
      },
    },
  },
});
