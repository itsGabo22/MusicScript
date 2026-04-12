/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'ipod-silver': '#BCC6CC',
        'ipod-screen': '#98FB98',
        'cassette-gold': '#DAA520',
        'cassette-plastic': '#1A1A1A'
      },
      boxShadow: {
        'retro-wheel': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4), 0 4px 8px 0 rgba(0, 0, 0, 0.2)',
        'lcd-inner': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.15)'
      }
    },
  },
  plugins: [],
}
