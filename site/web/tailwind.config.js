/***** Tailwind CSS Config *****/
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji"],
      },
      colors: {
        brand: {
          DEFAULT: "#111827",
        },
        accent: {
          DEFAULT: "#2563eb",
        }
      },
      borderRadius: {
        xl: "0.75rem",
        '2xl': "1rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.08)",
      },
    },
    container: {
      center: true,
      padding: "1rem",
    },
  },
  plugins: [],
};