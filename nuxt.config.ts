import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  css: ["@/assets/css/tailwind.css"],
  devtools: { enabled: true },
  plugins: ["~/plugins/axios.ts"],
  modules: ["@nuxtjs/tailwindcss"],
});
