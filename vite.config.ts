import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Dev proxy: web calls /api/v1/master and /api/v1/ai on its own origin (see .env),
    // forward them to the api-gateway so one forwarded port (5173) is enough over a tunnel.
    proxy: {
      "/api": {
        target: "http://localhost:8400",
        changeOrigin: true,
        // /api/v1/ai/ingestion/events is a WebSocket (ingestion progress frames).
        ws: true,
      },
    },
    allowedHosts: [".devtunnels.ms"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
    environment: "jsdom",
    exclude: ["e2e/**", "node_modules/**"],
    setupFiles: ["./src/test/setup.ts"],
  },
})
