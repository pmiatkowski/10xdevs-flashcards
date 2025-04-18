// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  experimental: {
    session: true, // Enable experimental sessions
  },
  integrations: [
    react({
      include: ["**/*.tsx", "**/*.jsx"],
      ssr: false, // Disable SSR for React components when deploying to Cloudflare
    }),
    sitemap(),
  ],
  server: { port: 3001 },
  vite: {
    resolve: {
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      },
    },
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: [
          "vitest",
          "**/*.test.ts",
          "**/*.test.tsx",
          "**/*.spec.ts",
          "**/*.spec.tsx",
          "**/__tests__/**",
          "**/tests/**",
        ],
      },
    },
  },
  adapter: cloudflare({
    runtime: {
      mode: "off",
      type: "pages",
    },
    imageService: "compile",
    functionPerRoute: true,
  }),
});
