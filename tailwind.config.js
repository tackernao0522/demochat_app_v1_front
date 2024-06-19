module.exports = {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      maxWidth: {
        custom: "960px",
      },
      boxShadow: {
        custom: "2px 4px 6px rgba(28, 6, 49, 0.1)",
      },
      colors: {
        bodyBg: "#51b392",
        bodyText: "#444444",
      },
    },
  },
  variants: {},
  plugins: [],
};
