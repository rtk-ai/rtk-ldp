---
name: image-webp
description: Audit and convert images to WebP format. Checks public/assets/ for PNG/JPG files, verifies <img> tags have width/height, and generates cwebp conversion commands.
---

# Image WebP Skill

Ensure all illustrations are WebP format and all `<img>` tags have proper attributes.

## Step 1 — Find non-WebP images

```bash
find public/assets/illustrations/ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" 2>/dev/null
```

For each file found:
- Is it an OG image (og-*.png, og-image.*)? → **Keep as PNG** (Twitter/X requirement)
- Otherwise → **Convert to WebP**

## Step 2 — Generate conversion commands

For each non-OG image that needs conversion:
```bash
cwebp -q 85 -preset photo input.jpg -o output.webp
```

Check if `cwebp` is installed: `which cwebp || brew install webp`

## Step 3 — Check img attributes

Grep all `.astro` files for `<img` tags missing `width` or `height`:
```bash
grep -n "<img" src/**/*.astro | grep -v "width" | grep -v "height"
```

Also check for missing `alt` attributes:
```bash
grep -n "<img" src/**/*.astro | grep -v 'alt='
```

## Step 4 — Check Astro Image component usage

Astro has `<Image>` from `astro:assets` which handles optimization automatically.
If raw `<img>` tags exist for static assets, suggest migrating to `<Image>` component.

## Output Format

```
Non-WebP images found:
  public/assets/illustrations/hero-diagram.png (45KB) → Convert
  public/assets/og-image.png (120KB) → KEEP (OG image)

Conversion commands:
  cwebp -q 85 -preset photo public/assets/illustrations/hero-diagram.png -o public/assets/illustrations/hero-diagram.webp

img tags missing width/height:
  src/pages/index.astro:142 — <img src="/assets/diagram.webp" alt="..."> → Add width="800" height="400"

img tags missing alt:
  src/components/landing/Hero.astro:23 — <img src="..."> → Add descriptive alt text
```
