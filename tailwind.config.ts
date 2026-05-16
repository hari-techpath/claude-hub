import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030712",
      },
      animation: {
        "aurora-1": "aurora1 10s ease-in-out infinite",
        "aurora-2": "aurora2 13s ease-in-out infinite",
        "aurora-3": "aurora3 16s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        aurora1: {
          "0%,100%": { transform: "translate(0%,0%) scale(1)" },
          "33%": { transform: "translate(-12%,8%) scale(1.06)" },
          "66%": { transform: "translate(8%,-12%) scale(0.94)" },
        },
        aurora2: {
          "0%,100%": { transform: "translate(0%,0%) scale(1)" },
          "40%": { transform: "translate(14%,-8%) scale(0.92)" },
          "80%": { transform: "translate(-8%,12%) scale(1.08)" },
        },
        aurora3: {
          "0%,100%": { transform: "translate(0%,0%) scale(1)" },
          "50%": { transform: "translate(-6%,-18%) scale(1.04)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
