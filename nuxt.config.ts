import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  css: ["@/assets/css/tailwind.css"],
  devtools: { enabled: true },
  plugins: ["~/plugins/axios.ts", "~/plugins/actioncable.ts"],
  modules: ["@nuxtjs/tailwindcss"],
  build: {
    transpile: ["@nuxtjs/tailwindcss"],
  },
  runtimeConfig: {
    public: {
      NUXT_ENV_ENCRYPTION_KEY: process.env.NUXT_ENV_ENCRYPTION_KEY || "",
      apiUrl: process.env.API_URL || "https://demochat-api.fly.dev",
    },
  },
  devServer: {
    port: parseInt(process.env.FRONT_PORT || "8080"),
    host: "0.0.0.0",
  },
});
