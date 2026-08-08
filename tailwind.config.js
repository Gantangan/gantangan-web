/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F1EDE4",
        ink: "#2A2620",
        inkSoft: "#3D3527",
        gold: "#D9A441",
        goldDeep: "#B8860B",
        card: "#FBF9F5",
        border: "#D8D0C0",
        muted: "#8A8272",
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
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};
