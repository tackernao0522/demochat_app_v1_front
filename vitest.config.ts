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
    testTimeout: 30000, // タイムアウト時間を30秒に延長
    hookTimeout: 30000, // フックのタイムアウト時間も30秒に設定
    maxConcurrency: 1, // 同時実行テスト数を1に制限
    maxThreads: 1, // 最大スレッド数を1に制限
    minThreads: 1, // 最小スレッド数を1に設定
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
