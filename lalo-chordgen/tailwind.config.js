/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: '#0f172a',
        panel: '#1e293b',
        muted: '#64748b',
        'muted-text': '#94a3b8',
        'quality-maj': '#f59e0b', // Orange
        'quality-min': '#22d3ee', // Turquoise
        'quality-dom': '#eab308', // Yellow
        'quality-dim': '#a855f7', // Purple
        'quality-aug': '#ec4899', // Pink
        'quality-sus': '#ef4444', // Red
        'quality-ext': '#22c55e', // Green
        'quality-alt': '#3b82f6', // Blue
        'pad-empty': '#1f2937',
        'duration-pad-on': '#334155',
        'duration-pad-off': '#0f172a',
        'slot-selected': '#f59e0b',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      spacing: {
        'compact': '2px',
      },
      fontSize: {
        'xs': ['0.65rem', { lineHeight: '1' }],
        'sm': ['0.75rem', { lineHeight: '1.2' }],
        'base': ['0.875rem', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [],
}