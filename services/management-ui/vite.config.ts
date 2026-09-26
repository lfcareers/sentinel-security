import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const apiTarget = "http://localhost:8080"

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    proxy: {
      "/api": { target: apiTarget, changeOrigin: false },
      "/oauth2": { target: apiTarget, changeOrigin: false },
      "/login": { target: apiTarget, changeOrigin: false },
      "/logout": { target: apiTarget, changeOrigin: false },
    },
  },
})