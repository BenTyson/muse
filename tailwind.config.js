/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Punk Rock Color Palette using CSS variables
        'rose-red': 'rgb(var(--color-rose-red) / <alpha-value>)',
        'flame': 'rgb(var(--color-flame) / <alpha-value>)',
        'maximum-yellow-red': 'rgb(var(--color-maximum-yellow-red) / <alpha-value>)',
        'palatinate-purple': 'rgb(var(--color-palatinate-purple) / <alpha-value>)',
        'green-sheen': 'rgb(var(--color-green-sheen) / <alpha-value>)',
        'metallic-blue': 'rgb(var(--color-metallic-blue) / <alpha-value>)',
        
        // Semantic color mappings
        'primary': {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
        },
        'secondary': {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          dark: 'rgb(var(--color-secondary-dark) / <alpha-value>)',
          light: 'rgb(var(--color-secondary-light) / <alpha-value>)',
        },
        'accent': {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          dark: 'rgb(var(--color-accent-dark) / <alpha-value>)',
          light: 'rgb(var(--color-accent-light) / <alpha-value>)',
        },
        
        // Utility colors
        'warning': 'rgb(var(--color-warning) / <alpha-value>)',
        'success': 'rgb(var(--color-success) / <alpha-value>)',
        'purple': 'rgb(var(--color-purple) / <alpha-value>)',
        
        // Gray scale
        'gray': {
          100: 'rgb(var(--color-gray-100) / <alpha-value>)',
          200: 'rgb(var(--color-gray-200) / <alpha-value>)',
          300: 'rgb(var(--color-gray-300) / <alpha-value>)',
          400: 'rgb(var(--color-gray-400) / <alpha-value>)',
          500: 'rgb(var(--color-gray-500) / <alpha-value>)',
          600: 'rgb(var(--color-gray-600) / <alpha-value>)',
          700: 'rgb(var(--color-gray-700) / <alpha-value>)',
          800: 'rgb(var(--color-gray-800) / <alpha-value>)',
          900: 'rgb(var(--color-gray-900) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}