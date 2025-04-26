/** @type {import('tailwindcss').Config} */
// Color Palette extracted manually from https://vnrvjiet.ac.in/
const collegeColors = {
    primary: {
      light: '#4c6daf', // Lighter blue from header gradient
      DEFAULT: '#2a4b8d', // Main dark blue from header/nav
      dark: '#1a316d',   // Darker shade if needed
    },
    secondary: {
       light: '#fca5a5', // Light red/orange
       DEFAULT: '#ef4444', // Main red from alerts/buttons
       dark: '#dc2626',   // Darker red
    },
    accent: {
        DEFAULT: '#f97316', // Orange from buttons/highlights
        dark: '#ea580c'
    },
    neutral: { // Grays/Backgrounds
      100: '#f8fafc', // Light background
      200: '#e2e8f0', // Light borders/dividers
      300: '#cbd5e1',
      500: '#64748b', // Medium text
      700: '#334155', // Darker text/elements
      900: '#0f172a', // Very dark elements
    },
    // Add specific colors if needed:
    // green: '#22c55e', // Example success color
    // yellow: '#eab308', // Example warning color
  };
  
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // Scan source files for Tailwind classes
    ],
    theme: {
      extend: {
          colors: collegeColors, // Make extracted colors available
          fontFamily: {
              // Add custom fonts if needed, otherwise relies on defaults or imports in index.css
              // sans: ['Inter', 'sans-serif'], // Example
          },
           container: { // Optional: Default container settings
              center: true,
              padding: '1rem',
              screens: {
                  sm: '100%',
                  md: '100%',
                  lg: '1024px',
                  xl: '1280px',
              }
          }
      },
    },
    plugins: [
      // require('@tailwindcss/forms'), // Uncomment if using this plugin
    ],
  }