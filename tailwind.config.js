/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EBF5FB',
          100: '#D6EAF8',
          DEFAULT: '#0070BA', // Biru solid utama SIAP IDN
          hover: '#005C9E',
          active: '#004A7F',
        },
        page: '#F8FAFC',
        surface: '#FFFFFF',
      },
      borderRadius: {
        lg: '8px',
        xl: '12px',
      }
    },
  },
  plugins: [],
}
