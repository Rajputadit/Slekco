/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14151a",
        paper: "#faf9f6",
        brand: {
          50: "#fef3ee",
          100: "#fde3d5",
          200: "#fac3a6",
          300: "#f59c6d",
          400: "#ef7538",
          500: "#e6591a",
          600: "#c94413",
          700: "#a53412",
          800: "#862b15",
          900: "#6f2614",
        },
        stone: {
          25: "#fbfaf9",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1320px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,21,26,0.04), 0 8px 24px -12px rgba(20,21,26,0.12)",
      },
    },
  },
  plugins: [],
};
