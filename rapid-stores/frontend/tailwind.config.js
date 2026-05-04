/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16A34A',
        secondary: '#F59E0B',
        accent: '#DC2626',
      },
    },
  },
  plugins: [],
}
