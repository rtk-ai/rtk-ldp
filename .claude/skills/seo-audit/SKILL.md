---
name: seo-audit
description: Full SEO audit for rtk-ldp landing pages — JSON-LD schemas, OG tags, meta, robots, titles. Outputs a structured pass/fail checklist with score.
---

# SEO Audit Skill

Run a full SEO + GEO audit on all pages of the RTK landing site.

## Scope

Pages to audit: `src/pages/index.astro`, `src/pages/vox/index.astro`, `src/pages/icm/index.astro`

## Checklist (15 points)

For each page, verify:

**Meta (3 pts)**
- [ ] `<title>` present and under 60 characters
- [ ] `<meta name="description">` present, 120-155 characters
- [ ] Canonical URL set and matches production URL

**Open Graph (3 pts)**
- [ ] `og:title`, `og:description`, `og:image` all present
- [ ] OG image is PNG format, 1200×630px
- [ ] `og:url` matches canonical

**JSON-LD Schemas (5 pts)**
- [ ] At least one `<script type="application/ld+json">` present
- [ ] JSON is valid (parseable without errors)
- [ ] `@context: "https://schema.org"` present at root level
- [ ] `@type` matches expected schema for the page (see `.claude/rules/seo-geo.md`)
- [ ] No `@context` duplication inside `@graph` child objects

**GEO / AI Visibility (2 pts)**
- [ ] `robots.txt` allows GPTBot, PerplexityBot, ClaudeBot, Anthropic-ai
- [ ] SpeakableSpecification or FAQ schema present on main page

**Technical (2 pts)**
- [ ] No broken internal links (spot-check nav anchor hrefs)
- [ ] Sitemap or sitemap reference exists

## Output Format

For each page:
```
## /page-path
Score: X/15
PASS: [list of passing items]
FAIL: [list of failing items with specific fix needed]
```

Final summary: total score across all pages + top 3 priority fixes.
