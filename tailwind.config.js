/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8eef5',
          100: '#c5d4e6',
          200: '#9fb8d5',
          300: '#789cc4',
          400: '#5b87b8',
          500: '#3d72ab',
          600: '#2d5f99',
          700: '#1A3A5C',
          800: '#162f4a',
          900: '#0e1f32',
        },
        brand: {
          orange: '#D67D2E',
          navy: '#1A3A5C',
        },
      },
    },
  },
  plugins: [],
}
