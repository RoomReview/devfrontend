/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#B02020',
          50: '#F9E5E5',
          100: '#F2CCCC',
          200: '#E69999',
          300: '#D96666',
          400: '#CC3333',
          500: '#B02020',
          600: '#8C1919',
          700: '#691313',
          800: '#450C0C',
          900: '#220606',
        },
        secondary: {
          DEFAULT: '#1A2B3C',
          50: '#E8EAED',
          100: '#D1D5DB',
          200: '#A3ABB7',
          300: '#758193',
          400: '#47576F',
          500: '#1A2B3C',
          600: '#152330',
          700: '#101A24',
          800: '#0A1118',
          900: '#05090C',
        },
        offwhite: '#F3E6DE',
        gray: {
          DEFAULT: '#DEEDF8',
          light: '#E0E0E0',
          dark: '#1A2B3C',
        },
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
