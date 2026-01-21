/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Rethink Sans"', "sans-serif"],
      },
      spacing: {
        // Enforcing strict scale if devs look at config,
        // but standard tailwind classes 1, 2, 3, 4, 6, 8, 12 map to 4, 8, 12, 16, 24, 32, 48px
      },
      colors: {
        // Custom palette can go here if needed, but slate-950 is good for high contrast
      },
    },
  },
  plugins: [],
};
