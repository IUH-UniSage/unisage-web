import process from "node:process"
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],
  webServer: {
    // Must be "localhost:5173" exactly (not 127.0.0.1, not another port) -
    // the gateway's CORS allowlist (unisage-gateway's
    // CORS_ALLOWED_ORIGINS/allowedOriginPatterns) only permits
    // http://localhost:3000 and http://localhost:5173 by default; any other
    // origin gets its /auth/refresh call CORS-blocked, silently logging the
    // session out and redirecting every test to /login.
    command: "pnpm run dev -- --port 5173",
    reuseExistingServer: !process.env.CI,
    url: "http://localhost:5173",
  },
})
