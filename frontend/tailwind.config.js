/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F0E",
        panel: "#151A19",
        card: "#1A211F",
        border: "#262E2C",
        gold: "#D4AF6A",
        emerald: "#4E9B7A",
        mint: "#7FBFA0",
        rose: "#D9776C",
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
