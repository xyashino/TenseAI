// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: {
    port: Number.parseInt(import.meta.env.PORT || "3000"),
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      force: false,
    },
  },
  adapter: node({
    mode: "standalone",
  }),
});
