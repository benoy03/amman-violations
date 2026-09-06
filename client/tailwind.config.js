/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f6fe',
          100: '#ddecfd',
          200: '#c2dffc',
          300: '#98cafa',
          400: '#67aaf6',
          500: '#3b86f0',
          600: '#2668e5',
          700: '#1d52d2',
          800: '#1e43ab',
          900: '#0f2942', // كحلي مؤسسي رسمي
          950: '#091829',
        }
      }
    },
  },
  plugins: [],
}
