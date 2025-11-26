/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                navy: {
                    900: '#020c1b',
                    800: '#0a192f',
                    700: '#112240',
                    600: '#233554',
                },
                neon: {
                    blue: '#64ffda',
                    purple: '#bd34fe',
                    pink: '#ff34b3',
                },
                slate: {
                    100: '#e6f1ff', // Metallic White text
                    200: '#ccd6f6',
                    300: '#a8b2d1',
                    400: '#8892b0',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                'neon': '0 0 10px rgba(100, 255, 218, 0.1)',
                'neon-hover': '0 0 20px rgba(100, 255, 218, 0.2)',
            }
        },
    },
    plugins: [],
}
