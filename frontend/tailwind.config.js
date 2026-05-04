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
          primary:   '#f0f4f8',
          secondary: '#ffffff',
          tertiary:  '#f8fafc',
          hover:     '#eff6ff',
        },
        brand: {
          DEFAULT: '#1a73e8',
          light:   '#4285f4',
          dark:    '#0d47a1',
          cyan:    '#0891b2',
        },
        border: {
          DEFAULT: '#e2e8f0',
          strong:  '#cbd5e1',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(6px)' },
          to:   { opacity: 1, transform: 'translateY(0)' }
        },
      },
    },
  },
  plugins: [],
}
