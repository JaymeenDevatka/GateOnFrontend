/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#ea580c', // Dark Orange 600
          dark: '#c2410c',    // Dark Orange 700
          light: '#ffedd5',   // Orange 100
          muted: '#fb923c',   // Orange 400
          glow: '#f97316',    // Orange 500
        },
        secondary: {
          DEFAULT: '#f59e0b', // Amber 500
          dark: '#d97706',    // Amber 600
          light: '#fef3c7',   // Amber 100
        },
        accent: {
          DEFAULT: '#dc2626', // Red 600
          glow: '#ef4444',    // Red 500
        },
        surface: {
          DEFAULT: '#f8fafc', // Slate 50
          elevated: '#ffffff', // White
          muted: '#f1f5f9',   // Slate 100
          glass: 'rgba(255, 255, 255, 0.8)',
        },
      },
      boxShadow: {
        card: '0 4px 20px rgba(234, 88, 12, 0.1), 0 1px 3px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 40px rgba(234, 88, 12, 0.2), 0 4px 12px rgba(0,0,0,0.1)',
        glow: '0 0 20px rgba(234, 88, 12, 0.3)',
        'glow-sm': '0 0 10px rgba(234, 88, 12, 0.2)',
        'glow-lg': '0 0 40px rgba(234, 88, 12, 0.4)',
        'neon': '0 0 10px rgba(234, 88, 12, 0.5), 0 0 20px rgba(234, 88, 12, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-orange': 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #f59e0b 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 6s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'gradient-x': 'gradient-x 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'ken-burns': 'kenBurns 20s ease-in-out infinite alternate',
      },
      keyframes: {
        kenBurns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.1) translate(-1%, -1%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '0 0',
          },
          '100%': {
            backgroundPosition: '-200% 0',
          },
        },
      },
    },
  },
  plugins: [],
};
