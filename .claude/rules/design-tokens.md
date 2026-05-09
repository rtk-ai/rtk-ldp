# Design Tokens — RTK Landing

## Color Role Rules (strict)

| Color | Token | Allowed on |
|-------|-------|-----------|
| Green (`#00e599`) | `--accent` | RTK brand CTAs, primary buttons, highlights on landing `/` |
| Cyan (`#38bdf8`) | `--cyan` | ICM product pages only. Never use as generic info color. |
| Violet (`#a78bfa`) | `--violet` | Vox product pages only. Never use as generic highlight. |
| Tri-gradient `accent→cyan→violet` | — | Max 2 surfaces: hero H1 on `/` + final CTA strip. Nowhere else. |

## Token Table

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#060b18` | Page background |
| `--bg-alt` | `#0c1225` | Alternate sections (must alternate bg↔bg-alt in sequence) |
| `--bg-card` | `#0f1629` | Cards, panels |
| `--bg-elevated` | `#1a2244` | Comparison tables, featured content |
| `--bg-glass` | `rgba(6,11,24,0.82)` | Nav/header glassmorphism backdrop |
| `--text` | `#e2e8f0` | Body text |
| `--text-muted` | `#94a3b8` | Secondary text (5.4:1 on bg-card, WCAG AA pass) |
| `--text-dim` | `#7e8ca6` | Captions, labels (4.6:1 on bg-card, WCAG AA pass) |
| `--text-on-accent` | `#060b18` | Text on accent/green backgrounds |
| `--accent` | `#00e599` | Primary CTA, RTK highlights |
| `--accent-hover` | `#00cc88` | Hover state for accent buttons |
| `--cyan` | `#38bdf8` | ICM product only |
| `--violet` | `#a78bfa` | Vox product only |
| `--border` | `#1a2344` | Borders, dividers |

## Strict Rules

- **Never hardcode hex colors** in `.astro`, `.css`, or any source file
- **Always use CSS custom properties** for any value that has a token
- `landing.css` is for landing page styles only — do not put shared tokens there
- `starlight-overrides.css` is for Starlight theme overrides only
- `global.css` is the single source of truth for tokens — never duplicate them

## Anti-Patterns

```css
/* BAD — never do this */
color: #060b18;
background: #00e599;

/* GOOD */
color: var(--bg);
background: var(--accent);
```

## Component Placement

| Component type | Directory |
|----------------|-----------|
| Landing page sections | `src/components/landing/` |
| Shared (docs + landing) | `src/components/global/` |
| Starlight UI overrides | `src/components/starlight/` |
