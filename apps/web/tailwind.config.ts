import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          green: "#00ff88",
          purple: "#9945ff",
          red: "#ff3d3d",
          gold: "#ffd700",
          cyan: "#00d4ff",
        },
        degen: {
          bg: "#0a0a0f",
          card: "#111118",
          border: "#1e1e2e",
          muted: "#2a2a3a",
        },
      },
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
        display: ["'Arial Black'", "Impact", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        glitch: "glitch 0.5s steps(1) infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(0,255,136,0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(0,255,136,0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(2px, -2px)" },
          "60%": { transform: "translate(-2px, 0)" },
          "80%": { transform: "translate(2px, 0)" },
          "100%": { transform: "translate(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
