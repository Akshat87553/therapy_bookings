/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
  theme: {
    extend: {
          animation: {
        marquee: 'marquee 60s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      fontFamily: {
 display: ['Playfair Display', 'serif'],   // for section titles, h1–h6
        sans: ['Montserrat', 'sans-serif'],         // override default
        serif: ['Playfair Display', 'serif'],  // you can also use font-serif
        script:  ['Dancing Script', 'cursive'],   // use font-script
        body:    ['Inter', 'sans-serif'], 
      },
      colors: {
        primary: {
          DEFAULT: '#1A1A1A',
          50: '#F5F5F5',
          100: '#E6E6E6',
          200: '#CCCCCC',
          300: '#B3B3B3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4D4D4D',
          800: '#333333',
          900: '#1A1A1A'
        },
        secondary: {
          DEFAULT: '#F5F5F5',
          light: '#FFFFFF'
        }
      }
    }
  },
  plugins: []
};