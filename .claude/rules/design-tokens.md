# Design Tokens — RTK Landing

## Token Table

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#060b18` | Page background |
| `--bg-alt` | `#0c1225` | Alternate sections |
| `--bg-card` | `#0f1629` | Cards, panels |
| `--text` | `#e2e8f0` | Body text |
| `--text-muted` | `#8294ab` | Secondary text |
| `--text-dim` | `#64748b` | Disabled, captions |
| `--accent` | `#00e599` | Primary CTA, highlights |
| `--cyan` | `#38bdf8` | Info, links |
| `--violet` | `#a78bfa` | Feature highlights |
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
