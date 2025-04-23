// tailwind.config.js

module.exports = {
  content: [
    './src/**/*.{html,js,jsx}', // Paths to your React components and HTML files
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Main color for buttons, headers, and primary elements
        secondary: '#E4E4E7', // Lighter gray for backgrounds and borders
        accent: '#F59E0B', // Accent color for buttons, links, etc.
        dark: '#1F2937', // Dark text and backgrounds
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Using the Inter font (can be added via Google Fonts)
      },
      spacing: {
        '128': '32rem', // Custom spacing value for larger elements
      },
      boxShadow: {
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)', // Custom shadow effect
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-in-out', // Custom animation for fadeIn effect
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
