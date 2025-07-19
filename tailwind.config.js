/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF1B6B",
        accent: "#45CAFF",
        background: "#FFFFFF",
        dark: "#0A0A0A",
      },
      fontFamily: {
        inter: ["Inter"],
        "inter-semibold": ["Inter-SemiBold"],
      },
    },
  },
  plugins: [],
}