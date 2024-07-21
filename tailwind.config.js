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
        blue: '#000133',
        purple: '#815CA7',
        pink: '#F180C5',
        pink_opaque: '#f180c599',
        blue_opaque: '#00013399',
        blue_terms: '#815ca733',
        home_text: '#f180c580'
      },
      fontFamily: {
        header: ['Oswald'],
        body: ['Bw Gradual']
      }
    }
  }
}
