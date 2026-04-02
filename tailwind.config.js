/** @type {import('tailwindcss').Config} */
let typographyPlugin;
try {
  // Optional during development; install via `npm i -D @tailwindcss/typography`
  typographyPlugin = require('@tailwindcss/typography');
} catch {
  typographyPlugin = null;
}

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: typographyPlugin ? [typographyPlugin] : [],
};
