# Accessibility — RTK Landing (WCAG 2.1 Level AA)

## Mandatory Rules

- **Alt text**: Every `<img>` must have a descriptive `alt` attribute. Decorative images use `alt=""`
- **Width + height**: Always set on `<img>` to prevent CLS (layout shift)
- **Focus visible**: All interactive elements must show a visible focus ring (`:focus-visible`)
- **Aria labels**: `<nav>` elements must have `aria-label` (e.g., `aria-label="Main navigation"`)
- **Landmark**: One `<main>` per page, use `<header>`, `<footer>`, `<nav>` semantically
- **Lang attribute**: `<html>` must have `lang="en"` (or `lang="fr"` if French page)
- **Color contrast**: Minimum 4.5:1 for normal text, 3:1 for large text and UI components
- **Touch targets**: Minimum 44×44px for all clickable elements on mobile

## Keyboard Navigation

- Tab order must follow visual reading order
- No keyboard traps — users can always exit a component with Esc or Tab
- Skip link to main content recommended (`<a href="#main">Skip to content</a>`)

## RTK-Specific Checks

- Code blocks in docs: ensure syntax highlighting doesn't rely on color alone
- Dark-only design system: verify all text/background combinations meet contrast ratio
- Terminal demos / animated examples: provide pause control or static alternative

## Testing Checklist

Before marking any landing page component complete:
- [ ] All images have alt text
- [ ] Interactive elements reachable by keyboard
- [ ] Focus indicator visible
- [ ] No color-only information (icons + text labels)
- [ ] Check `<html lang>` is set
