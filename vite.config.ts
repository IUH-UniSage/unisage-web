import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: [".trycloudflare.com"],
    proxy: {
      "/api": {
        target: "http://localhost:8400",
        changeOrigin: true,
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
