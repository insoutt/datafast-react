/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'df-',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        foreground: '#000000',
      },
    },
  },
  plugins: [],
};
