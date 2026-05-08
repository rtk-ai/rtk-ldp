import typography from '@tailwindcss/typography'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--bg)',
          alt: 'var(--bg-alt)',
          card: 'var(--bg-card)',
        },
        accent: { DEFAULT: 'var(--accent)' },
        cyan: { DEFAULT: 'var(--cyan)' },
        violet: { DEFAULT: 'var(--violet)' },
        text: {
          DEFAULT: 'var(--text)',
          bright: 'var(--text-bright)',
          muted: 'var(--text-muted)',
        },
        border: { DEFAULT: 'var(--border)' },
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      maxWidth: { content: '1140px' },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [typography],
}
