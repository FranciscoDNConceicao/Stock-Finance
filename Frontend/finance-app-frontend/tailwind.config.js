/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background-color": "var(--background-color)",
        "secondary-background-color": "var(--secondary-background-color)",
        "primary-color": "var(--primary-color)",
        "secondary-color": "var(--secondary-color)"
      }
    },
  },
  plugins: [],
}

