import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "happy-dom",
    silent: false, // 詳細なログを表示
    deps: {
      optimizer: {
        web: {
          include: ["@nuxt/test-utils-edge"],
        },
      },
    },
    reporters: ["default", "verbose"], // 詳細なログを表示
  },
  resolve: {
    alias: {
      "#app": resolve(__dirname, "./node_modules/nuxt/dist/app"),
      "@": resolve(__dirname, "."),
      "~": resolve(__dirname, "."),
    },
  },
});
