---
name: build-check
description: Run pnpm build and report errors, warnings, and bundle sizes. Enforces the "pnpm build must pass before push" rule.
---

Run a full production build and report the results.

## Steps

1. Run the build:
```bash
rtk pnpm build 2>&1
```

2. Parse output:
   - List all TypeScript errors (grouped by file)
   - List all Astro build errors
   - List any warnings about missing assets or broken links
   - Report final bundle sizes from `dist/` if build succeeded

3. Report format:
   - If 0 errors: "Build passed. X pages generated. dist/ size: YMB"
   - If errors: list them grouped by file with line numbers

## Success Criteria

Build passes when:
- Exit code 0
- 0 TypeScript errors
- All pages generated
- `/rss.xml` endpoint reachable in dist/

## After Build

If build fails, diagnose root cause before suggesting fixes.
Do not push to main until `pnpm build` passes with 0 errors.
