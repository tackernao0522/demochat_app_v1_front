import { defineNuxtConfig } from "nuxt/config";
import fs from "fs";
import path from "path";

export default defineNuxtConfig({
  css: ["@/assets/css/tailwind.css"],
  devtools: { enabled: true },
  plugins: ["~/plugins/axios.ts", "~/plugins/actioncable.ts"],
  modules: ["@nuxtjs/tailwindcss"],
  build: {
    transpile: ["@nuxtjs/tailwindcss"],
  },
  server: {
    host: "0.0.0.0",
    port: process.env.NUXT_PORT || 3000,
    https:
      process.env.NODE_ENV === "production"
        ? {
            key: fs.existsSync(path.resolve(__dirname, "server.key"))
              ? fs.readFileSync(path.resolve(__dirname, "server.key"))
              : "",
            cert: fs.existsSync(path.resolve(__dirname, "server.cert"))
              ? fs.readFileSync(path.resolve(__dirname, "server.cert"))
              : "",
          }
        : undefined,
  },
  render: {
    csp:
      process.env.NODE_ENV === "production"
        ? {
            policies: {
              "default-src": ["'self'"],
              "img-src": ["'self'", "data:", "https:"],
              "script-src": ["'self'", "'unsafe-inline'"],
              "style-src": ["'self'", "'unsafe-inline'"],
              "connect-src": ["'self'", "https:"],
            },
          }
        : {},
  },
  runtimeConfig: {
    public: {
      baseURL:
        process.env.NODE_ENV === "production"
          ? "https://demochat-api.fly.dev"
          : "http://localhost:3000",
    },
  },
});
