import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Listen on all interfaces (IPv4 + IPv6): VS Code forwards "localhost:5173" to ::1.
    host: true,
    allowedHosts: [".devtunnels.ms", ".trycloudflare.com"],
    // Dev proxy: web calls /api/v1/master and /api/v1/ai on its own origin (see .env),
    // forward them to the api-gateway so one forwarded port (5173) is enough over a tunnel.
    proxy: {
      "/api": {
        target: "http://localhost:8400",
        changeOrigin: true,
        // /api/v1/ai/ingestion/events is a WebSocket (ingestion progress frames).
        ws: true,
        // The browser sees /api as same-origin, but the gateway's CORS filter
        // compares Origin (the tunnel URL) to Host and would 403 it.
        configure: (proxy) => {
          proxy.on("proxyReq", (req) => req.removeHeader("origin"))
          proxy.on("proxyReqWs", (req) => req.removeHeader("origin"))
        },
      },
    },
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
