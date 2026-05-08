---
name: audit-seo
description: Full SEO + GEO audit of all landing pages — runs schema-check + seo-audit skills and produces a prioritized findings report.
---

Run a comprehensive SEO and GEO audit of the RTK landing site.

## Execution Order

1. **Schema validation** — invoke `Skill(schema-check)` to validate all JSON-LD blocks
2. **Full SEO checklist** — invoke `Skill(seo-audit)` to run 15-point checklist per page
3. **Meta tags grep** — extract and display `<title>` and `<meta name="description">` from all pages:
```bash
grep -n "<title>" src/pages/*.astro src/pages/**/*.astro 2>/dev/null
grep -n 'name="description"' src/pages/*.astro src/pages/**/*.astro 2>/dev/null
```
4. **OG tags check** — grep for og:title, og:image, og:description
5. **robots.txt review** — confirm AI bots are allowed

## Output

Produce a single consolidated report:

```
# SEO Audit — RTK Landing (YYYY-MM-DD)

## Score Summary
/ (home): XX/15
/vox/:    XX/15
/icm/:    XX/15
Total:    XX/45

## Critical Issues (fix immediately)
...

## High Priority (fix before next release)
...

## Low Priority (nice to have)
...

## What's Working
...
```

Reference `.claude/rules/seo-geo.md` for schema rules.
