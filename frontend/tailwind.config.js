/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#edd8ff',
          200: '#c084fc',
          500: '#4F46E5', // Keep original primary color
          600: '#4338ca',
          700: '#3730a3',
        },
        secondary: '#E4E4E7',
        accent: '#F59E0B',
        dark: '#0f172a', // Slate 900 for modern dark styling
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
