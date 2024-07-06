import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "happy-dom",
    deps: {
      inline: ["@nuxt/test-utils-edge"],
    },
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "#app": resolve(__dirname, "./node_modules/nuxt/dist/app"),
      "@": resolve(__dirname, "."),
      "~": resolve(__dirname, "."),
      "#imports": resolve(__dirname, ".nuxt/imports.d.ts"),
    },
  },
});
