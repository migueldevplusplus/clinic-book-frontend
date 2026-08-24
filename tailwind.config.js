/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eefdfa',
          100: '#d5f9f2',
          200: '#aff2e7',
          300: '#79e6d7',
          400: '#3dd1c0',
          500: '#18b5a6',
          600: '#0d9187',
          700: '#0f746d',
          800: '#115c58',
          900: '#134d4a',
          950: '#042f2e',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae3',
          300: '#b0bacb',
          400: '#8595ae',
          500: '#667794',
          600: '#51607a',
          700: '#434e63',
          800: '#3a4353',
          900: '#343b47',
          950: '#23272f',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 24 40 / 0.04), 0 4px 16px -2px rgb(16 24 40 / 0.06)',
        lift: '0 12px 32px -8px rgb(16 24 40 / 0.16)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .28s ease-out both',
        'scale-in': 'scale-in .18s ease-out both',
      },
    },
  },
  plugins: [],
}
