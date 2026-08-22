import js from "@eslint/js"
import tanstackQuery from "@tanstack/eslint-plugin-query"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  globalIgnores([
    ".agents",
    "coverage",
    "dist",
    "playwright-report",
    "storybook-static",
    "test-results",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      tanstackQuery.configs["flat/recommended"],
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "react-hooks/incompatible-library": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}", "src/routes/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
])
