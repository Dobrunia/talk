/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        Prosto: ['Prosto One'],
      },
      colors: {
        UIapricot: '#FBCEB1',
        UImagenta: '#FF00FF',
      },
      backgroundImage: {},
      borderRadius: {},
      margin: {},
      padding: {},
      boxShadow: {},
      screens: {},
    },
  },
  plugins: [],
};
