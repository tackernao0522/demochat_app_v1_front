import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  // スタイルシートの設定
  css: [
    "@fortawesome/fontawesome-svg-core/styles.css",
    "@/assets/css/tailwind.css",
  ],

  // 開発ツールの有効化
  devtools: { enabled: true },

  // プラグインの設定
  plugins: [
    "~/plugins/fontawesome.ts",
    "~/plugins/axios.ts",
    "~/plugins/actioncable.ts",
  ],

  // モジュールの設定
  modules: ["@nuxtjs/tailwindcss"],

  // ビルド設定
  build: {
    transpile: ["@nuxtjs/tailwindcss"],
    terser: {
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production",
        },
      },
    },
  },

  // ランタイム設定
  runtimeConfig: {
    basicAuthUser: process.env.BASIC_AUTH_USER as string,
    basicAuthPassword: process.env.BASIC_AUTH_PASSWORD as string,
    public: {
      NUXT_ENV_ENCRYPTION_KEY: process.env.NUXT_ENV_ENCRYPTION_KEY || "",
      apiUrl: process.env.API_URL || "https://demochat-api.fly.dev",
      nodeEnv:
        (process.env.NODE_ENV as "development" | "production" | "test") ||
        "development",
      logLevel:
        (process.env.LOG_LEVEL as "debug" | "info" | "warn" | "error") ||
        "debug",
    },
  },

  // 開発サーバーの設定
  devServer: {
    port: parseInt(process.env.FRONT_PORT || "8080"),
    host: "0.0.0.0",
  },

  // Nitroの設定
  nitro: {
    preset: "vercel",
  },

  // サーバーサイドレンダリングの有効化
  ssr: true,

  // 実験的機能の設定
  experimental: {
    payloadExtraction: false,
  },

  // 互換性の日付設定（プロジェクトの開始日または現在の日付に更新してください）
  compatibilityDate: "2024-03-18",
});
