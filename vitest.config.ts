/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom", // Changed from node to jsdom for React component testing
    setupFiles: ["./src/test/setup.ts"], // Will create this file next
    include: ["**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      exclude: ["node_modules/", "dist/", "**/*.d.ts", "**/*.config.{js,ts}", "**/setup.{js,ts}"],
      thresholds: {
        // Setting reasonable thresholds as per guidelines
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
    typecheck: {
      enabled: true, // Enable TypeScript type checking in tests
    },
  },
});
