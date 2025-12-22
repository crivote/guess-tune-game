/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "background-parchment": "#FDF8ED",
                "surface-sepia": "#EEE0C5",
                "accent-sepia": "#A67B5B",
                "text-charcoal": "#36454F",
                "primary": "#D6A350",
                "dark-sepia-ink": "#4B3621",
            },
            fontFamily: {
                "display": ["Lexend", "sans-serif"]
            },
        },
    },
    plugins: [],
}
