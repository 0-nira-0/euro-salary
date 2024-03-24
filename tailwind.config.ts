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
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 35, 102, 0.08), 0 1px 2px -1px rgba(0, 35, 102, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config
