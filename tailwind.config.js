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
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".rotate-90": {
          transform: "rotate(90deg)",
        },
        ".transform-origin-left-top": {
          transformOrigin: "left top",
        },
        ".absolute-position": {
          position: "absolute",
        },
        ".hidden-overflow-x": {
          overflowX: "hidden",
        },
        ".full-height": {
          height: "100vw",
        },
        ".full-width": {
          width: "100vh",
        },
      };

      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
