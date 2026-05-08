---
name: check-images
description: Audit images in public/assets/ — find non-WebP files, check for missing width/height attributes, and generate cwebp conversion commands.
---

Run a full image audit for performance and CLS prevention.

## Execution

Invoke `Skill(image-webp)` to:

1. Find PNG/JPG files in `public/assets/` that should be WebP
2. Identify OG images that must stay PNG
3. Check all `<img>` tags in `.astro` files for missing `width`/`height`
4. Check all `<img>` tags for missing `alt` attributes
5. Generate ready-to-run `cwebp` conversion commands

## Prerequisites Check

```bash
which cwebp || echo "Install with: brew install webp"
```

## After Conversion

When converting images:
1. Keep the original PNG as backup until verified
2. Update `<img src>` paths from `.png`/`.jpg` to `.webp`
3. Verify the WebP renders correctly in `pnpm dev`
4. Remove the original after verification
5. Run `/build-check` to confirm build still passes

## Reference

See `.claude/rules/performance.md` for size budgets.
See `.claude/rules/seo-geo.md` for OG image requirements (must stay PNG).
