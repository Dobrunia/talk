/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        Prosto: ['Prosto One'],
      },
      colors: {
        servers_list_dg: '#151618',
        server_components_dg: `#202124`,
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
