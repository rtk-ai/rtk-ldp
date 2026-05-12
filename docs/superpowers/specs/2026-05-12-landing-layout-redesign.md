# Landing Layout Redesign — Design Spec
**Date:** 2026-05-12
**Branch:** feat/identity-redesign-v2
**Status:** Approved, ready for implementation

---

## Context

The current RTK landing page has a "AI template" aesthetic driven by three structural problems:
1. Every section alternates `bg` / `bg-alt` — the classic generated-page pattern
2. Too many sections stacked (11) — overwhelming scroll without clear hierarchy
3. All content centered at 680px — no editorial width, no left-alignment

The Identity Redesign v2 started with palette B (Slate dark) and two-column Hero. This spec defines the full layout system for the landing page and the content redistribution strategy.

---

## Decisions

### 1. Layout direction
**Full left-align** (Linear / Vercel reference)

- All eyebrows, section numbers, headings, body text — left-aligned
- `text-align: center` removed everywhere except the CTA section
- Grids start from the left edge of `--max-w`, not centered within a narrower column
- `--max-w` stays 1140px; text body capped at ~560px for readability; visuals (terminals, tables) run full width

### 2. Section separation
**Subtle bg / bg-card banding** — delta quasi invisible (`#0a0f1c` → `#0f1625`)

- No `bg-alt` (`#0d1322`) — replaced by `bg-card` (`#0f1625`) when a section needs background contrast
- Pattern: Hero on `bg`, Problem on `bg-card`, Demo on `bg`, Install on `bg-card`, CTA on `bg`, FAQ on `bg-card`
- No `border-bottom` or `border-top` between sections — spacing alone defines rhythm within a band, the color shift does the rest
- Sections lose `padding-block: var(--space-13)` — tighter at `var(--space-11)` / `var(--space-12)` max

### 3. Section header treatment
**Large muted number + H2** (editorial)

```
01                          ← font-mono, ~2.5rem, color: var(--border-light)
Section title here          ← H2, font-weight 600, left-aligned
Short lead text.            ← max-width 560px, color: var(--text-muted)
```

- Number: `font-family: var(--font-mono)`, `font-size: clamp(2rem, 4vw, 3rem)`, `color: var(--border-light)`, `line-height: 1`, `margin-bottom: var(--space-2)`
- H2: `font-size: clamp(1.8rem, 3.5vw, 2.5rem)`, `font-weight: 600`, `letter-spacing: -0.02em`, `margin: 0 0 var(--space-4)`
- Lead: `font-size: 1.05rem`, `color: var(--text-muted)`, `max-width: 560px`, `margin: 0 0 var(--space-8)`
- No eyebrow component above the number — the number IS the section marker

---

## Landing Page Structure

**6 sections only** — strict order:

| # | Section | Component | Background |
|---|---------|-----------|------------|
| — | Hero | `Hero.astro` | `var(--bg)` |
| 01 | Problem | `Problem.astro` | `var(--bg-card)` |
| 02 | Demo | `DemoSlideshow.astro` | `var(--bg)` |
| 03 | Install | `Install.astro` | `var(--bg-card)` |
| — | CTA | `Cta.astro` | `var(--bg)` |
| — | FAQ | inline in LandingPage | `var(--bg-card)` |

**Removed from landing render** (keep files, they move to subpages):
- `CompatibilityStrip` — already removed (in Hero)
- `Capabilities` — content folded into Problem lead text
- `Proof` — moves to `/savings/`
- `ToolComparison` — moves to `/vs/`
- `CloudWaitlist` — moves to `/cloud/`
- `ShareGain` — moves to `/savings/`

---

## Section-by-Section Design

### Hero (already done ✅)
Two-column: content left / terminal right. Stats 89% / 24.6M / {stars}. Compat strip below terminal. No changes needed.

### Problem — section 01
**Layout:** Section number + H2 left, then 3-column card grid full width.

Cards: flat, `bg-elevated` background, left-aligned content inside. Each card:
- Big stat in `var(--accent)` mono (e.g. `~900 tokens`)
- Command in `<code>` tag
- 1-2 sentences of explanation

Remove the colored icon blobs (brain, clock, dollar) — they read "template". Replace with the stat number as the visual anchor.

### Demo — section 02
**Layout:** Section number + H2 left. Slideshow tabs left-aligned (not centered). Terminal panel full width.

Reduce from 11 slides to 4: `cargo test`, `git status`, `find`, `git diff`. Kill the 7s auto-rotate (`slideshow.ts:38` — set interval to 0 or remove).

### Install — section 03
**Layout:** Two-column split — left: number + H2 + persona tabs; right: terminal with command.

Removes the current centered block layout. Persona tabs become a vertical list on the left at mobile, horizontal at desktop.

### CTA
Centered exception — intentional contrast with the left-aligned rest of the page. Keep `min-height: 80vh`. Remove `cta-viking-bg` styles. Remove gradient headline — plain `var(--text-bright)` with one `var(--accent)` word.

### FAQ
Left-aligned questions, `<details>` / `<summary>` pattern unchanged. No section number — the CTA acts as a visual break before FAQ, so FAQ is a utility section without a number marker.

---

## Content Redistribution (Phase 2)

| Content | From | To | Notes |
|---------|------|----|-------|
| ToolComparison | landing | `/vs/` | Full comparison table, all AI tools |
| Proof (screenshots) | landing | `/savings/` | Real-world rtk gain data |
| ShareGain | landing | `/savings/` | Paste & share flow |
| CloudWaitlist | landing | `/cloud/` | Already has product page |

---

## CSS Changes Required

### `landing.css`
- Remove all `text-align: center` from section rules (except `.cta-section`)
- Remove `.section-inner > h2::after` (gradient underline)
- Add `.section-num` utility class (large muted mono number)
- Remove `.section-sub` max-width centering — replace with `max-width: 560px` left
- Remove alternating `background` rules between sections
- Remove `.reveal` and `.gradient-text` references (already done)

### Component scoped styles
Each component's `<style>` needs:
- Headings: `text-align: left` (remove any `text-align: center`)
- Stats/grids: `justify-content: flex-start` (remove centering)
- Section background set explicitly (each component owns its bg)

---

## Out of Scope (this spec)
- Subpage redesign (/vs/, /savings/, /cloud/, /vox/, /icm/) — Phase 2
- Starlight /guide/* — Phase 3
- Nav/header changes
- Mobile-specific layout beyond responsive breakpoints

---

## Implementation Order

1. `landing.css` — remove centering, add `.section-num`, update section backgrounds
2. `Problem.astro` — section 01, new card style, remove icon blobs
3. `DemoSlideshow.astro` — section 02, left-align tabs, 4 slides, kill autoplay
4. `Install.astro` — section 03, two-column split
5. `Cta.astro` — remove dead CSS, simplify headline
6. `LandingPage.astro` — remove Proof, ToolComparison, CloudWaitlist, ShareGain, Capabilities from render
7. Delete `/preview` route + `src/scripts/reveal.ts`
8. Verify build + visual check
