# Landing Layout Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the centered "AI template" landing layout with a full left-align editorial design — large section numbers, subtle bg/bg-card banding, 6-section structure, 5 components removed from render.

**Architecture:** Modify shared CSS rules in `landing.css` for global alignment, then update each section component individually to add section numbers and remove Eyebrow references. Remove 5 components from `LandingPage.astro`. Delete orphan files.

**Tech Stack:** Astro 5, CSS custom properties, TypeScript (slideshow.ts). No framework, no test suite — validation is `pnpm build` (0 errors) + browser visual check.

---

## File Map

| File | Change |
|------|--------|
| `src/styles/landing.css` | Remove centering from `section h2` + `.section-sub`; add `.section-num`; reduce padding-block; remove bg-alt |
| `src/components/pages/LandingPage.astro` | Remove 5 component imports + JSX |
| `src/components/landing/Problem.astro` | Section 01: remove Eyebrow + icon blobs, add section-num, fix bg, left-align |
| `src/components/landing/DemoSlideshow.astro` | Section 02: add section-num, trim to 4 slides, left-align tabs |
| `src/scripts/slideshow.ts` | Kill autoplay (set isPaused = true always) |
| `src/components/landing/Install.astro` | Section 03: remove Eyebrow, add section-num |
| `src/components/landing/Cta.astro` | Remove dead viking CSS, fix headline weight, remove gradient-text class |
| `src/pages/preview/index.astro` | Delete |
| `src/scripts/reveal.ts` | Delete |

---

## Task 1: Global CSS — left-align + section-num

**Files:**
- Modify: `src/styles/landing.css` (lines ~267–286)

- [ ] **Step 1: Replace `section h2` rule**

Find and replace this block in `landing.css`:
```css
section h2 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  text-align: center;
  letter-spacing: -0.025em;
  margin-bottom: 20px;
  color: var(--text-bright);
}
```
With:
```css
section h2 {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  font-weight: 600;
  text-align: left;
  letter-spacing: -0.02em;
  margin: 0 0 var(--space-4);
  color: var(--text-bright);
}
```

- [ ] **Step 2: Replace `.section-sub` rule**

Find and replace:
```css
.section-sub {
  text-align: center;
  color: var(--text-muted);
  font-size: 1.05rem;
  max-width: 580px;
  margin: 0 auto 52px;
}
```
With:
```css
.section-sub {
  text-align: left;
  color: var(--text-muted);
  font-size: 1.05rem;
  max-width: 560px;
  margin: 0 0 var(--space-8);
}
```

- [ ] **Step 3: Reduce section padding and add `.section-num`**

Find:
```css
section { padding-block: var(--space-13); }
```
Replace with:
```css
section { padding-block: var(--space-11); }

.section-num {
  font-family: var(--font-mono);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--border-light);
  line-height: 1;
  margin-bottom: var(--space-2);
  user-select: none;
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm build 2>&1 | tail -5
```
Expected: `[build] Complete!` with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/landing.css
git commit -m "style(landing): left-align sections, add .section-num, tighten padding"
```

---

## Task 2: LandingPage.astro — remove 5 components

**Files:**
- Modify: `src/components/pages/LandingPage.astro`

- [ ] **Step 1: Remove imports**

Find and delete these 5 import lines:
```typescript
import Capabilities from '../landing/Capabilities.astro'
import Proof from '../landing/Proof.astro'
import ToolComparison from '../landing/ToolComparison.astro'
import CloudWaitlist from '../landing/CloudWaitlist.astro'
import ShareGain from '../landing/ShareGain.astro'
```

- [ ] **Step 2: Remove JSX usages**

Find and delete these 5 lines in the template:
```astro
<Capabilities lang={lang} />
<Proof lang={lang} />
<ToolComparison lang={lang} />
<CloudWaitlist lang={lang} />
<ShareGain lang={lang} />
```

- [ ] **Step 3: Verify build**

```bash
pnpm build 2>&1 | tail -5
```
Expected: `[build] Complete!` with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/LandingPage.astro
git commit -m "feat(landing): remove Capabilities, Proof, ToolComparison, CloudWaitlist, ShareGain from render"
```

---

## Task 3: Problem.astro — Section 01

**Files:**
- Modify: `src/components/landing/Problem.astro`

- [ ] **Step 1: Update frontmatter — remove Eyebrow import**

Replace:
```typescript
import { t, type Lang } from '../../lib/i18n'
import Eyebrow from './Eyebrow.astro'
```
With:
```typescript
import { t, type Lang } from '../../lib/i18n'
```

- [ ] **Step 2: Replace section header markup**

Replace:
```astro
  <div class="section-inner">
    <Eyebrow label={t('eyebrow.problem', lang)} />
    <h2 >{t('problem.title', lang)}</h2>
    <p class="section-sub">{t('problem.sub', lang)}</p>
```
With:
```astro
  <div class="section-inner">
    <div class="section-num">01</div>
    <h2>{t('problem.title', lang)}</h2>
    <p class="section-sub">{t('problem.sub', lang)}</p>
```

- [ ] **Step 3: Remove icon blobs from all 3 cards**

In each `.problem-card`, delete the `<div class="problem-icon ...">...</div>` block (the SVG icon container). There are 3 to remove — one per card (brain, clock, money).

- [ ] **Step 4: Update scoped styles**

In the `<style>` block, make these changes:

Replace `.problem { background: var(--bg-alt); }` with:
```css
.problem { background: var(--bg-card); }
```

Replace `.problem-card:hover { ... }` with (remove `var(--shadow-glow-green)` and `transform`):
```css
.problem-card:hover {
  border-color: var(--border-light);
  box-shadow: var(--shadow-card-hover);
}
```

Delete the entire `.problem-icon`, `.problem-icon.brain`, `.problem-icon.clock`, `.problem-icon.money` rule blocks (they're now unused).

- [ ] **Step 5: Verify build**

```bash
pnpm build 2>&1 | tail -5
```
Expected: `[build] Complete!` with 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/landing/Problem.astro
git commit -m "feat(problem): section 01 — left-align, section-num, remove icon blobs"
```

---

## Task 4: DemoSlideshow.astro — Section 02, 4 slides

**Files:**
- Modify: `src/components/landing/DemoSlideshow.astro`
- Modify: `src/scripts/slideshow.ts`

- [ ] **Step 1: Kill autoplay in slideshow.ts**

In `src/scripts/slideshow.ts`, find line 11:
```typescript
let isPaused = reducedMotion
```
Replace with:
```typescript
let isPaused = true
```
This prevents `startAuto()` from ever being called while preserving the existing play/pause button UI for manual control.

- [ ] **Step 2: Update slideshow tabs — keep 4, reindex**

Replace the entire `<div class="slideshow-nav">` block:
```astro
      <div class="slideshow-nav">
        <button class="slide-tab active" data-slide="0">cargo test</button>
        <button class="slide-tab" data-slide="1">pytest</button>
        <button class="slide-tab" data-slide="2">go test</button>
        <button class="slide-tab" data-slide="3">git diff</button>
        <button class="slide-tab" data-slide="4">git status</button>
        <button class="slide-tab" data-slide="5">git log</button>
        <button class="slide-tab" data-slide="6">read</button>
        <button class="slide-tab" data-slide="7">grep</button>
        <button class="slide-tab" data-slide="8">find</button>
        <button class="slide-tab" data-slide="9">ls</button>
        <button class="slide-tab" data-slide="10">deps</button>
      </div>
```
With:
```astro
      <div class="slideshow-nav">
        <button class="slide-tab active" data-slide="0">cargo test</button>
        <button class="slide-tab" data-slide="1">git diff</button>
        <button class="slide-tab" data-slide="2">git status</button>
        <button class="slide-tab" data-slide="3">find</button>
      </div>
```

- [ ] **Step 3: Remove unused slides from the viewport**

In `<div class="slideshow-viewport">`, keep only these 4 slides (by their original index):
- Slide 0 (`cargo test`) → keep, set `data-index="0"`
- Slide 3 (`git diff`) → keep, set `data-index="1"`, remove `class="slide"` and add `data-index="1"`
- Slide 4 (`git status`) → keep, set `data-index="2"`
- Slide 8 (`find`) → keep, set `data-index="3"`

Delete slides 1 (pytest), 2 (go test), 5 (git log), 6 (read), 7 (grep), 9 (ls), 10 (deps) in their entirety.

Update `data-index` on kept slides to match their new sequential position (0, 1, 2, 3).

Also update the dots section — keep only 4 dots with `data-slide` 0–3.

- [ ] **Step 4: Add section number + left-align header**

Replace:
```astro
    <h2 >{t('demo.title', lang)}</h2>
    <p class="section-sub">{t('demo.sub', lang)}</p>
```
With:
```astro
    <div class="section-num">02</div>
    <h2>{t('demo.title', lang)}</h2>
    <p class="section-sub">{t('demo.sub', lang)}</p>
```

- [ ] **Step 5: Verify build**

```bash
pnpm build 2>&1 | tail -5
```
Expected: `[build] Complete!` with 0 errors.

- [ ] **Step 6: Verify slideshow works**

Start dev server (`pnpm dev`) and navigate to `http://localhost:4321/`. The Demo section should show 4 tabs (cargo test / git diff / git status / find). Clicking tabs switches slides. No auto-advance.

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/DemoSlideshow.astro src/scripts/slideshow.ts
git commit -m "feat(demo): section 02 — 4 slides, no autoplay, section-num, left-align"
```

---

## Task 5: Install.astro — Section 03

**Files:**
- Modify: `src/components/landing/Install.astro`

- [ ] **Step 1: Remove Eyebrow import**

In the frontmatter, replace:
```typescript
import { t, type Lang } from '../../lib/i18n'
import Eyebrow from './Eyebrow.astro'
```
With:
```typescript
import { t, type Lang } from '../../lib/i18n'
```

- [ ] **Step 2: Replace section header**

Replace:
```astro
    <Eyebrow label={t('eyebrow.get_started', lang)} />
    <h2 >{t('install.title', lang)}</h2>
    <p class="section-sub">{t('install.sub', lang)}</p>
```
With:
```astro
    <div class="section-num">03</div>
    <h2>{t('install.title', lang)}</h2>
    <p class="section-sub">{t('install.sub', lang)}</p>
```

- [ ] **Step 3: Set explicit background in scoped styles**

In the `<style>` block of Install.astro, add at the top of the section rules:
```css
.install-section { background: var(--bg-card); }
```

- [ ] **Step 4: Verify build**

```bash
pnpm build 2>&1 | tail -5
```
Expected: `[build] Complete!` with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/Install.astro
git commit -m "feat(install): section 03 — section-num, remove Eyebrow, set bg"
```

---

## Task 6: Cta.astro — cleanup

**Files:**
- Modify: `src/components/landing/Cta.astro`

- [ ] **Step 1: Remove dead CSS from scoped styles**

In the `<style>` block, delete these now-dead rules (the HTML was already removed):
```css
.cta-viking-bg {
  position: absolute;
  ...
}

.cta-viking-bg img {
  ...
}
```

- [ ] **Step 2: Fix headline**

Replace:
```astro
    <h2 class="cta-headline">
      <span>{t('cta.title_1', lang)}</span><br>
      <span class="gradient-text">{t('cta.title_2', lang)}</span>
    </h2>
```
With:
```astro
    <h2 class="cta-headline">
      {t('cta.title_1', lang)}<br>
      <span class="cta-accent">{t('cta.title_2', lang)}</span>
    </h2>
```

- [ ] **Step 3: Update `.cta-headline` styles**

In the scoped `<style>`, update `.cta-headline`:
```css
.cta-headline {
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: var(--space-4) 0 var(--space-5);
  text-align: center;
}

.cta-accent {
  color: var(--accent);
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm build 2>&1 | tail -5
```
Expected: `[build] Complete!` with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/Cta.astro
git commit -m "fix(cta): remove dead viking CSS, fix headline weight + accent"
```

---

## Task 7: Delete orphan files

**Files:**
- Delete: `src/pages/preview/index.astro`
- Delete: `src/scripts/reveal.ts`

- [ ] **Step 1: Delete preview page**

```bash
rm src/pages/preview/index.astro
```

- [ ] **Step 2: Delete reveal.ts**

```bash
rm src/scripts/reveal.ts
```

- [ ] **Step 3: Verify no dangling imports**

```bash
grep -r "reveal" src/ --include="*.astro" --include="*.ts"
grep -r "preview" src/ --include="*.astro" --include="*.ts" | grep -v "# Preview"
```
Expected: 0 matches (or only unrelated hits).

- [ ] **Step 4: Verify build**

```bash
pnpm build 2>&1 | tail -5
```
Expected: `[build] Complete!` with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: delete /preview route and reveal.ts"
```

---

## Task 8: Final visual check + FAQ left-align

**Files:**
- Modify: `src/components/pages/LandingPage.astro` (FAQ inline section)

- [ ] **Step 1: Left-align FAQ section header**

In `LandingPage.astro`, find the inline FAQ section:
```astro
      <section class="faq-section" id="faq">
      <div class="section-inner">
        <h2 >Frequently asked questions</h2>
```
Replace with:
```astro
      <section class="faq-section" id="faq">
      <div class="section-inner">
        <h2>Frequently asked questions</h2>
```
(The global `section h2` rule now handles left-align — just ensure no inline style is overriding it.)

Then add a scoped style block at the bottom of LandingPage.astro (before the closing `</Layout>`):
```astro
<style>
  .faq-section { background: var(--bg-card); }
</style>
```

- [ ] **Step 2: Start dev server and visual check**

```bash
pnpm dev
```

Open `http://localhost:4321/` and verify:
- [ ] All section titles are left-aligned (not centered)
- [ ] Section numbers 01 / 02 / 03 appear in muted mono above headings
- [ ] Background banding: Hero (dark) → Problem (slightly lighter) → Demo (dark) → Install (lighter) → CTA (dark) → FAQ (lighter)
- [ ] Problem cards have no icon blobs
- [ ] Demo shows 4 tabs only, no auto-advance
- [ ] CTA headline has accent color on second line, weight 600
- [ ] No "Works with" duplication

- [ ] **Step 3: Final build**

```bash
pnpm build 2>&1 | tail -5
```
Expected: `[build] Complete!` with 0 errors.

- [ ] **Step 4: Final commit**

```bash
git add src/components/pages/LandingPage.astro
git commit -m "feat(landing): finalize layout redesign — left-align, section numbers, 6-section structure"
```
