/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          primary:   '#0a0e1a',
          secondary: '#0f1526',
          tertiary:  '#141d33',
          hover:     '#1a2540',
        },
        brand: {
          DEFAULT: '#6c63ff',
          light:   '#8b5cf6',
          cyan:    '#06b6d4',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong:  'rgba(255,255,255,0.12)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}

