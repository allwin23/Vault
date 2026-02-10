/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Use the warm premium background color
        background: '#f5f0e9',

        // Panels (Cards, sidebars) should contrast with background, likely white or very light beige
        panel: '#ffffff',
        'panel-hover': '#f0ebe4',

        // Text color should be dark (almost black)
        text: {
          DEFAULT: '#0a0a0a',
          muted: '#6b7280', // Gray-500
        },

        // Primary Action Color - keeping a "Premium" feel, maybe a deep elegant Navy or Charcoal to match "Courtroom"
        primary: {
          light: '#4f46e5', // Indigo-600
          DEFAULT: '#111827', // Gray-900 (Deep Black/Navy)
          dark: '#000000',
          foreground: '#ffffff', // For text on primary background
        },

        // Accent Color - keeping as a subtle highlight
        accent: {
          DEFAULT: '#d97706', // Amber-600 (Gold/Bronze feel for "Courtroom" premium)
          glow: 'rgba(217, 119, 6, 0.2)',
        },

        // Border color for light theme
        border: '#e5e7eb', // Gray-200

        // Status Colors
        status: {
          success: '#059669', // Emerald-600
          warning: '#d97706', // Amber-600
          error: '#dc2626', // Red-600
          info: '#2563eb', // Blue-600
        }
      },
      fontFamily: {
        primary: ['Crimson Pro', 'serif'], // Serif for hearings
        ui: ['Inter', 'sans-serif'], // Sans for UI
        system: ['Courier Prime', 'monospace'], // Mono for data
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(217, 119, 6, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(217, 119, 6, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}