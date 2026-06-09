import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./remotion/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        "ink-4": "var(--ink-4)",
        rule: "var(--rule)",
        "rule-strong": "var(--rule-strong)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        danger: "var(--danger)",
        "bt-free": "var(--bt-free)",
        "bt-maybe": "var(--bt-maybe)",
        "bt-blocked": "var(--bt-blocked)",
      },
      fontFamily: {
        display: ["var(--display)"],
        sans: ["var(--sans)"],
        mono: ["var(--mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
