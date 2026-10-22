import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ocean: '#087F8C',
          deep: '#073C51',
          sea: '#14B8A6',
          sun: '#F59E0B',
        },
        surface: {
          canvas: '#F8FAFC',
          base: '#FFFFFF',
          soft: '#F1F5F9',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        border: {
          default: '#CBD5E1',
        },
        state: {
          success: '#15803D',
          warning: '#92400E',
          danger: '#B91C1C',
          info: '#0369A1',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 30px rgba(7, 60, 81, 0.055)',
        float: '0 24px 70px rgba(6, 54, 74, 0.14)',
        overlay: '0 25px 90px rgba(7, 60, 81, 0.22)',
      },
    },
  },
  plugins: [],
} satisfies Config;
