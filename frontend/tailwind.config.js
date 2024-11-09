/** @type {import('tailwindcss').Config} */
export default {
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

