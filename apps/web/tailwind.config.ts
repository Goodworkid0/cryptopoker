import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Roobet-inspired dark theme with poker green accents
        background: {
          primary: '#0a0e17',
          secondary: '#111827',
          tertiary: '#1a1f2e',
          card: '#151b28',
          hover: '#1e2536',
        },
        accent: {
          primary: '#00ff88',    // Neon green
          secondary: '#00cc6a',
          gold: '#ffd700',
          orange: '#ff6b35',
          purple: '#8b5cf6',
          blue: '#3b82f6',
        },
        text: {
          primary: '#ffffff',
          secondary: '#9ca3af',
          muted: '#6b7280',
        },
        border: {
          primary: '#1f2937',
          secondary: '#374151',
          accent: '#00ff8833',
        },
        poker: {
          green: '#0d5c36',
          felt: '#1a7a4c',
          red: '#dc2626',
          black: '#18181b',
        },
        suits: {
          hearts: '#ef4444',
          diamonds: '#3b82f6',
          clubs: '#22c55e',
          spades: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-poker': 'linear-gradient(135deg, #0a0e17 0%, #111827 50%, #0d1117 100%)',
        'gradient-card': 'linear-gradient(180deg, #1a1f2e 0%, #151b28 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
        'gradient-gold': 'linear-gradient(135deg, #ffd700 0%, #ff9500 100%)',
        'glow-green': 'radial-gradient(circle, #00ff8820 0%, transparent 70%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 255, 136, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
