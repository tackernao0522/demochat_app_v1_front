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
      apiUrl:
        process.env.NODE_ENV === "production"
          ? "https://demochat-api.fly.dev"
          : "http://localhost:3000",
    },
  },
});
