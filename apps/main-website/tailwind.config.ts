/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'navy': {
          50: '#f0f2f5',
          100: '#d0d7e1',
          200: '#a2afc3',
          300: '#7387a5',
          400: '#516b8c',
          500: '#3c5273',
          600: '#2b3e58',
          700: '#1f2d40',
          800: '#142536',
          900: '#0e1c2a',
        },
        'beige': {
          50: '#faf6f3',
          100: '#f3ece5',
          200: '#e6d9cb',
          300: '#d9c7b1',
          400: '#ccb598',
          500: '#c0a380',
          600: '#b49268',
          700: '#a38151',
          800: '#856a41',
          900: '#675231',
        },
        'cream': '#faf6f3',
        'gold': '#e2d0b2',
        'pearl': '#ebebe0',
        'seafoam': '#aac3e3',
		    'sunrise': '#f66f30',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Montserrat', 'sans-serif', 'var(--font-geist-sans)'],
        'mono': ['var(--font-geist-mono)'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-in-out',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-slow': 'pulseSlow 6s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: 0.15, transform: 'scale(1)' },
          '50%': { opacity: 0.25, transform: 'scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;