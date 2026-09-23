/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0BAA45',
          secondary: '#16C763',
          light: '#E9F9EF',
          bg: '#F7F8F6',
          white: '#FFFFFF',
          text: '#172017',
          muted: '#6B756D',
          border: '#E5E9E5',
          danger: '#E53935',
          warning: '#F59E0B',
          success: '#16A34A',
          hover: '#09933B',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 4px 12px 0 rgba(11, 170, 69, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'call-glow': '0 0 25px rgba(22, 199, 99, 0.4)',
      },
      borderRadius: {
        'card': '12px',
      }
    },
  },
  plugins: [],
}
