# Context Forge — Landing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the RTK landing page identity by stealing LeanCTX's discipline (whitespace, card consistency, macro-frame) while keeping RTK's moats (vikings, DemoSlideshow, per-command stats, ShareGain, Vox+ICM suite).

**Architecture:** Add a calm visual baseline (CSS tokens, utility classes, section whitespace) then layer new components on top: a "Context Forge" suite section, a "Works with" compatibility strip, and a compressed hero. Refactor existing Problem, CTA, and Install sections. Zero new routes.

**Tech Stack:** Astro 5, CSS custom properties (no framework), JetBrains Mono + DM Sans, Rust/Astro static build via `pnpm build`.

---

## File Map

### Create
| File | Role |
|------|------|
| `src/components/landing/Capabilities.astro` | "Context Forge" section — 3-card product suite |
| `src/components/landing/CompatibilityStrip.astro` | "Works with" pill row below Hero |
| `src/components/landing/Eyebrow.astro` | Reusable `// 01 — label` mono eyebrow |

### Modify
| File | What changes |
|------|-------------|
| `src/styles/global.css:64` | Add `--space-13`, `--space-14` after current spacing scale |
| `src/styles/global.css:91` | Add card-muted, pill, eyebrow, hero-subhead tokens before closing `}` |
| `src/styles/landing.css` | Add `.section-calm`, `.card-muted`, `.pill-neutral`, `.eyebrow` utilities |
| `src/styles/landing.css` | Hero stats: shrink to mono, remove glow |
| `src/styles/landing.css` | Hero `.hero-context`: move to `--text-muted` small block below fold |
| `src/components/landing/Hero.astro:59-61` | Wrap `hero-context` in `<details>` / relocate |
| `src/components/landing/Problem.astro` | Cards → `.card-muted`, red → inside `<pre>` only |
| `src/components/landing/Cta.astro` | Viewport-height, tri-gradient on H2, viking at 30% opacity |
| `src/components/landing/Install.astro` | Add 3-tab persona picker above install cards |
| `src/pages/index.astro:2-16` | Import + insert `<Capabilities>` and `<CompatibilityStrip>` |

---

## Task 1 — CSS Tokens (foundation for all other tasks)

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add spacing tokens after line 64** (`--space-12` line)

```css
  --space-12: 8.75rem;   /* 140px */
  /* Calm-mode section padding (added for Context Forge redesign) */
  --space-13: 9rem;      /* 144px */
  --space-14: 11.25rem;  /* 180px — final CTA / hero breathing room */
```

- [ ] **Step 2: Add component tokens before the closing `}` of `:root` (after line 90)**

```css
  /* Card — muted baseline (no glow, no shadow, neutral) */
  --card-muted-bg: var(--bg-card);
  --card-muted-border: var(--border);
  --card-muted-radius: var(--radius);

  /* Pill — neutral compatibility tag */
  --pill-bg: var(--bg-card);
  --pill-border: var(--border-light);
  --pill-text: var(--text-muted);
  --pill-padding: 0.5rem 0.875rem;

  /* Section eyebrow — `// 01 — label` mono style */
  --eyebrow-color: var(--text-dim);
  --eyebrow-size: var(--text-xs);
  --eyebrow-font: var(--font-mono);
  --eyebrow-tracking: 0.08em;

  /* Hero subhead constraint */
  --hero-subhead-max-w: 32rem;
```

- [ ] **Step 3: Verify no duplicate token names**

```bash
grep -n "space-13\|space-14\|card-muted\|pill-bg\|eyebrow-color\|hero-subhead-max-w" src/styles/global.css
```

Expected: each name appears exactly once.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(tokens): add calm-mode spacing, card-muted, pill, eyebrow tokens"
```

---

## Task 2 — CSS Utilities (landing.css)

**Files:**
- Modify: `src/styles/landing.css`

- [ ] **Step 1: Add utility section at the end of `landing.css`**

```css
/* ── Context Forge Redesign — Utility classes ───────────────────────── */

/* Section with calm-mode breathing room */
.section-calm {
  padding-block: var(--space-13);
}

/* Neutral muted card — no glow, no colored border */
.card-muted {
  background: var(--card-muted-bg);
  border: 1px solid var(--card-muted-border);
  border-radius: var(--card-muted-radius);
}

/* Compatibility pill — neutral tool tag */
.pill-neutral {
  background: var(--pill-bg);
  border: 1px solid var(--pill-border);
  color: var(--pill-text);
  padding: var(--pill-padding);
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-family: var(--font-body);
  display: inline-block;
  white-space: nowrap;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.pill-neutral:hover {
  border-color: var(--border-light);
  color: var(--text-muted);
}

/* Section eyebrow label — `// 01 — label` mono style */
.eyebrow {
  color: var(--eyebrow-color);
  font-size: var(--eyebrow-size);
  font-family: var(--eyebrow-font);
  letter-spacing: var(--eyebrow-tracking);
  text-transform: uppercase;
  display: block;
  margin-bottom: 1rem;
}
```

- [ ] **Step 2: Build to confirm no CSS syntax errors**

```bash
pnpm build 2>&1 | head -30
```

Expected: build completes with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/landing.css
git commit -m "feat(styles): add .section-calm, .card-muted, .pill-neutral, .eyebrow utilities"
```

---

## Task 3 — Hero compression

**Files:**
- Modify: `src/components/landing/Hero.astro:42-61`
- Modify: `src/styles/landing.css` (hero-stats, hero-context rules)

The hero-context paragraph (lines 59-61) is a 600-char SEO block that competes with the H1 for visual weight. The stats are over-sized and glowing. Both changes reduce cognitive load above the fold.

- [ ] **Step 1: Wrap `hero-context` in a `<details>` to push it below the visual fold**

Replace `Hero.astro:59-61` (the entire `<p class="hero-context">` block):

```html
      <details class="hero-context-details">
        <summary class="hero-context-toggle">Why RTK? The numbers.</summary>
        <p class="hero-context">
          RTK demonstrably removes an average of 89% of CLI output noise before it enters the AI context window — measured internally across 2,900+ real-world developer commands. The result: AI coding sessions extend by up to 3x, token costs drop 60-90%, and reasoning quality improves because the context window holds code instead of boilerplate. Per-command measurements: <code>cargo test</code> 91.8% savings, <code>git status</code> 80.8%, <code>find</code> 78.3%, <code>grep</code> 49.5%. On pay-per-token setups, a 10-developer team eliminates roughly $1,750/month in wasted spend. RTK is free, open source (MIT), written in Rust — activate with <code>rtk init --global</code>.
        </p>
      </details>
```

- [ ] **Step 2: Add hero-context-details styles to `landing.css`** (add after `.hero-context` existing rules, or add new block at end):

```css
/* Hero context — collapsible SEO block */
.hero-context-details {
  margin-top: var(--space-5);
  max-width: var(--hero-subhead-max-w);
}

.hero-context-toggle {
  font-size: var(--text-sm);
  color: var(--text-dim);
  font-family: var(--font-mono);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.hero-context-toggle::before {
  content: '//';
  opacity: 0.5;
}

.hero-context-details[open] .hero-context-toggle {
  color: var(--text-muted);
}

.hero-context-details .hero-context {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-muted);
  max-width: var(--hero-subhead-max-w);
}
```

- [ ] **Step 3: Downgrade hero stats visually** — find the `.hero-stats`, `.stat-value`, `.stat-label` rules in `landing.css` and update (search for `.stat-value` to find exact lines):

```bash
grep -n "stat-value\|stat-label\|stat-sep" src/styles/landing.css | head -20
```

Then update `.stat-value` to reduce from current large size to mono-style:

```css
/* Hero stats — tertiary, not primary content */
.hero-stats {
  display: flex;
  align-items: center;
  gap: var(--space-9);  /* 64px */
  margin: var(--space-5) 0;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent);
  /* Remove any text-shadow / glow rules here */
  text-shadow: none;
  display: block;
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-dim);
  display: block;
  margin-top: 0.15rem;
}

.stat-sep {
  width: 1px;
  height: 2rem;
  background: var(--border);
  flex-shrink: 0;
}
```

- [ ] **Step 4: Build and visual check**

```bash
pnpm build && pnpm preview
```

Open http://localhost:4321 — confirm: hero H1 is the dominant element, stats are small and mono, the SEO block is collapsed behind a `<details>` toggle.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/Hero.astro src/styles/landing.css
git commit -m "feat(hero): compress stats, collapse SEO paragraph — reduce above-fold cognitive load"
```

---

## Task 4 — CompatibilityStrip component

**Files:**
- Create: `src/components/landing/CompatibilityStrip.astro`
- Modify: `src/styles/landing.css`

A thin strip below the Hero (before Problem) listing the 8 AI tools RTK works with, as neutral pills. Kills the "will this work with my tool?" objection in 2 seconds.

- [ ] **Step 1: Create `CompatibilityStrip.astro`**

```astro
---
// CompatibilityStrip — "Works with" pill row (inserted between Hero and Problem)
const tools = [
  'Claude Code',
  'Cursor',
  'Aider',
  'Gemini CLI',
  'OpenAI Codex',
  'Cline',
  'Windsurf',
  'GitHub Copilot',
]
---

<div class="compat-strip">
  <div class="compat-inner">
    <span class="compat-label">Works with</span>
    <ul class="compat-pills" role="list" aria-label="Compatible AI tools">
      {tools.map((tool) => (
        <li class="pill-neutral">{tool}</li>
      ))}
    </ul>
  </div>
</div>
```

- [ ] **Step 2: Add styles to `landing.css`**

```css
/* CompatibilityStrip */
.compat-strip {
  padding-block: var(--space-5);
  border-block: 1px solid var(--border);
}

.compat-inner {
  max-width: var(--max-w);
  margin-inline: auto;
  padding-inline: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.compat-label {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--text-dim);
  letter-spacing: 0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}

.compat-pills {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
```

- [ ] **Step 3: Build check**

```bash
pnpm build 2>&1 | grep -E "error|warning" | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/CompatibilityStrip.astro src/styles/landing.css
git commit -m "feat(landing): add CompatibilityStrip — 'Works with' AI tool pill row"
```

---

## Task 5 — Capabilities component (Context Forge section)

**Files:**
- Create: `src/components/landing/Capabilities.astro`
- Modify: `src/styles/landing.css`

The macro-frame section. Title "Context Forge / One forge. Three tools." + 3 cards (RTK / ICM / Vox). Inserted after `<Hero>` and `<CompatibilityStrip>`, before `<Problem>`. This gives Vox and ICM a narrative home on the main landing.

- [ ] **Step 1: Create `Capabilities.astro`**

```astro
---
// Capabilities — "Context Forge" suite section
// Shows RTK + ICM + Vox as a coherent 3-tool suite
const tools = [
  {
    label: 'RTK',
    verb: 'Compress',
    color: 'var(--accent)',
    href: '/#install',
    description: 'Commands, file reads, tests — compressed 60-90% before they reach your model context. Zero config.',
    stat: '89% noise removed',
  },
  {
    label: 'ICM',
    verb: 'Remember',
    color: 'var(--cyan)',
    href: '/icm/',
    description: 'Persistent memory across sessions. Your agent picks up where it left off — decisions, errors, context.',
    stat: 'Infinite context memory',
  },
  {
    label: 'Vox',
    verb: 'Speak',
    color: 'var(--violet)',
    href: '/vox/',
    description: 'Voice output for your AI agent. Three TTS backends, four Claude Code integration modes.',
    stat: '3 TTS backends',
  },
]
---

<section class="capabilities section-calm" aria-labelledby="capabilities-title">
  <div class="capabilities-inner">
    <span class="eyebrow">// context forge</span>
    <h2 id="capabilities-title" class="capabilities-title">
      One forge. <span class="gradient-text">Three tools.</span>
    </h2>
    <p class="capabilities-sub">RTK, ICM, and Vox share one philosophy: open source, Rust, zero telemetry, local-first.</p>

    <div class="capabilities-grid">
      {tools.map((t) => (
        <a href={t.href} class="capabilities-card card-muted">
          <div class="capabilities-card-header">
            <span class="capabilities-label" style={`color: ${t.color}`}>{t.label}</span>
            <span class="capabilities-verb">{t.verb}</span>
          </div>
          <p class="capabilities-desc">{t.description}</p>
          <span class="capabilities-stat pill-neutral">{t.stat}</span>
        </a>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add styles to `landing.css`**

```css
/* Capabilities — Context Forge section */
.capabilities-inner {
  max-width: var(--max-w);
  margin-inline: auto;
  padding-inline: var(--space-6);
  text-align: center;
}

.capabilities-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  margin: 0 0 var(--space-3);
}

.capabilities-sub {
  font-size: var(--text-lg);
  color: var(--text-muted);
  max-width: 38rem;
  margin-inline: auto;
  margin-bottom: var(--space-9);
}

.capabilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-5);
  text-align: left;
}

.capabilities-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-7);
  text-decoration: none;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.capabilities-card:hover {
  border-color: var(--border-light);
  transform: translateY(-2px);
}

.capabilities-card-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.capabilities-label {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.05em;
}

.capabilities-verb {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-bright);
}

.capabilities-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.capabilities-stat {
  align-self: flex-start;
}
```

- [ ] **Step 3: Build check**

```bash
pnpm build 2>&1 | grep -iE "error|warning" | head -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/Capabilities.astro src/styles/landing.css
git commit -m "feat(landing): add Capabilities section — Context Forge suite frame (RTK/ICM/Vox)"
```

---

## Task 6 — Wire new components into index.astro

**Files:**
- Modify: `src/pages/index.astro:2-16` (imports)
- Modify: `src/pages/index.astro` (section order in `<main>`)

Insert order: `<Hero>` → `<CompatibilityStrip>` → `<Capabilities>` → `<Problem>` → ... (rest unchanged).

- [ ] **Step 1: Add imports after line 4 (`import Hero from ...`)**

```astro
import Capabilities from '../components/landing/Capabilities.astro'
import CompatibilityStrip from '../components/landing/CompatibilityStrip.astro'
```

- [ ] **Step 2: Find the `<Hero />` usage in `<main>` and insert the two new components immediately after**

Before:
```astro
<Hero />
<Problem />
```

After:
```astro
<Hero />
<CompatibilityStrip />
<Capabilities />
<Problem />
```

- [ ] **Step 3: Full build + preview check**

```bash
pnpm build && pnpm preview
```

Verify:
- Landing renders in order: Hero → CompatStrip → Capabilities → Problem → DemoSlideshow → ...
- No JS errors in console
- All 3 Capabilities cards link correctly (RTK → `/#install`, ICM → `/icm/`, Vox → `/vox/`)

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(landing): wire CompatibilityStrip + Capabilities into landing section order"
```

---

## Task 7 — Problem section refactor (red inside `<pre>` only)

**Files:**
- Modify: `src/components/landing/Problem.astro`
- Modify: `src/styles/landing.css`

Currently the 3 cards have colored borders/backgrounds (violet/cyan/red). Goal: cards become neutral (`.card-muted`), the problem evidence stays colored but only inside terminal-style code blocks. The icon stroke colors stay as semantic accents.

- [ ] **Step 1: Update problem card structure in `Problem.astro`**

Replace the 3 `<div class="problem-card reveal">` opening tags — add `card-muted` class:

```html
<div class="problem-card card-muted reveal">
```

(Apply to all 3 cards — lines 13, 28, 42)

- [ ] **Step 2: Replace the `<span class="metric ...">` elements with terminal-style output**

Replace `Problem.astro:25`:
```html
<span class="metric metric-violet" data-i18n="problem.card1.metric">Worse AI reasoning</span>
```
With:
```html
<pre class="problem-terminal problem-terminal-violet"><code>context_quality: degraded ▼</code></pre>
```

Replace `Problem.astro:39`:
```html
<span class="metric metric-cyan" data-i18n="problem.card2.metric">3x shorter sessions</span>
```
With:
```html
<pre class="problem-terminal problem-terminal-cyan"><code>session_remaining: 32% ▼</code></pre>
```

Replace `Problem.astro:53`:
```html
<span class="metric metric-red" data-i18n="problem.card3.metric">~70% wasted spend</span>
```
With:
```html
<pre class="problem-terminal problem-terminal-red"><code>token_waste: $1,750/mo ▲</code></pre>
```

- [ ] **Step 3: Add terminal block styles and update card styles in `landing.css`**

Find and update `.problem-card` (remove colored border/background), add `.problem-terminal`:

```css
/* Problem cards — neutral base, evidence in terminal blocks */
.problem-card {
  padding: var(--space-7);
  /* Remove any border-color overrides that were here */
}

.problem-terminal {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  margin: var(--space-4) 0 0;
  border-left: 3px solid transparent;
  background: rgba(0, 0, 0, 0.3);
}

.problem-terminal code {
  color: inherit;
  background: none;
  padding: 0;
}

.problem-terminal-violet {
  color: var(--violet);
  border-left-color: var(--violet);
}

.problem-terminal-cyan {
  color: var(--cyan);
  border-left-color: var(--cyan);
}

.problem-terminal-red {
  color: var(--red);
  border-left-color: var(--red);
}
```

- [ ] **Step 4: Remove (or comment out) the old `.metric`, `.metric-violet`, `.metric-cyan`, `.metric-red` rules from `landing.css` if they exist**

```bash
grep -n "\.metric" src/styles/landing.css
```

Comment them out or delete if no longer used elsewhere.

- [ ] **Step 5: Build and visual check**

```bash
pnpm build && pnpm preview
```

Confirm: Problem cards are dark neutral, terminal output lines show colored metric in mono font, icon strokes remain violet/cyan/red.

- [ ] **Step 6: Commit**

```bash
git add src/components/landing/Problem.astro src/styles/landing.css
git commit -m "refactor(problem): neutral cards, colored evidence in terminal blocks only"
```

---

## Task 8 — Eyebrow component

**Files:**
- Create: `src/components/landing/Eyebrow.astro`
- Modify: `src/components/landing/Capabilities.astro` (refactor inline eyebrow to use component)
- Modify: `src/components/landing/Problem.astro`, `Cta.astro`, `Install.astro` (add eyebrows)

- [ ] **Step 1: Create `Eyebrow.astro`**

```astro
---
// Eyebrow — reusable `// 01 — label` mono section label
interface Props {
  label: string
}
const { label } = Astro.props
---
<span class="eyebrow">{`// ${label}`}</span>
```

- [ ] **Step 2: Use `<Eyebrow>` in each section (replace inline `<span class="eyebrow">` in Capabilities)**

In `Capabilities.astro`, replace:
```astro
<span class="eyebrow">// context forge</span>
```
With:
```astro
import Eyebrow from './Eyebrow.astro'
---
<Eyebrow label="context forge" />
```

Wait — Astro requires imports in the frontmatter. Add at top of Capabilities.astro frontmatter:
```astro
---
import Eyebrow from './Eyebrow.astro'
// ... existing code
---
```

- [ ] **Step 3: Add eyebrows to Problem, Install, Cta sections**

In `Problem.astro` frontmatter:
```astro
---
import Eyebrow from './Eyebrow.astro'
---
```

Add as first element inside `.section-inner`, before `<div class="section-viking">`:
```astro
<Eyebrow label="01 — the problem" />
```

In `Install.astro` frontmatter:
```astro
---
import Eyebrow from './Eyebrow.astro'
---
```

Add before `<h2 class="reveal">`:
```astro
<Eyebrow label="get started" />
```

In `Cta.astro` frontmatter:
```astro
---
import Eyebrow from './Eyebrow.astro'
---
```

Add before `<h2 class="reveal">`:
```astro
<Eyebrow label="ship it" />
```

- [ ] **Step 4: Build check**

```bash
pnpm build 2>&1 | grep -iE "error" | head -10
```

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/Eyebrow.astro src/components/landing/Capabilities.astro src/components/landing/Problem.astro src/components/landing/Install.astro src/components/landing/Cta.astro
git commit -m "feat(landing): add Eyebrow component, wire into Problem/Install/CTA/Capabilities"
```

---

## Task 9 — CTA section — viewport-height + tri-gradient headline

**Files:**
- Modify: `src/components/landing/Cta.astro`
- Modify: `src/styles/landing.css`

Make the final CTA section fill the viewport, headline in tri-gradient (its second and last use, bookending the page), viking at 30% opacity behind.

- [ ] **Step 1: Update `Cta.astro` structure**

Replace entire file content:

```astro
---
// CTA section — viewport-height close, tri-gradient headline, viking at 30% opacity
import Eyebrow from './Eyebrow.astro'
---
<section class="cta-section cta-section--full">
  <div class="section-inner cta-inner">
    <div class="cta-viking-bg">
      <img src="/assets/illustrations/viking-cta.webp" alt="" aria-hidden="true" loading="lazy" width="1920" height="1047">
    </div>
    <Eyebrow label="ship it" />
    <h2 class="reveal cta-headline">
      <span data-i18n="cta.title_1">Your AI doesn't need</span><br>
      <span class="gradient-text" data-i18n="cta.title_2">to read all that.</span>
    </h2>
    <p class="section-sub reveal" data-i18n="cta.sub">Install rtk. Better code, longer sessions, lower costs.</p>
    <div class="hero-cta reveal">
      <a href="#install" class="btn btn-primary" data-i18n="hero.cta_install">Install rtk</a>
      <a href="https://github.com/rtk-ai/rtk" class="btn btn-ghost" target="_blank" rel="noopener">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span data-i18n="hero.cta_star">Star on GitHub</span>
      </a>
    </div>

    <div class="social-share reveal">
      <span class="share-label" data-i18n="cta.share">Share rtk</span>
      <div class="share-links">
        <a href="https://x.com/intent/tweet?text=rtk%20%E2%80%94%20Your%20AI%20coding%20agent%20is%20drowning%20in%20CLI%20noise.%20RTK%20compresses%20outputs%20by%2089%25.%20Better%20reasoning%2C%20longer%20sessions%2C%20lower%20costs.%20Open%20source%2C%20Rust.&url=https%3A%2F%2Fgithub.com%2Frtk-ai%2Frtk" target="_blank" rel="noopener nofollow" class="share-btn" aria-label="Share on X">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="https://bsky.app/intent/compose?text=rtk%20%E2%80%94%20Your%20AI%20coding%20agent%20is%20drowning%20in%20CLI%20noise.%20RTK%20compresses%20outputs%20by%2089%25.%20Open%20source%2C%20Rust.%20https%3A%2F%2Fgithub.com%2Frtk-ai%2Frtk" target="_blank" rel="noopener nofollow" class="share-btn" aria-label="Share on Bluesky">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.601 3.495 6.186 3.245-3.775.547-7.052 2.48-4.452 7.378 2.294 3.796 5.057 4.755 7.642.38C12 17.764 12 14.568 12 14.568s0 3.196 2 6.682c2.585 4.375 5.348 3.416 7.642-.38 2.6-4.898-.677-6.831-4.452-7.378 2.585.25 5.401-.618 6.186-3.245.246-.828.624-5.788.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.747 13.087 8.686 12 10.8z"/></svg>
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fgithub.com%2Frtk-ai%2Frtk" target="_blank" rel="noopener nofollow" class="share-btn" aria-label="Share on LinkedIn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 24 22.225 24h.003z"/></svg>
        </a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add/update CTA styles in `landing.css`**

```css
/* CTA — viewport-height version */
.cta-section--full {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.cta-inner {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 680px;
  margin-inline: auto;
}

.cta-viking-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.cta-viking-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.12;
  filter: grayscale(20%);
}

.cta-headline {
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: var(--space-4) 0 var(--space-5);
}
```

- [ ] **Step 3: Build + visual check**

```bash
pnpm build && pnpm preview
```

Confirm: CTA section fills ~80vh, headline gradient visible, viking faintly visible at low opacity behind, all share buttons preserved.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/Cta.astro src/styles/landing.css
git commit -m "refactor(cta): viewport-height section, gradient headline, viking background at 12% opacity"
```

---

## Task 10 — Install section — persona tabs

**Files:**
- Modify: `src/components/landing/Install.astro`
- Modify: `src/styles/landing.css`

Add 3-tab persona picker above install cards. Default = "Claude Code". Each tab shows the same install commands (RTK install is identical across tools) but the hook init command differs.

- [ ] **Step 1: Replace `Install.astro` content** (full replacement):

```astro
---
// Install section — persona tabs + 3 install methods + hook activation
import Eyebrow from './Eyebrow.astro'

const personas = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    initCmd: 'rtk init --claude-code',
    initNote: 'Installs PreToolUse hook in Claude Code settings.json — every Bash call is rewritten automatically.',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    initCmd: 'rtk init --cursor',
    initNote: 'Configures Cursor\'s .cursorrules to pipe Bash commands through rtk.',
  },
  {
    id: 'other',
    label: 'Other AI CLI',
    initCmd: 'rtk init --global',
    initNote: 'Installs a global shell hook — works with Aider, Gemini CLI, Codex, Windsurf, and any terminal AI tool.',
  },
]
const defaultPersona = personas[0]
---

<section class="install-section" id="install">
  <div class="section-inner">
    <div class="section-viking reveal">
      <img src="/assets/illustrations/viking-install.webp" alt="Viking slamming axe into ground creating green energy shockwave" loading="lazy" width="1920" height="1047">
    </div>
    <Eyebrow label="get started" />
    <h2 class="reveal" data-i18n="install.title">Get started in 30 seconds</h2>
    <p class="section-sub reveal" data-i18n="install.sub">Install, activate the auto-rewrite hook, and every command is compressed automatically.</p>

    <!-- Persona tabs -->
    <div class="persona-tabs reveal" role="tablist" aria-label="Choose your AI tool">
      {personas.map((p, i) => (
        <button
          class={`persona-tab${i === 0 ? ' persona-tab--active' : ''}`}
          role="tab"
          aria-selected={i === 0 ? 'true' : 'false'}
          aria-controls={`persona-panel-${p.id}`}
          id={`persona-tab-${p.id}`}
          data-persona={p.id}
        >
          {p.label}
        </button>
      ))}
    </div>

    <!-- Install cards (same for all personas) -->
    <div class="install-grid reveal">
      <div class="install-card install-primary">
        <h3 data-i18n="install.quick">Quick Install</h3>
        <p data-i18n="install.quick_desc">One-liner for Linux &amp; macOS</p>
        <div class="code-block">
          <code>curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh</code>
          <button class="copy-btn" data-copy="curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh" aria-label="Copy">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
        </div>
      </div>

      <div class="install-card">
        <h3 data-i18n="install.brew">Via Homebrew</h3>
        <p data-i18n="install.brew_desc">macOS &amp; Linux</p>
        <div class="code-block">
          <code>brew install rtk</code>
          <button class="copy-btn" data-copy="brew install rtk" aria-label="Copy">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
        </div>
      </div>

      <div class="install-card">
        <h3 data-i18n="install.binaries">Pre-built Binaries</h3>
        <p data-i18n="install.binaries_desc">macOS, Linux, Windows</p>
        <div class="code-block">
          <a href="https://github.com/rtk-ai/rtk/releases" target="_blank" rel="noopener" class="releases-link" data-i18n="install.releases">Download from Releases &rarr;</a>
        </div>
      </div>
    </div>

    <!-- Persona-specific hook command -->
    <div class="install-setup reveal">
      <h3 data-i18n="install.hook">Then activate the auto-rewrite hook</h3>
      {personas.map((p, i) => (
        <div
          id={`persona-panel-${p.id}`}
          class={`persona-panel${i === 0 ? ' persona-panel--active' : ''}`}
          role="tabpanel"
          aria-labelledby={`persona-tab-${p.id}`}
          hidden={i !== 0}
        >
          <div class="code-block code-block-wide">
            <code>{p.initCmd}</code>
            <button class="copy-btn" data-copy={p.initCmd} aria-label="Copy">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            </button>
          </div>
          <p class="install-note">{p.initNote} <a href="/guide/getting-started/installation/" class="install-docs-link">Full install guide →</a></p>
        </div>
      ))}

      <div class="install-steps">
        <div class="install-step">
          <span class="install-step-num">1</span>
          <code>curl ... | sh</code>
        </div>
        <div class="install-step">
          <span class="install-step-num">2</span>
          <code id="install-step-2-cmd">rtk init --claude-code</code>
        </div>
        <div class="install-step">
          <span class="install-step-num">3</span>
          <code>rtk gain</code>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  // Persona tab switcher — plain JS, no framework
  const tabs = document.querySelectorAll<HTMLButtonElement>('.persona-tab')
  const panels = document.querySelectorAll<HTMLElement>('.persona-panel')
  const step2Cmd = document.getElementById('install-step-2-cmd')

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const persona = tab.dataset.persona

      tabs.forEach((t) => {
        t.classList.toggle('persona-tab--active', t === tab)
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false')
      })

      panels.forEach((panel) => {
        const isActive = panel.id === `persona-panel-${persona}`
        panel.classList.toggle('persona-panel--active', isActive)
        panel.hidden = !isActive
      })

      // Update step 2 command label
      const activePanel = document.getElementById(`persona-panel-${persona}`)
      if (step2Cmd && activePanel) {
        const cmd = activePanel.querySelector('code')?.textContent
        if (cmd) step2Cmd.textContent = cmd
      }
    })
  })
</script>
```

- [ ] **Step 2: Add persona tab styles to `landing.css`**

```css
/* Persona tabs */
.persona-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-7);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}

.persona-tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: var(--space-3) var(--space-5);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-dim);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
  margin-bottom: -1px;
}

.persona-tab:hover {
  color: var(--text-muted);
}

.persona-tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

/* Persona panels */
.persona-panel {
  display: block;
}

.persona-panel[hidden] {
  display: none;
}
```

- [ ] **Step 3: Build + accessibility check**

```bash
pnpm build 2>&1 | grep -iE "error" | head -10
```

Also verify: tab keyboard navigation works (Tab → focus tab, Enter/Space → switch persona, panel updates).

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/Install.astro src/styles/landing.css
git commit -m "feat(install): persona tabs for Claude Code / Cursor / Other AI CLI"
```

---

## Task 11 — Final build validation

- [ ] **Step 1: Full production build**

```bash
pnpm build
```

Expected: exits 0, no TypeScript errors, no Astro build errors.

- [ ] **Step 2: Check all pages generated**

```bash
rtk ls dist/ && rtk ls dist/vox/ && rtk ls dist/icm/
```

Expected: `index.html` at each path.

- [ ] **Step 3: RSS endpoint check**

```bash
pnpm preview &
sleep 2
curl -s http://localhost:4321/rss.xml | head -5
kill %1
```

Expected: `<?xml version="1.0"` as first line.

- [ ] **Step 4: JSON-LD validity check** (index page only — it uses `@graph`)

```bash
pnpm preview &
sleep 2
curl -s http://localhost:4321/ | grep -o '<script type="application/ld+json">.*</script>' | head -1 | python3 -c "import sys, json; json.load(sys.stdin); print('JSON-LD: valid')" 2>&1
kill %1
```

Expected: `JSON-LD: valid`

- [ ] **Step 5: WCAG contrast spot-check on new elements**

Manually verify in browser:
- `.pill-neutral` text (`--text-muted #94a3b8`) on `--bg-card (#0f1629)` → minimum 4.5:1 (check via DevTools contrast checker)
- `.capabilities-desc` text same
- `.persona-tab--active` (`--accent #00e599`) on `--bg (#060b18)` → minimum 3:1 for UI components

- [ ] **Step 6: Mobile check (375px viewport)**

In browser DevTools, switch to 375px width. Verify:
- `CompatibilityStrip` pills wrap cleanly
- `Capabilities` grid stacks to 1 column
- Persona tabs scroll horizontally or wrap without overflow

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore(landing): final validation pass — P0+P1 Context Forge redesign complete"
```

---

## Out of Scope (P2 — separate plan when ready)

- Comparison table vs LeanCTX / other compressors
- Section whitespace overhaul (all 11 sections → `--space-13`)
- `rtk gain` leaderboard
- Reducing 11 sections to 7-8
- One-card-style audit pass on CloudWaitlist + ShareGain + FAQ
- Reveal-on-scroll budget cap (1 per section)
