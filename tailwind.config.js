/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gw-deep': 'var(--gw-deep)',
        'gw-card': 'var(--gw-card)',
        'gw-card-alt': 'var(--gw-card-alt)',
        'gw-border': 'var(--gw-border)',
        'gw-border-glow': 'var(--gw-border-glow)',
        'gw-blue': 'var(--gw-blue)',
        'gw-cyan': 'var(--gw-cyan)',
        'gw-green': 'var(--gw-green)',
        'gw-amber': 'var(--gw-amber)',
        'gw-red': 'var(--gw-red)',
        'gw-purple': 'var(--gw-purple)',
        'gw-surface': 'var(--gw-surface)',
        'gw-text': 'var(--gw-text)',
        'gw-muted': 'var(--gw-muted)',
        'gw-highlight': 'var(--gw-highlight)',
      },
      fontFamily: {
        'display': ['"Noto Serif SC"', 'serif'],
        'body': ['"Noto Sans SC"', '"Inter"', 'system-ui', 'sans-serif'],
        'mono': ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.3)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.3)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.3)',
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.3)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.3)',
        'glow-purple': '0 0 15px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
};
