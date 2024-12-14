/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Modern color palette with soft, sophisticated tones
        border: "hsl(220, 13%, 91%)",
        input: "hsl(220, 15%, 95%)",
        ring: "hsl(240, 5%, 64%)",
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(240, 10%, 3.9%)",
        primary: {
          DEFAULT: "hsl(258, 75%, 58%)", // Vibrant purple
          foreground: "hsl(0, 0%, 100%)",
          light: "hsl(258, 75%, 68%)",
          dark: "hsl(258, 75%, 48%)",
        },
        secondary: {
          DEFAULT: "hsl(210, 40%, 96%)", // Soft blue-gray
          foreground: "hsl(240, 5%, 64%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)", // Soft red
          foreground: "hsl(0, 0%, 100%)",
        },
        muted: {
          DEFAULT: "hsl(220, 15%, 95%)",
          foreground: "hsl(215, 16%, 47%)",
        },
        accent: {
          DEFAULT: "hsl(35, 91%, 65%)", // Warm orange
          foreground: "hsl(0, 0%, 100%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(240, 10%, 3.9%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(240, 10%, 3.9%)",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "subtle-pulse": {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "subtle-pulse": "subtle-pulse 2s ease-in-out infinite",
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      },
      transitionProperty: {
        'colors-all': 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};