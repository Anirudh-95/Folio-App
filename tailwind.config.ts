import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:        'rgb(var(--color-bg)        / <alpha-value>)',
        card:      'rgb(var(--color-card)      / <alpha-value>)',
        border:    'rgb(var(--color-border)    / <alpha-value>)',
        gain:      'rgb(var(--color-gain)      / <alpha-value>)',
        loss:      'rgb(var(--color-loss)      / <alpha-value>)',
        accent:    'rgb(var(--color-accent)    / <alpha-value>)',
        primary:   'rgb(var(--color-primary)   / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Inter', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
} satisfies Config
