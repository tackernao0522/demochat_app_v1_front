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
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      // Nuxtの内部モジュールへのエイリアス
      "#app": resolve(__dirname, "./node_modules/nuxt/dist/app"),
      // プロジェクトのルートディレクトリへのエイリアス
      "@": resolve(__dirname, "."),
      "~": resolve(__dirname, "."),
      // Nuxtの自動生成ファイルへのエイリアス
      "#imports": resolve(__dirname, ".nuxt/imports.d.ts"),
      "#build": resolve(__dirname, ".nuxt"),
      // Vue 2/3互換性のためのエイリアス
      "vue-demi": resolve(
        __dirname,
        "node_modules/nuxt/dist/app/compat/vue-demi"
      ),
      // コンソールログライブラリのエイリアス
      consola: resolve(__dirname, "node_modules/consola/dist/index.mjs"),
    },
  },
});
