import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // DealNest group core
        ink: {
          DEFAULT: '#0E1B2C',
          80: '#3C4858',
          60: '#6B7689',
          40: '#9CA4B4',
        },
        cream:  '#F6F1E7',
        chalk:  '#FBF8F2',
        mist:   '#E8E4DA',
        sage:   '#0EA968',
        rust:   '#C24A3B',
        amber: {
          DEFAULT: '#F4A547',
          dark:    '#F8B860',
        },
        // Product signatures
        mydealz: {
          DEFAULT: '#0EA968',
          deep:    '#0B8553',
          soft:    '#D8F1E4',
        },
        rewardloop: {
          DEFAULT: '#FF6B5B',
          deep:    '#D44A3A',
          soft:    '#FFE2DC',
        },
        basketbot: {
          DEFAULT: '#2D5BFF',
          deep:    '#1E3FD9',
          soft:    '#DCE4FF',
        },
        // Legacy — kept so existing components don't break
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
      fontFamily: {
        sans:    ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)',    'system-ui', 'sans-serif'],
        mono:    ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card:         '0 1px 0 rgba(14,27,44,0.03), 0 8px 24px -12px rgba(14,27,44,0.12)',
        'card-float': '0 16px 40px -16px rgba(0,0,0,0.4)',
        // Legacy
        'card-hover': '0 12px 40px rgba(249,115,22,0.18), 0 2px 8px rgba(0,0,0,0.06)',
        glass:        '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      keyframes: {
        scaleIn: {
          '0%':   { transform: 'scale(0.75)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        fadeInUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeOut: {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
      },
      animation: {
        scaleIn:  'scaleIn 0.55s cubic-bezier(0.34,1.56,0.64,1)',
        fadeInUp: 'fadeInUp 0.5s ease-out both',
        fadeOut:  'fadeOut 0.4s ease-in both',
        shimmer:  'shimmer 1.6s linear infinite',
        float:    'float 3s ease-in-out infinite',
        blink:    'blink 1.4s ease-in-out infinite',
      },
      backgroundImage: {
        'shimmer-gradient':
          'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)',
      },
      backgroundSize: {
        '800': '800px 100%',
      },
    },
  },
  plugins: [],
}

export default config
