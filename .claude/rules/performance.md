# Performance Budget — RTK Landing

## Core Web Vitals Targets

| Metric | Target | Notes |
|--------|--------|-------|
| LCP (Largest Contentful Paint) | < 2.5s | Hero image/text should load fast |
| CLS (Cumulative Layout Shift) | < 0.1 | Always set width/height on images |
| INP (Interaction to Next Paint) | < 200ms | Minimal JS, no heavy event handlers |

## Asset Budget

| Asset type | Budget |
|------------|--------|
| JS (total, compressed) | < 100KB |
| CSS (total, compressed) | < 30KB |
| Per-image (hero) | < 200KB WebP |
| Per-image (illustration) | < 80KB WebP |
| Fonts | Preload critical fonts, use `font-display: swap` |

## Image Rules

- All illustrations: WebP format (`-q 85 -preset photo`)
- Always specify `width` and `height` attributes → prevents CLS
- Use `loading="lazy"` for below-fold images
- Hero images: preload with `<link rel="preload" as="image">`
- OG images: PNG (Twitter/X requirement), ~150KB max

## CSS Performance

- Use CSS custom properties (zero runtime cost)
- Avoid expensive animations: use `transform` and `opacity` only
- No `will-change` unless measurably needed
- No `@import` in CSS — Astro bundles automatically

## Font Optimization

DM Sans + JetBrains Mono loaded from Google Fonts.
- Add `preconnect` to `https://fonts.googleapis.com` in `<head>`
- Use `font-display: swap` to avoid invisible text during load
- Subset fonts if possible (Latin only)

## JavaScript

No React, no framework. Pure Astro + vanilla JS only.
- Zero client-side JS unless absolutely required (use Astro `client:idle` or `client:visible`)
- No heavy libraries — check bundle with `pnpm build` and inspect `dist/` sizes
