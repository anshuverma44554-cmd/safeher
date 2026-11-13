/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        safeher: {
          primary: '#6D28D9',       // Deep vibrant purple
          'primary-dark': '#4C1D95', // Rich deep purple
          'primary-light': '#8B5CF6',
          lavender: '#EDE9FE',      // Soft lavender
          'lavender-light': '#F5F3FF',
          navy: '#0F172A',          // Dark Navy
          'navy-light': '#1E293B',
          emergency: '#EF4444',     // High-visibility SOS red
          'emergency-dark': '#DC2626',
          accent: '#EC4899',        // Rose accent
          emerald: '#10B981',       // Safe/Verified badge
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(109, 40, 217, 0.4)',
        'glow-emergency': '0 0 30px -5px rgba(239, 68, 68, 0.6)',
      }
    },
  },
  plugins: [],
}

