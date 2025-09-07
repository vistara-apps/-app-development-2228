/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "hsl(210 40% 96%)",
        accent: "hsl(171 64% 46%)",
        primary: "hsl(204 94% 47%)",
        surface: "hsl(210 40% 98%)",
        textPrimary: "hsl(214 46% 14%)",
        textSecondary: "hsl(210 40% 30%)",
        dark: {
          bg: "hsl(240 20% 6%)",
          surface: "hsl(240 15% 10%)",
          card: "hsl(240 12% 14%)",
          border: "hsl(240 10% 20%)",
          text: "hsl(240 5% 95%)",
          textSecondary: "hsl(240 5% 70%)",
        },
        purple: {
          primary: "hsl(258 90% 66%)",
          secondary: "hsl(270 91% 65%)",
        }
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
      spacing: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        card: "0 4px 12px hsla(214, 46%, 14%, 0.1)",
        focus: "0 0 0 3px hsla(204, 94%, 47%, 0.5)",
        glow: "0 0 20px rgba(139, 92, 246, 0.3)",
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, hsl(258 90% 66%) 0%, hsl(270 91% 65%) 100%)',
        'gradient-dark': 'linear-gradient(135deg, hsl(240 20% 6%) 0%, hsl(240 15% 10%) 100%)',
      }
    },
  },
  plugins: [],
}