/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      colors: {
        brand: '#a7e154',
        dark: {
          900: '#121212',
          800: '#1a1a1a',
          700: '#232323',
        }
      },
      backgroundColor: {
        'dark-transparent': 'rgba(18, 18, 18, 0.8)',
      }
    },
  },
  plugins: [],
};
