/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] },
      colors: {
        brand: {
          primary: '#0E2C52',
          accent: '#FF9A00',
          secondary: '#00AEEF',
          pastel: '#E0F7FC',
        },
        ocean: '#087F8C',
        deep: '#073C51',
        sea: '#14B8A6',
        sun: '#F59E0B',
      },
      boxShadow: { float: '0 24px 70px rgba(6, 54, 74, .14)' },
    },
  },
  plugins: [],
}
