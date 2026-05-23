/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(250, 70%, 45%)',
          dark: 'hsl(250, 70%, 30%)',
          light: 'hsl(250, 70%, 60%)',
        },
        secondary: 'hsl(260, 30%, 20%)',
        background: 'hsl(230, 15%, 10%)',
        surface: 'hsla(230, 15%, 15%, 0.9)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'shake': 'shake 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        }
      }
    },
  },
  plugins: [],
}
