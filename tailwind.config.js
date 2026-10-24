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
        primary: {
          50: '#e0f7ff',
          100: '#b3ecff',
          200: '#80dfff',
          300: '#4dd1ff',
          400: '#26c6ff',
          500: '#00baff',
          600: '#00a8e0',
          700: '#0089b8',
          800: '#006b90',
          900: '#004d68',
        },
        rio: {
          green: '#00c853',
          yellow: '#ffd600',
          blue: '#0288d1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
