/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                arimo: ["var(--font-arimo)", "sans-serif"],
                playfair: ["var(--font-playfair)", "serif"],
            },
        },
    },
    plugins: [],
}
