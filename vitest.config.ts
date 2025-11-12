import { getViteConfig } from "astro/config";
import path from "path";
import { defineConfig } from "vitest/config";

export default getViteConfig(
  defineConfig({
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

    server: {
      fs: {
        allow: [".."],
      },
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
);
