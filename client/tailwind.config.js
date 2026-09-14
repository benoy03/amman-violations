/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f6fe',
          100: '#ddecfd',
          200: '#c2dffc',
          300: '#98cafa',
          400: '#67aaf6',
          500: '#3b86f0',
          600: '#2668e5',
          700: '#1d52d2',
          800: '#1e43ab',
          900: '#0f2942',
          950: '#091829',
        },
        surface: {
          DEFAULT: '#f0f4f8',
          50: '#f8fafc',
          100: '#f0f4f8',
          200: '#e8eef5',
          300: '#d1dae8',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-pattern': 'radial-gradient(at 40% 20%, rgb(38, 104, 229, 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(13, 148, 136, 0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgb(38, 104, 229, 0.05) 0px, transparent 50%)',
        'sidebar-gradient': 'linear-gradient(180deg, #0a1628 0%, #070e1c 100%)',
        'topbar-gradient': 'linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(255,255,255,0.95))',
        'brand-gradient': 'linear-gradient(135deg, #2668e5 0%, #1d52d2 100%)',
        'brand-glow': 'radial-gradient(ellipse at top, rgba(38, 104, 229, 0.15) 0%, transparent 70%)',
        'hero-dark': 'linear-gradient(135deg, #070e1c 0%, #0a1628 50%, #0d1f3c 100%)',
      },
      boxShadow: {
        'brand': '0 8px 25px -5px rgba(38, 104, 229, 0.35)',
        'brand-sm': '0 4px 12px -2px rgba(38, 104, 229, 0.25)',
        'brand-lg': '0 20px 40px -10px rgba(38, 104, 229, 0.4)',
        'inner-brand': 'inset 0 2px 4px rgba(38, 104, 229, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 25px -5px rgba(0, 0, 0, 0.12)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        'elevated': '0 10px 30px -8px rgba(0, 0, 0, 0.15)',
        'sidebar': '4px 0 24px rgba(0,0,0,0.25)',
        'topbar': '0 1px 0 rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'glow-sm': '0 0 12px rgba(38, 104, 229, 0.3)',
        'glow': '0 0 24px rgba(38, 104, 229, 0.4)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
        'fade-in': 'fade-in 0.25s ease-out both',
        'slide-up': 'slide-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-down': 'slide-down 0.2s ease-out both',
        'slide-in-right': 'slide-in-right 0.25s ease-out both',
        'pop-in': 'pop-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'count-up': 'count-up 0.4s ease-out both',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%, 45%, 75%': { transform: 'translateX(-5px)' },
          '30%, 60%, 90%': { transform: 'translateX(5px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(38, 104, 229, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(38, 104, 229, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
