/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        kanit: ["Kanit_400Regular"],
        "kanit-bold": ["Kanit_700Bold"],
        "kanit-extrabold": ["Kanit_800ExtraBold"],
      },
    },
  },
  plugins: [],
}

