module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0C8C5E',
        secondary: '#18E299',
        hover: '#1B4637',
        background: '#0D1117'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}