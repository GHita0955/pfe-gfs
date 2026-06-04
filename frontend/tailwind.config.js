/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#F5A623',
          light: '#FFB84D',
          dark: '#D4890A'
        },
        dark: {
          DEFAULT: '#0a0a0a',
          50: '#1a1a1a',
          100: '#111111',
          200: '#161616',
          300: '#252525',
          400: '#2a2a2a',
          500: '#333333',
          600: '#444444'
        }
      },
      boxShadow: {
        gold: '0 0 20px rgba(245, 166, 35, 0.15)',
        'gold-md': '0 0 40px rgba(245, 166, 35, 0.2)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.4s ease',
        'slide-in-right': 'slideInRight 0.3s ease'
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        }
      }
    },
  },
  plugins: [],
}

