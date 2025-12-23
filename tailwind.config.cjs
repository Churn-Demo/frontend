/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        custech: {
          blue: "#0B4FA3",
          orange: "#F57C00",
          navy: "#071A33",
          ink: "#0B1220",
        },
      },
    },
  },
  plugins: [],
};
