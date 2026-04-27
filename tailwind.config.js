/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#faf8f4',
        parchment: '#f5f0e8',
        sepia: '#8B6914',
        scarlet: '#c41e3a',
        forest: '#2d5a27',
      },
    },
  },
  plugins: [],
};
