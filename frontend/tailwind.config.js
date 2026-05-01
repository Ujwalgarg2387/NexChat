/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nex: {
          primary: '#00a884',
          primaryDark: '#017a61',
          primaryLight: '#d9fdd3',
          bg: '#111b21',
          panel: '#202c33',
          hover: '#2a3942',
          border: '#3b4a54',
          text: '#e9edef',
          muted: '#8696a0',
          incoming: '#202c33',
          outgoing: '#005c4b',
          search: '#2a3942',
          icon: '#aebac1',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease',
        'slide-in': 'slideIn 0.2s ease',
        'bounce-dots': 'bounceDots 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateX(-10px)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        bounceDots: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        }
      }
    }
  },
  plugins: [],
}
