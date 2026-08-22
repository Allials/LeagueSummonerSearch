/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        "3xl": "2000px",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      colors: {
        night: {
          950: "#010A13",
          900: "#0A1428",
          850: "#0C1629",
          800: "#111B2E",
          700: "#1B2A44",
        },
        gold: {
          200: "#F8F1E0",
          300: "#F0E6D2",
          400: "#C8AA6E",
          500: "#A98B4F",
          600: "#785A28",
        },
        teal: {
          300: "#5EEAD4",
          400: "#1ED9C9",
          500: "#0AC8B9",
          600: "#0B9E93",
        },
      },
    },
  },
  plugins: [],
};