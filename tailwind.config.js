/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F1EDE4",
        ink: "#0A0A0A",
        inkSoft: "#1A1A1A",
        gold: "#D9A441",
        goldDeep: "#B8860B",
        card: "#141414",
        border: "#2A2A2A",
        muted: "#8A8A8A",
        bg: "#0A0A0A",
        text: "#F1EDE4",
        textSoft: "#B8B8B8",
        statusKosong: "#22C55E",
        statusPending: "#EAB308",
        statusVerifikasi: "#3B82F6",
        statusTerisi: "#EF4444",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 14s linear infinite",
      },
    },
  },
  plugins: [],
};
