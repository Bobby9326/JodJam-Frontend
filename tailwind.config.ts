import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF3E4',
          dark: '#F0E6D0',
        },
        brown: {
          DEFAULT: '#3B2A1A',
          light: '#7C5C3E',
          muted: '#A8896A',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      height: {
        screen: '100dvh',
      },
    },
  },
  plugins: [],
}

export default config
