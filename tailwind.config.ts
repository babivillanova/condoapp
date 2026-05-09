import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#b9d8ff",
          300: "#8cbdff",
          400: "#5b97ff",
          500: "#3b76f6",
          600: "#275aeb",
          700: "#1f47c2",
          800: "#1d3d99",
          900: "#1c3879",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial"],
      },
    },
  },
  plugins: [],
};

export default config;
