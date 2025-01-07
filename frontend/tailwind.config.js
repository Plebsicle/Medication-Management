/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./src/**/**/*.{html,js,ts,jsx,tsx}",
    '.src/pages/**/*.tsx',
    '.src/components/**/*.tsx',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

