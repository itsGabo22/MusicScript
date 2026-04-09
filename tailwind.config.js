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
        ipod: {
          gray: '#E5E5E5',
          dark: '#1C1C1C',
          blue: '#007AFF',
        }
      }
    },
  },
  plugins: [],
}
