---
name: review
description: Code review for rtk-ldp — Astro components, CSS token compliance, design system rules, generated file integrity, and build correctness.
---

Run a thorough code review of the current changes against the RTK Landing standards.

## Step 1 — Diff scope

```bash
git diff --name-only HEAD
git diff HEAD --stat
```

If no staged/unstaged changes, review the last commit: `git diff HEAD~1 HEAD --name-only`.

## Step 2 — Read changed files

Read every changed `.astro`, `.css`, `.ts`, `.mjs`, `.md` file in full before issuing findings.

## Step 3 — Checklist

### 3a. CSS Token Compliance (BLOCKER)

Check every changed `.astro` and `.css` file:

- No inline `color:`, `background:`, `border-color:`, `fill:` using raw hex values that match a design token
- Tokens to enforce (source: `src/styles/global.css`):
  - `--bg: #060b18`, `--bg-alt: #0c1225`, `--bg-card: #0f1629`
  - `--text: #e2e8f0`, `--text-muted: #8294ab`, `--text-dim: #64748b`
  - `--accent: #00e599`, `--cyan: #38bdf8`, `--violet: #a78bfa`, `--border: #1a2344`
- No duplicate token declarations in `src/styles/landing.css` (tokens defined in `global.css` must not be redefined)
- New color values must be added to `global.css` as tokens, not hardcoded

### 3b. Generated Files Integrity

These files must NEVER be manually edited:

| File                              | Generator                        |
| --------------------------------- | -------------------------------- |
| `src/content/docs/guide/**`       | `scripts/prepare-docs.mjs`       |
| `src/data/docs-search-entries.ts` | `scripts/build-search-index.mjs` |
| `src/data/docs-anchor-map.json`   | `scripts/prepare-docs.mjs`       |

Flag any manual edits to these files.

### 3c. Source of Truth Compliance

| Data             | Must be in                                                         | Never in                  |
| ---------------- | ------------------------------------------------------------------ | ------------------------- |
| RSS entries      | `src/data/rss-entries.ts`                                          | `src/pages/rss.xml.ts`    |
| Nav anchor links | `Nav.astro` / `ProductNav.astro` with absolute paths (`/#section`) | Inline in pages           |
| Docs content     | `rtk/docs/guide/` (external repo)                                  | `src/content/docs/guide/` |

### 3d. Astro Component Quality

- No inline styles for anything covered by a design token
- Component props typed with TypeScript interfaces
- No `<style>` blocks using magic hex values
- Imports cleaned up (no unused imports)
- No hardcoded URLs in components — use constants or config

### 3e. Nav Architecture

- Landing (`/`): uses `Nav.astro`
- Product pages (`/vox/`, `/icm/`): uses `ProductNav.astro`
- Docs (`/guide/**`): uses `Header.astro` via Starlight override

Anchor links must use absolute paths (`/#problem`, not `#problem`) so they work from any page.

### 3f. Build Readiness

If `.astro`, `.ts`, or `.mjs` files were changed, run:

```bash
rtk pnpm build 2>&1 | head -80
```

Report: pass/fail, error count, pages generated.

## Step 4 — Report

```
## Code Review — RTK Landing

**Files reviewed**: [list]
**Date**: [YYYY-MM-DD]

### Blockers
[BLOCKER] file.astro:42 — Hardcoded `#00e599` — use `var(--accent)` instead
...

### Warnings
[WARN] landing.css:15 — Duplicates `--text` token already in global.css
...

### Token violations
| File | Line | Value | Token to use |
|------|------|-------|-------------|
| ... | ... | ... | ... |

### Generated files
[OK] No manual edits detected
or
[BLOCKER] src/content/docs/guide/commands.md edited manually — regenerate via prepare-docs.mjs

### Build
[PASS] 12 pages generated, 0 errors
or
[FAIL] Build errors: [list]

### Summary
- Blockers: X
- Warnings: Y
- Token violations: Z
- Build: PASS/FAIL

Verdict: [READY / NEEDS FIXES]
```

## Post-review

If blockers exist: do not proceed until fixed.
If only warnings: propose fixes and let user decide.
If READY: suggest `pnpm build && git push` (never run push automatically).
