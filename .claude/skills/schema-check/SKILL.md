---
name: schema-check
description: Validate all JSON-LD scripts in Astro pages — check parsability, @context, @type, and Layout.astro auto-inject compatibility.
---

# Schema Check Skill

Extract and validate all `<script type="application/ld+json">` blocks from Astro source files.

## What to Check

1. **Find all JSON-LD scripts** in `src/pages/**/*.astro` and `src/layouts/*.astro`

2. **For each script block:**
   - Is the JSON parseable? (`JSON.parse()` equivalent check)
   - Does it have `@context: "https://schema.org"` at root?
   - Does it have `@type`?
   - If it's a `@graph`, do children NOT have `@context`?

3. **Layout.astro auto-inject check:**
   - `Layout.astro` auto-injects a `WebPage` schema when it receives a simple schema object
   - If a page passes a `@graph` object → Layout detects it and skips injection
   - Verify: pages with `@graph` are NOT getting a duplicate `WebPage` from Layout

4. **Schema type validation per page:**
   - `/` → expects `@graph` with Organization, SoftwareApplication, FAQPage, HowTo, WebPage
   - `/vox/`, `/icm/` → expects SoftwareApplication (Layout adds WebPage)
   - `/guide/*` → BreadcrumbList + TechArticle (Starlight Head override)

## Output Format

```
Page: src/pages/index.astro
  PASS: JSON parseable
  PASS: @context present at root
  PASS: @graph detected — Layout injection skipped
  FAIL: HowTo schema missing 'step' property

Page: src/pages/vox/index.astro
  PASS: JSON parseable
  PASS: SoftwareApplication schema correct
  WARN: No operatingSystem property (optional but recommended)
```

Report all issues with file + line reference where possible.
