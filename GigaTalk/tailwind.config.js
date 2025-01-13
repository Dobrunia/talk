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
        /* политра
        bg-black
        bg-gray-800
        bg-gray-700
        bg-blue-600
        bg-blue-700
        */
      },
      backgroundImage: {},
      borderRadius: {},
      margin: {
        default: '16px',
      },
      padding: {
        default: '16px',
      },
      boxShadow: {},
      screens: {},
    },
  },
  plugins: [],
};
