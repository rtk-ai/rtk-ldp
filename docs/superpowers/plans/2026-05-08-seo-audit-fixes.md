# SEO Audit Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply all fixes identified in the 2026-05-08 SEO audit to reach 45/45 + clean up orphan assets.

**Architecture:** 5 targeted file edits + 8 file deletions. No new files, no new components. Each task is self-contained and independently deployable.

**Tech Stack:** Astro 5, CSS custom properties, static site — changes are pure content/markup edits.

---

## File Map

| File | Change |
|------|--------|
| `src/pages/icm/index.astro:154` | Add `width` and `height` to hero banner `<img>` |
| `src/pages/index.astro:168` | Shorten meta `description` prop from 182 to ≤155 chars |
| `src/pages/vox/index.astro:115` | Shorten meta `description` prop from 158 to ≤155 chars |
| `src/pages/vox/index.astro:8-32` | Add `datePublished` to SoftwareApplication schema |
| `src/pages/icm/index.astro:8-32` | Add `datePublished` to SoftwareApplication schema |
| `src/layouts/Layout.astro:36-51` | Add `@id` to auto-injected `webPageSchema` |
| `public/assets/illustrations/viking-*.jpg` | Delete 8 orphan JPG files (WebP equivalents already exist) |

---

## Task 1 — Fix ICM hero img: add width + height

**Why:** Missing `width`/`height` causes CLS (layout shift). Google penalizes CLS > 0.1 in Core Web Vitals.

**Files:**
- Modify: `src/pages/icm/index.astro:154`

- [ ] **Edit the img tag**

  Replace:
  ```html
  <img src="/og-icm-banner.png" alt="ICM — Infinite Context Memory" class="icm-hero-banner" loading="eager">
  ```
  With:
  ```html
  <img src="/og-icm-banner.png" alt="ICM — Infinite Context Memory" class="icm-hero-banner" loading="eager" width="1200" height="630">
  ```

- [ ] **Verify build passes**
  ```bash
  pnpm build
  ```
  Expected: 0 errors, no CLS warnings.

- [ ] **Commit**
  ```bash
  git add src/pages/icm/index.astro
  git commit -m "fix(seo): add width/height to ICM hero banner img — prevents CLS"
  ```

---

## Task 2 — Trim homepage meta description

**Why:** Current description is 182 chars. Google truncates at ~155 and may rewrite it, losing control of the snippet.

**Files:**
- Modify: `src/pages/index.astro:168`

- [ ] **Edit the `description` prop on `<Layout>`**

  Current (182 chars):
  ```
  RTK reduces Claude Code token usage by 60-90% — measured across 2,900+ real commands. 89% avg noise removed, 3x longer sessions, zero config. Free, open source, MIT, written in Rust.
  ```
  Replace with (153 chars):
  ```
  RTK reduces Claude Code token usage by 60-90% — measured across 2,900+ real commands. 89% avg noise removed, 3x longer sessions, zero config. MIT licensed.
  ```

  In context (line 168 of index.astro):
  ```astro
  <Layout
    title="RTK — Rust Token Killer"
    description="RTK reduces Claude Code token usage by 60-90% — measured across 2,900+ real commands. 89% avg noise removed, 3x longer sessions, zero config. MIT licensed."
    schemaOrg={schemaOrg}
  >
  ```

- [ ] **Verify char count**
  ```bash
  python3 -c "print(len('RTK reduces Claude Code token usage by 60-90% — measured across 2,900+ real commands. 89% avg noise removed, 3x longer sessions, zero config. MIT licensed.'))"
  ```
  Expected: `153`

- [ ] **Commit**
  ```bash
  git add src/pages/index.astro
  git commit -m "fix(seo): trim homepage meta description to 153 chars (was 182)"
  ```

---

## Task 3 — Trim /vox/ meta description

**Why:** 158 chars, 3 over the 155 limit. Minor but clean.

**Files:**
- Modify: `src/pages/vox/index.astro:115`

- [ ] **Edit the `description` prop**

  Current (158 chars):
  ```
  Vox is a local-first TTS CLI for Claude Code. Hear when tasks finish, get spoken summaries, clone your own voice. 3 backends, cross-platform, written in Rust.
  ```
  Replace with (131 chars):
  ```
  Vox is a local-first TTS CLI for Claude Code. Hear when tasks finish, get spoken summaries, clone your own voice. Written in Rust.
  ```

  In context (line ~114-116):
  ```astro
  <Layout
    title="Vox — Give Claude Code a Voice | rtk-ai"
    description="Vox is a local-first TTS CLI for Claude Code. Hear when tasks finish, get spoken summaries, clone your own voice. Written in Rust."
    image="/og-vox.png"
    schemaOrg={schemaOrg}
  >
  ```

- [ ] **Verify char count**
  ```bash
  python3 -c "print(len('Vox is a local-first TTS CLI for Claude Code. Hear when tasks finish, get spoken summaries, clone your own voice. Written in Rust.'))"
  ```
  Expected: `131`

- [ ] **Commit**
  ```bash
  git add src/pages/vox/index.astro
  git commit -m "fix(seo): trim vox meta description to 131 chars (was 158)"
  ```

---

## Task 4 — Add datePublished to /vox/ and /icm/ schemas

**Why:** Freshness signal for Google. `dateModified` alone is incomplete — `datePublished` anchors the original release date.

**Files:**
- Modify: `src/pages/vox/index.astro` (SoftwareApplication object, around line 12)
- Modify: `src/pages/icm/index.astro` (SoftwareApplication object, around line 12)

- [ ] **Add `datePublished` to /vox/ SoftwareApplication**

  In `src/pages/vox/index.astro`, inside the SoftwareApplication object, add after `dateModified`:
  ```ts
  datePublished: '2025-06-01',
  dateModified: buildDate,
  ```

- [ ] **Add `datePublished` to /icm/ SoftwareApplication**

  In `src/pages/icm/index.astro`, same location:
  ```ts
  datePublished: '2025-09-01',
  dateModified: buildDate,
  ```

- [ ] **Commit**
  ```bash
  git add src/pages/vox/index.astro src/pages/icm/index.astro
  git commit -m "feat(seo): add datePublished to vox and icm SoftwareApplication schemas"
  ```

---

## Task 5 — Add @id to Layout.astro auto-injected WebPage

**Why:** Entity linking in AI search engines (Perplexity, ChatGPT) works better when WebPage has a stable `@id` URI. Currently the auto-injected schema has no `@id`, so it can't be cross-referenced.

**Files:**
- Modify: `src/layouts/Layout.astro:36-51`

- [ ] **Edit the `webPageSchema` object in Layout.astro**

  Current (line ~36):
  ```ts
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonical,
    inLanguage: 'en',
    dateModified: buildDate,
    isPartOf: { '@type': 'WebSite', name: 'RTK', url: siteUrl },
    publisher: {
      '@type': 'Organization',
      name: 'RTK AI',
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: siteUrl + '/favicon.svg' },
    },
  }
  ```

  Replace with:
  ```ts
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': canonical + '#webpage',
    name: title,
    description,
    url: canonical,
    inLanguage: 'en',
    dateModified: buildDate,
    isPartOf: { '@type': 'WebSite', name: 'RTK', url: siteUrl },
    publisher: {
      '@type': 'Organization',
      name: 'RTK AI',
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: siteUrl + '/favicon.svg' },
    },
  }
  ```

  Note: `canonical` already ends with `/` for root URLs and `/vox/` etc., so the resulting `@id` values will be:
  - `/vox/` → `https://www.rtk-ai.app/vox/#webpage`
  - `/icm/` → `https://www.rtk-ai.app/icm/#webpage`
  - `/404` → `https://www.rtk-ai.app/404/#webpage`

- [ ] **Commit**
  ```bash
  git add src/layouts/Layout.astro
  git commit -m "feat(seo): add @id to auto-injected WebPage schema in Layout.astro"
  ```

---

## Task 6 — Delete orphan JPG illustrations

**Why:** All components already reference `.webp` versions (which exist). The 8 `.jpg` files are source originals that were never deleted. They add ~3-8MB to the repo and deploy unnecessarily.

**Files:**
- Delete: `public/assets/illustrations/viking-*.jpg` (8 files)

- [ ] **Verify WebP files all exist before deleting**
  ```bash
  ls public/assets/illustrations/*.webp
  ```
  Expected: 8 files listed (compare, cta, demo, hero, install, problem, proof, share).

- [ ] **Delete the JPG originals**
  ```bash
  rm public/assets/illustrations/viking-compare.jpg \
     public/assets/illustrations/viking-cta.jpg \
     public/assets/illustrations/viking-demo.jpg \
     public/assets/illustrations/viking-hero.jpg \
     public/assets/illustrations/viking-install.jpg \
     public/assets/illustrations/viking-problem.jpg \
     public/assets/illustrations/viking-proof.jpg \
     public/assets/illustrations/viking-share.jpg
  ```

- [ ] **Verify build still passes (no broken img refs)**
  ```bash
  pnpm build
  ```
  Expected: 0 errors. No component references the `.jpg` files.

- [ ] **Commit**
  ```bash
  git add -u public/assets/illustrations/
  git commit -m "chore: remove orphan JPG illustrations (WebP equivalents already in place)"
  ```

---

## Final verification

- [ ] **Run full build**
  ```bash
  pnpm build
  ```
  Expected: 0 errors, 0 warnings on images.

- [ ] **Spot-check rendered schemas** — open `dist/index.html`, `dist/vox/index.html`, `dist/icm/index.html` and search for `application/ld+json` to confirm schemas are present and well-formed.

- [ ] **Push to deploy**
  ```bash
  git push
  ```
