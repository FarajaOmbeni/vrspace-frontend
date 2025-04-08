import defaultTheme from 'tailwindcss/defaultTheme'
import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', 
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],

  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#000133',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#000133'
        },
        purple: {
          DEFAULT: '#815CA7',
          50: '#F3F1F7',
          100: '#E7E2EF',
          200: '#D0C6DF',
          300: '#B9A9CF',
          400: '#A28CBE',
          500: '#815CA7',
          600: '#6A4A8C',
          700: '#543D71',
          800: '#3E2F53',
          900: '#282036'
        },
        pink: {
          DEFAULT: '#F180C5',
          50: '#FEF5FA',
          100: '#FDEBF6',
          200: '#FAD7EC',
          300: '#F7C3E3',
          400: '#F4AFDA',
          500: '#F180C5',
          600: '#EB50AB',
          700: '#E52092',
          800: '#C31478',
          900: '#8C0F57'
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        },
        pink_opaque: '#f180c599',
        blue_opaque: '#00013399',
        blue_terms: '#815ca733',
        home_text: '#f180c580'
      },
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '85': '0.85',
      },
      fontFamily: {
        header: ['Oswald', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
        sans: ['Montserrat', 'sans-serif', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'strong': '0 10px 25px rgba(0, 0, 0, 0.12)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
    }
  },
  plugins: [
    forms,
  ],
}
