/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1F1C",
        panel: "#102B25",
        border: "#1E4038",
        gold: "#C9A24B",
        mint: "#7FBFA0",
        rose: "#C45A50",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
