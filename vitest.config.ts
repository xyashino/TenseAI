import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // @ts-expect-error - Vite plugin type mismatch between versions
  plugins: [react()],
  test: {
    environment: "jsdom",

    setupFiles: ["./tests/setup/vitest.setup.ts"],

    include: ["tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".astro"],

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        ".astro/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types.ts",
        "**/database.types.ts",
        "**/*.astro",
      ],
    },

    globals: true,

    typecheck: {
      tsconfig: "./tsconfig.json",
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
