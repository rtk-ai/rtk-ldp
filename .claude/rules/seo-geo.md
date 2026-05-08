# SEO / GEO — RTK Landing

## JSON-LD Schema Rules

| Page | Schema type |
|------|-------------|
| `/` | `@graph`: Organization, SoftwareApplication, FAQPage, HowTo, WebPage + SpeakableSpecification |
| `/vox/`, `/icm/` | SoftwareApplication only — Layout.astro auto-injects WebPage |
| `/guide/*` | BreadcrumbList dynamique + TechArticle (via Starlight Head override) |

**Critical rules:**
- `src/pages/index.astro` uses `@graph` object — Layout.astro detects it and does NOT duplicate WebPage
- `/vox/` and `/icm/` pass a simple object → Layout auto-injects WebPage
- Never add `@context` inside child objects of a `@graph`
- All JSON-LD must be valid parsable JSON — validate with `JSON.parse()` before committing

## FAQ Workflow

FAQ is in `faqItems` array at the top of `src/pages/index.astro`.
Editing the array updates both the HTML component AND the FAQPage JSON-LD automatically.
No need to edit two places.

## Image SEO

- All illustrations must be WebP: `public/assets/illustrations/*.webp`
- Always add `width` and `height` on `<img>` tags (prevents CLS)
- OG images stay PNG — Twitter/X doesn't support WebP for cards
- Conversion: `cwebp -q 85 -preset photo input.jpg -o output.webp`

## robots.txt — AI Bots (GEO)

Explicitly allowed (critical for GEO visibility): `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Anthropic-ai`, `Bingbot`, `Google-Extended`.
**Never block these bots.** Their indexing drives discoverability in AI-native search.

## Canonical / Meta

- Each page must have a `<title>` under 60 characters
- Meta description: 120-155 characters, action-oriented
- OG image: 1200×630px, PNG format
- Canonical URL should match the production URL exactly
