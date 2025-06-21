/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        myprimary: "#003F62", // you can now use bg-primary, text-primary, etc.
      },
    },
  },
  plugins: [],
}
