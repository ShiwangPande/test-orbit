/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");
const { colors: defaultColors } = require('tailwindcss/defaultTheme')


module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",


  ],
  theme: {
    extend: {
      colors: {
        'redish': '#d1151b',
        'wheat': '#EEEEEE',
        'orrange': '#ec6713',
        'navbar': '#171717',
        'card': '#fff',
      }
    },
  },
  darkMode: "class",
  plugins: [nextui()
  ],
}