import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16181D",
        panel: "#1F2229",
        card: "#1F2229",
        border: "#2A2E36",
        gold: "#D4AF37",
        mint: "#3DDC84",
        // Merged with Tailwind's default scales so both flat usage
        // (bg-rose, text-rose) AND shaded usage (bg-rose-500/10,
        // text-emerald-400, border-rose-500/30) keep working.
        rose: { DEFAULT: "#EF4444", ...colors.rose },
        emerald: { DEFAULT: "#3DDC84", ...colors.emerald },
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
