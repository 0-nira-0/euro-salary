import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#002366',
        secondary: '#059669',
        tertiary: '#2563EB',
        neutral: '#64748B',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '6px',
        lg: '8px',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s ease-out both',
        'pop-in': 'pop-in 0.15s ease-out both',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 35, 102, 0.08), 0 1px 2px -1px rgba(0, 35, 102, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config
