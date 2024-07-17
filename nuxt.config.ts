import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  css: [
    "@fortawesome/fontawesome-svg-core/styles.css",
    "@/assets/css/tailwind.css",
  ],
  devtools: { enabled: true },
  plugins: [
    "~/plugins/fontawesome.ts",
    "~/plugins/axios.ts",
    "~/plugins/actioncable.ts",
  ],
  modules: ["@nuxtjs/tailwindcss"],
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
  runtimeConfig: {
    public: {
      NUXT_ENV_ENCRYPTION_KEY: process.env.NUXT_ENV_ENCRYPTION_KEY || "",
      apiUrl: process.env.API_URL || "https://demochat-api.fly.dev",
      nodeEnv: process.env.NODE_ENV || "development",
      logLevel: process.env.LOG_LEVEL || "debug",
    },
    basicAuthUser: process.env.BASIC_AUTH_USER || "",
    basicAuthPassword: process.env.BASIC_AUTH_PASSWORD || "",
  },
  router: {
    middleware: ["basic-auth"],
  },
  devServer: {
    port: parseInt(process.env.FRONT_PORT || "8080"),
    host: "0.0.0.0",
  },
});
