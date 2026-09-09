# RTK Landing — V3 Design Rules

> Design system for the V3 landing experience ("noise → RTK → clean context").
> Applies to `src/components/landing/v3/*`, `src/components/pages/LandingPageV3.astro`
> and `src/styles/landing-v3.css`. All V3 classes are prefixed `lp3-`.
> The legacy landing (`LandingPage.astro` + `src/styles/landing.css`) is kept as backup
> and does NOT follow these rules.

---

## 1. Direction in one sentence

Premium, quiet developer-infrastructure site (Linear / Vercel / Stripe register):
near-black + warm white + restrained mint + precise grid + modern sans + subtle Norse
geometry + huge whitespace. The scroll-driven **NOISE → RTK → CLEAN CONTEXT**
transformation is the hero artwork. No Viking illustrations, no dashboards-everywhere,
no card-grid overload.

---

## 2. Color

**Colors do not change.** V3 reuses the existing tokens from `src/styles/global.css`:

| Role | Token | Notes |
|------|-------|-------|
| Page background | `--bg` | The dominant surface. Most of the page is this. |
| Secondary surface | `--bg-alt` | Used sparingly (proof band, demo frame). |
| Elevated surface | `--bg-card` | Panels inside visuals only. |
| Primary text | `--text` / `--text-bright` | Warm white. Headings use `--text-bright`. |
| Secondary text | `--text-muted` | Body copy, descriptions. |
| Labels / captions | `--text-dim` | Eyebrows, spec labels, meta lines. |
| Accent (mint) | `--accent` | See usage budget below. |
| Noise / error | `--red` | ONLY when depicting bad/noisy context. |
| Borders | `--lp3-line` (derived) | See §5. |

**Accent usage budget** — mint appears only on:
primary CTA, active states, important data points, the RTK mark/node,
successful/clean output, tiny highlights. Never as section backgrounds.

**Glow budget** — the two centerpiece visuals (hero flow, solution field) DO glow:
radial halo + vertical light beam around the rune gate, floor glow under the hero
panels, flow strands in accent (built from `--accent-glow`, opacity ≤ 0.7 local /
≤ 0.4 ambient). Everywhere else the page stays matte — no glowing cards, buttons
limited to the small hover shadow.

**Red usage budget** — muted red only for noisy/removed context lines and the
CLI-noise bar. Never for decoration. The red-noise vs mint-signal contrast is
part of the product story.

**One hue, treated tonally:** V3 uses ONLY the mint. Where the accent appears
at display size (hero accent line, primary button) it is never flat — it wears a
vertical TONAL gradient inside the hue (lit top → `--accent` → deeper/smoked
base via color-mix with `--text-bright`/`--bg`). `--cyan`, `--violet` and the
legacy tri-gradient are forbidden on this page (they belong to ICM/Vox), as are
colorful badges and glow pulses. Subtle and classy beats loud.

---

## 3. Typography

| Role | Font | Weight | Size (desktop) | Tracking |
|------|------|--------|----------------|----------|
| Display (hero H1, H2s, CTA title, intro hook, proof numbers) | **Geist** | **600** (numbers 600, intro hook 400) | H1 `clamp(2.5rem, 4vw, 3.8rem)` | `-0.025em` |
| Section heading (H2) | Geist | 600 | `clamp(2rem, 3.4vw, 3.1rem)` | `-0.025em` |
| Sub-heading (H3) | Inter | 600 | `1.125–1.375rem` | `-0.01em` |
| Body | Inter | 400 | `1rem–1.125rem`, line-height 1.65 | 0 |
| Eyebrow / section index | JetBrains Mono | 500 | `0.72–0.78rem`, uppercase | `0.14em` |
| Terminal / data | JetBrains Mono | 400–500 | `0.72–0.82rem` | 0 |
| Proof numbers | Inter | 600 | `clamp(2.5rem, 4vw, 3.5rem)` | `-0.02em` |

Rules:
- **Two-face system**: **Geist (600)** is the display face — the spec's first
  recommendation; precise, modern, premium dev-infrastructure type (Vercel's
  face, now on Google Fonts) — used ONLY for headlines, the intro hook and the
  proof numbers (`--lp3-font-display`). **Inter** remains the body/UI face
  (buttons, nav, paragraphs, labels). Both via Google Fonts on V3 pages only,
  `font-display: swap`. No serif, no decorative fonts. (Tried and rejected:
  Space Grotesk 300 — too thin; Sora 400 — too neutral; Familjen Grotesk 500.)
- **Headline gradients**: big headlines (hero H1, `.lp3-h2`, CTA title) are never
  flat bright white — soft vertical gradient `--text-bright` → 55% mix with
  `--text-muted` at the baseline (background-clip: text, solid fallback without
  color-mix support). The hero's accent line ("Better agents.") is a mint-only
  vertical tonal sweep — `color-mix(accent 62%, text-bright)` top → `--accent` →
  `color-mix(accent-hover 88%, bg)` baseline — plus a soft `--accent-dim` halo
  (drop-shadow), guarded by `@supports color-mix` with a flat-accent fallback.
  Flat #00e599 is forbidden at display size.
- **Headline italic** (`.lp3-h2 em`, `.lp3-cta-title em`): the one word a heading
  turns on, set in a *lighter italic* of the display face (500 vs the 600 around
  it). It is the page's only italic, so it marks meaning rather than decorating.
  Rules: one span per heading, on the payoff word or a literal command
  (`rtk gain`), and **never on CJK** — those faces have no true italic and the
  synthesised slant looks broken, so zh/ja keep the plain string.
  In use on every landing section heading: *valuable* (problem) · *cleans*
  (solution) · *think* (impact) · *clear* (demo) · *not claimed* (proof) ·
  *disappear* (specs) · *30 seconds* (install) · *rtk gain* (share) ·
  *room to think* (final CTA) · *not found* (404). FAQ is deliberately left
  plain — a utility heading has no payoff word to mark.
- **The lean is a skew, not a font.** Geist ships a true italic (request the
  `ital` axis — without it the browser fakes a slant, which is visibly cruder),
  but exposes no `slnt` axis, so the extra lean is `transform: skewX(-5deg)`.
  Do not go past ~7deg: the letterforms stretch and it looks like the faux
  italic again. The transform gives the span its own painting context, so it
  MUST carry its own text fill or the word renders invisible inside a
  `background-clip: text` heading.
- **The italic is a SECTION-heading device, never a page title.** Page h1s
  (hero, team, blog, benchmarks) carry the mint sweep and stay upright; section
  h2s carry the italic. One word must never wear both — that collapses the two
  levels the reader is learning to tell apart. This was broken once by adding
  the italic to inner-page h1s while trying to spread the device further; the
  answer is to italicise more *section* headings, not the titles.
- No animation on the emphasis: a glitch/slice reveal was tried and removed —
  it read as a rendering fault rather than an effect. The italic carries it.
- `<em>` means two different things by level, and that is deliberate: in a page
  **h1** (hero, benchmarks, team, blog) it carries the mint tonal sweep — brand
  identity; in a section **h2** it is the italic above — emphasis. Do not mix
  the two in one heading.
- Typography does the heavy lifting. One H1 per page. Headings are short declarative
  sentences ending with a period ("Clean context. Better agents.").
- Eyebrows are always mono, uppercase, `--text-dim`, letter-spacing `0.14em`, and
  numbered sections use the `01 / THE PROBLEM` pattern.
- Max body-copy width: `36rem`. Never full-width paragraphs.

---

## 4. Spacing & rhythm

Space is a feature. If it feels too empty, it's close to correct.

| Context | Value |
|---------|-------|
| Major section vertical padding | `clamp(9rem, 12vw, 13.75rem)` (`--lp3-sec-pad`) |
| Proof band vertical padding | `clamp(6rem, 8vw, 8.75rem)` |
| Section heading → visual gap | `clamp(4.5rem, 7vw, 6.25rem)` |
| Between unrelated elements | `2.5rem–5rem` |
| Eyebrow → heading | `1.25rem` |
| Heading → supporting line | `1.5rem` |
| Supporting line → CTAs | `2.5rem` |

Rhythm rules:
- One dominant message + one dominant visual per section. Never two visuals.
- No continuous card stacks. Sections alternate density: visual-heavy → quiet → visual-heavy.
- The page background stays `--bg` everywhere; bands (proof, companies, ecosystem)
  are separated by 1px hairlines, not background changes.

Mobile band rhythm (≤960 / ≤700) — the three bands under the hero are the easiest
place to end up crowded, since the proof strip is absolutely positioned and the
next two are normal sections:
- Hero proof strip: `bottom: 30px`, rows ~22px apart. The stage's
  `padding-bottom` must exceed the strip's full height (172px at ≤960) or the
  numbers ride up into the visual above them.
- **5 stats on a phone lay out as a 6-column grid**, not wrapped flex: items 4–5
  are placed at columns 2 and 4 so the short second row sits *between* the
  columns above it. Centred wrapping floats that row against nothing and reads
  as an accident.
- **The ecosystem list is a 2-column grid on phones**, left-aligned in each
  column. Free wrapping centres every row on its own width, which leaves the
  icons in a ragged zigzag.
- Marquee edge mask widens to 22%/78% on phones: only 3–4 logos fit, so a
  half-cut wordmark stays legible (and reads as broken) under the desktop fade.
- Companies `4rem` vertical padding; ecosystem `clamp(5rem, 7vw, 7.5rem)` — each
  band gets its own air rather than inheriting one shared value.
- The ecosystem row **wraps on phones — never a horizontal scroller**. A scroller
  hid half the tool list behind the edge fade with no sign it was there.
- On phones the row shows the four headline integrations (Claude Code, Cursor,
  GitHub Copilot, Codex) and collapses the rest behind a **"+N more" toggle** —
  eight rows of tools push the next section off-screen. The count is derived from
  the markup, never hardcoded. The collapse is progressive enhancement:
  `initEcoMore` adds `js-collapsible` before any CSS hides anything, so a JS
  failure leaves the full list readable instead of permanently truncated.
- Short phones (≤720h): stage `padding-top: 100px`, since the fixed nav is 65px
  and anything less slides the Pro chip under it.
- **Reset list margins on flex rows** (`.lp3-eco-row`). A `<ul>`'s default block
  margin collapses out of its container and reappears as phantom space under the
  row — 16px of dead air that no padding value explains. Measure section height
  against its children when spacing looks wrong for no reason.

Section layouts (reference-driven):
- **Hero** (assembled state): copy 42% / visual 58% + proof strip along the bottom
  (5 stats, thin top hairline). Visual = tilted panels (±9° rotateY) + strand
  overlay + glowing gate. **Panels are TOKEN GRIDS, never bars or text**: a fine
  20×20 cell matrix telling a BINARY story — a near-uniform muted RED noise
  mass (`--red` at alpha 0.18–0.32, ONE substance, never confetti) with ~4%
  mint signal tokens. Two tones only. Both windows FILL LIKE TEXT
  (strict reading order, left→right, top→bottom — thresholds ordered by
  row-major index): the raw window writes itself fast at scroll start and then
  STAYS FULL (it is the raw input); the clean panel fills in the same reading
  order with the SAME mint survivors at the SAME grid positions (they visibly
  pass through the gate). The filtering story is the contrast between the full
  red window and the near-empty green one. Cells are TRUE SQUARES
  (`aspect-ratio: 1`); the grid clips flush at the panel edge like a viewport
  onto the token space. A whisper of life: every 7th noise token breathes. Filtered cells collapse to faint dots;
  the clean panel is the same grid as a faint DOT MATRIX of free capacity with
  ~14 mint survivors — the free space is the message. Usage meters are
  instrument tick strips (masked), not progress bars. The chunky multicolor
  v1 grid is archived in `src/components/landing/v3/legacy/`. The proof numbers live IN the hero — there is no separate
  proof band section.
- **Companies**: "Starred by developers at" — quiet monochrome wordmarks, no logos.
- **01 Problem**: triptych — heading (4fr) · AI CONTEXT viz (5fr) · consequence
  note with border-left + faint rune (3fr).
- **02 Solution**: full-width flow field — NOISE label left, glowing gate center,
  SIGNAL label right, ~30 gradient strands.
- **03 Impact**: heading band (4fr) + three icon columns (8fr), circular outline
  icons in accent.
- **Demo**: heading + "Why was this removed?" left (4fr), tabbed frame right (8fr),
  pill tabs, dot-labeled panels, circular arrow floating between sides.

---

## 5. Grid, borders, surfaces

- **Grid:** 12-col mental model, `max-width: 1280px` (`--lp3-max-w`), side padding
  `clamp(20px, 4vw, 40px)`. All sections align to the same boundaries; only the hero
  visual may bleed slightly.
- **Borders:** always `1px`, low opacity. Token: `--lp3-line: rgba(148,163,184,0.14)`
  and `--lp3-line-strong: rgba(148,163,184,0.24)`. Never use heavy boxes.
- **Cards/panels:** `background: transparent` or barely elevated
  (`rgba(15,22,41,0.5)`), `border: 1px solid var(--lp3-line)`,
  `border-radius: 10–14px` (`--lp3-radius: 12px`). No big shadows, no heavy
  glassmorphism, no giant rounded SaaS cards.
- **Separators:** thin vertical `1px` lines between columns (proof band, impact
  columns) instead of card borders.

---

## 6. Buttons

**Primary — "Install RTK →"**
- **Pill** (`border-radius: 999px` — all `.lp3-btn` are pills), height `48px`,
  padding `0 24px`, weight 600, size `0.95rem`.
- **Tinted mint glass — NEVER a filled mint block**: dark glass body with a
  faint mint wash (`color-mix(accent 17% → 7%, transparent)` vertical), a
  hairline mint border (34% mix), **mint text** (`--accent`), blur(8px)
  backdrop, `inset 0 1px 0` 6% top highlight. The accent is the tint, not the
  body. Subtle and classy beats loud.
- Hover: wash and border deepen (24%/60% mixes), text brightens toward white,
  `translateY(-1px)`, arrow translates `3px`, a soft mint ambient shadow.

**Button micro-action — the RTK wipe** (primary only, our signature): a mint
surface with a luminous leading edge SLIDES across the pill — the button gets
"cleaned" the way RTK cleans the context. Hover/focus: slides in and parks
(0.55s spring ease, text flips to `--text-on-accent`); un-hover slides it back.
Scroll reveal: wipes in-and-out once (`lp3-wipe` 1.1s + `lp3-wipe-text` color
beat; JS adds `.sheen` briefly — the hero CTA gets its wipe as the copy slides
in). No streak/glare effects — they read dated. Press = `scale(0.98)`.
Reduced motion: no wipe; the tinted-glass hover transitions stand alone.

**Secondary — "View on GitHub ↗"**
- Faint glass fill `rgba(148,163,184,0.05)` + `blur(8px)` backdrop,
  `1px solid var(--lp3-line-strong)`, inner top highlight at 5%, text `--text`.
- Hover: fill 10%, border brightens, text `--text-bright`.

**All buttons**: `:active` presses (`scale(0.98)`), `:focus-visible` gets a 2px
accent outline at 3px offset.

**Nav controls**: links are hover-pills (8px radius, `--lp3-surface-hover` fill);
scroll-spy marks the in-view section's link with a 3px mint dot. The GitHub star
count is a bordered pill chip with a mint star. Nav gains a soft drop shadow once
scrolled (`.scrolled`). Mobile drawer: glass panel (`--bg-glass` + blur 24px),
mono group labels, 46px touch targets, staggered link entrance, Install pinned
at the bottom.

Forbidden: any button gradient other than the primary's smooth-mint,
pill-shaped giant buttons, neon glow, icon spam.

---

## 7. Motion

Motion must explain something (noise, filtering, reduction, flow). Never decorate.

| Element | Motion |
|---------|--------|
| Hero | The one big animation — a four-act scroll-driven pin (420vh). **Cinematic opening:** the nav recedes at scroll 0 (`.is-hidden`, out of tab order) and returns on first scroll. **Act 0 (p 0–0.15) — title card:** on load, the gate mark ITSELF — scaled to 180px at the card's spot (JS measures mark vs. spacer, drives `--gms`/`--gmy`) — glows above the "RTK — Rust Token Killer" line, the hook ("Your AI agent drowns in CLI noise. Watch RTK clean it up.") and the scroll cue; panels/strands/label sit behind as a dim silhouette (`--reveal` 0.06). Scrolling dissolves the card while the ONE mark physically travels into its 96px slot, powers down to dormant, then reignites when RTK activates. **Act 1 (p 0.14–0.64):** the transformation plays BIG-SCREEN, centered and scaled up; raw lines accumulate → gate lights → noise filtered → clean panel fills, 86%→24%; the atmosphere brightens with it. **Act 2 (p 0.62–0.76):** the illustration docks into its right-hand slot with BOTH windows; glow and atmosphere follow (`--glowx` 50%→66%, `--atmo` settles). **Act 2b (p 0.8–0.9) — the departure, a SEPARATE beat that never overlaps the dezoom (composed motions read as lateral drift):** once seated, the RAW window dissolves in place (fade + drift, in-strands fade with it — its opacity MULTIPLIES the Act-0 veil, never overrides it), and gate + links + clean window GROW ~15% (desktop) while gliding to land EXACTLY centered in the visual box (`fx = -groupOff·fs`, group extent measured per axis). No text inside the window. The hero keeps its slot throughout. Static/no-JS keeps both windows (the contrast IS their story). **Act 3 (p 0.7+):** title/sub/CTAs slide in staggered; the proof is DEALT IN along the bottom — hairline draws (0.74), each stat lands at 0.78 + i·0.025 and counts up (numbers only, no eyebrow). **Epilogue (p 0.93):** the RTK Pro chip drops in ABOVE the title — a quiet glass pill (`RTK Pro — the AI Control Layer for your team →`, mint dot, hairline mint border, → pro.rtk-ai.app) that must never outshine Install; it is excluded from the copy stagger and always the LAST element to appear. Static/no-JS shows it in place normally. The hero assembles itself. |
| Hero load-in (title-card ignition) | One-time on page load: atmosphere blooms → the logo LANDS — appears at 1.9× center-stage and glides down into the title card (1.4s spring, multiplying the gate-core transform) → name line fades → hook rises → scroll cue appears (~1.6s total, `backwards` fill so the scroll choreography takes over seamlessly). A refresh ALWAYS replays the intro: an INLINE `<head>` script (LandingPageV3) sets `history.scrollRestoration = 'manual'` + scrolls to top — it must run before the browser applies scroll restoration, so it cannot live in the page module. On reload/back-forward it also strips any `#hash` left by a clicked CTA (otherwise the browser re-anchors below the fold) and handles Safari bfcache via `pageshow(persisted)`. Hash deep links on a fresh navigation are honored. |
| Hero ambience (at rest) | 14 mint motes drift slowly upward through the light; the gate halo breathes (5s scale pulse); the aurora blob wanders (26s alternate); the hint chevron nudges. All disabled under reduced motion. |
| Pointer parallax | The whole hero scene tilts ≤ 2.5° toward the cursor during the big-screen act, damped to zero as the visual docks. Desktop js-anim only. |
| Context-window viz (§01) | Scroll-driven (no pin): CLI bar compresses 54%→6%, usage 86%→38%, then "More room for reasoning." fades in. |
| Section reveals | opacity + 16px translate, 500–650ms ease, 80ms sibling stagger. No bounce. |
| Proof numbers | Count up once on first viewport entry (~900ms). |
| Ecosystem logos | 21px icons + `1.05rem` labels in `--text-muted` — small dim labels vanish next to the logo marquee. Hover only: brightness + tiny mint underline. |
| Demo | Cross-fade content on tab change; layout never reflows. |
| Buttons | Micro: 1px lift, 3px arrow shift. |

**Reduced motion (`prefers-reduced-motion: reduce`):** all scroll-driven and reveal
animation disabled; hero and context viz render their final settled state
(RAW → RTK → CLEAN, 24% / 38%). This is also the no-JS default — JS opts *into*
animation by adding `.js-anim`, never the reverse.

**Mobile (≤ 960px):** the FULL choreography runs — title card, big-screen
transformation, dock, dealt proof — with a compacted vertical layout (svh-scaled
panels, 56px gate mark, ~140px title-card logo, mini proof row, hero meta hidden,
pin 340vh). The handoff math is measurement-based (spacer height / gate width),
so it adapts to any size. Only very short viewports (≤ 560px tall — landscape
phones) and reduced-motion/no-JS get the static assembled state. The context viz
scroll interaction stays on all sizes.

---

## 8. Background treatment — "lit by the gate"

The page is a dark scene lit by one mint source, never flat black. All layers are
built from tokens (`--lp3-scene` 9%, `--lp3-atmo-tint` 4.5%, `--lp3-vignette`):

- **Hero atmosphere** (`.lp3-hero-atmo`, one div, three background layers):
  wide radial scene light following the visual (`--glowx`), a vertical mint wash
  through the middle band, and a corner vignette. Intensity (`--atmo`) is
  choreography-driven: dim at landing (0.45), brightest as the transformation
  completes, settling to ~0.75 once docked.
- **Film grain**: inline SVG `feTurbulence` data-URI at ≤ 3% opacity on the hero
  and final CTA. No asset requests.
- Tight `--accent-glow` radial hugging the gate + gate halo/beam (see §7 budget).
- 1px construction grid (`--lp3-grid-line`) masked around the hero visual.
- Elliptical floor glow under the hero panels (they float above lit ground).
- The solution field and final CTA reuse the same scene light so the whole page
  reads as one light source; panels carry a faint vertical sheen, never flat fill.
- **Section shades**: every major section carries a faint `--lp3-scene` radial
  behind its content (`z-index:-1` + `isolation:isolate`), alternating sides for
  rhythm — problem 46%, impact 24%, demo 68%, developers 32%, companies and
  footer centered. Opacity 0.3–0.5, never brighter than the hero.
- The RTK rune as a rare, very subtle watermark (final CTA) at ≤ 5% opacity.
- No photographic assets, no Viking artwork, no landscapes, no texture images.

---

## 9. Norse identity & brand marks

- **In-page illustration mark**: `/brand/box-logo-white.webp` (white circuit-helmet
  on transparency, 512px, ~45KB — optimized from `box_logo_white.png`; never ship
  the 481KB source). Used at: hero gate (96px), solution field gate (120px),
  problem consequence note (44px), final-CTA watermark (460px, 5% opacity).
  Always `alt=""` + explicit width/height. Mint glow comes from CSS drop-shadows,
  dormant state from opacity — never recolor the asset.
- **Header/nav + footer brand**: the legacy `/brand/logo.png` (28px, `--radius-sm`
  rounding) with the RTK wordmark. **Favicon**: unchanged (`/brand/favicon/*`).
- `RtkMark.astro` (rune geometry) is retired from the page but kept in the repo.
- Everything else stays geometric: sharp symmetrical forms, engraved 1px lines.
  "Nordic engineering, not Viking fantasy."

### 9b. Third-party company logos (`/brand/companies/*.svg`)

- **Truth first**: the band lists only companies that actually appear in the
  GitHub stargazers of `rtk-ai/rtk` (profile `company` field, alias-normalized,
  ranked by count). Never add a logo for reach — re-run the ranking instead.
  Last refresh Sep 2026: 79K stars, 20K with an employer, 1.1K employers with
  2+ stargazers (the "+1,100 more companies" line).
- **One flat white**: `filter: brightness(0) invert(1)` + `opacity: 0.5`
  (0.85 on hover). No brand color anywhere in the band — it is texture, not a
  sponsor wall, and color here would break the mint-only palette rule.
- **Pick monochrome-safe artwork.** Logos whose wordmark is a *white knockout*
  inside a colored shape (SAP, Samsung, Datadog) flatten into solid blobs — use
  a variant whose letters are real holes in the path, or a plain wordmark.
  Always eyeball a candidate in white-on-dark before shipping it.
- **Crop to artwork bounds**, then size optically: `h = 28 / ratio^0.3`, so a
  wide wordmark sits shorter than a compact mark and all carry the same visual
  weight. `h` ships as `--logo-h` inline; `width`/`height` attributes stay for CLS.
- **Never size these images `auto`** — several files carry no intrinsic
  dimensions and silently collapse to 0×0.
- **Marquee**: 3 identical passes, `translate3d(0 → -33.3333%)`, so the loop
  restarts on an identical frame (no seam). Two knobs, never the keyframes:
  `--lp3-logo-scale` (1.35 desktop / 1.1 mobile, on top of the optical `h`) and
  `--lp3-marquee-dur`. Growing the logos lengthens the track, so the duration
  must grow with it or the drift speeds up. Target ~37px/s desktop and ~26px/s
  mobile — phones are deliberately slower, since a narrow viewport passes a
  logo in a fraction of the time and matched px/s reads as a rush.
- Edge mask dissolves both sides; hover pauses for readability;
  `prefers-reduced-motion` falls back to one static wrapped pass. Duplicate
  passes are `aria-hidden` with empty `alt`, so the set is announced once.
- **Hover-pause is driven from JS (`initMarquee`), not `animation-play-state`.**
  A compositor-run CSS animation and the main thread keep separate clocks, so
  pausing one snaps the row to the other's frame — a visible jump right before
  it stops (Safari especially; it does not reproduce in headless engines). The
  CSS keyframes stay as the no-JS path; when JS loads it adds `.js-marquee`,
  cancels them, and writes the transform per frame, so the rendered position is
  always the last one written and hover freezes exactly where the eye saw it.
  The rAF loop idles when the band is off-screen or the tab is hidden, and speed
  stays authored in CSS (`--lp3-marquee-dur` = one pass).
- The label and count clear the row by `clamp(3.25rem, 4.5vw, 4.5rem)` above
  and `clamp(3rem, 4vw, 4rem)` below, so the marquee reads as its own band.

---

## 10. Content voice

**Punctuation:** prefer a comma or a colon to an em dash. A colon where the
second clause defines or expands the first ("RTK Pro: the AI Control Layer for
your team"), a comma where it is an aside, parentheses for a list inside a
sentence. Em dashes are reserved for the two places they earn their keep: the
brand lockup `RTK — Rust Token Killer`, and as the "no value yet" placeholder in
data UI. French sets a non-breaking space before a colon (`Pro : la couche`);
Chinese and Japanese take `：` or `、`, never a Latin em dash between CJK
characters.

- Short declarative sentences. No walls of text. No exclamation marks.
- The page tells ONE story in order: noise → transformation → proof → understanding
  → evidence → trust → action.
- Only ONE detailed terminal demo on the whole page (the "See it in action" section).
- Positioning: RTK is *the context optimization layer between your tools and your AI
  agent* — not "a bash compressor".

---

## 11. Accessibility (unchanged obligations + V3 specifics)

- Semantic landmarks, one `<main>`, skip link kept.
- All interactive elements keyboard-reachable; demo tabs use `role="tablist"` with
  arrow-key support; focus rings visible (`:focus-visible` global rule).
- Scroll-pinned hero must never trap scrolling — it's plain `position: sticky`,
  page scroll always works.
- Decorative visuals are `aria-hidden` with a visually-hidden text equivalent.
- No information conveyed by color alone (noise lines are also struck/removed,
  clean lines carry ✓ glyphs).
- Contrast: body text ≥ 4.5:1, labels ≥ 4.5:1 on their surface, UI lines exempt.

---

## 12. Performance

- Core visuals are DOM/SVG/CSS only. No canvas, no video, no hero images.
- Scroll handlers: single passive listener + `requestAnimationFrame`, class toggles
  and CSS-var writes only (no layout thrash).
- Inter loaded with `preconnect` + `display=swap`; weights 400/500/600 only.
- JS budget unchanged (< 100KB total); V3 interactions are a few KB of vanilla TS.

---

## 13. File map (V3)

| File | Role |
|------|------|
| `src/components/pages/LandingPageV3.astro` | Page composition + JSON-LD @graph |
| `src/components/landing/v3/*.astro` | V3 sections (Nav, Hero, Companies, Problem, Solution, Demo, Proof, Impact, Ecosystem, Install, Faq, ShareGain, FinalCta, Footer, RtkMark) |
| `src/styles/landing-v3.css` | ALL V3 styles + `--lp3-*` derived tokens (scoped under `.lp3`) |
| `src/scripts/landing-v3.ts` | Hero scroll, context viz, demo tabs, count-ups |
| `src/components/pages/LandingPage.astro` | **Backup** — legacy landing, untouched |

Never mix `lp3-` classes with legacy `landing.css` classes on the same page.

---

## 14. Chrome & content parity (non-negotiable)

The landing page is the site's main entry point, so it must never carry *less*
than the rest of the site. Before changing NavV3 or FooterV3, diff them against
`src/components/global/SiteHeader.astro` / `SiteFooter.astro` — every href in
those must exist here too.

- **The bar carries four items — `Product ▾ · Docs · Resources ▾ · Community ▾`**
  — plus search (⌘K), the star pill, the language menu and the install CTA.
  Everything else lives *inside* a menu. Restoring parity as a flat row produced
  15 elements and read as clutter; grouping keeps every destination without the
  noise. Before adding a fifth top-level item, put it in a menu.
    - **Product**: Why RTK · How it works · Demo · Integrations · Install · RTK Pro
    - **Resources**: Benchmarks · Blog · Changelog
    - **Community**: GitHub · Discord · Ko-fi · Team · Discussions
  Menus are `<details>` — click to open, keyboard-native, and they still work
  with JS off; JS only closes them on outside click and keeps one open at a time.
  Panels are **solid** (`--bg-card`), never glass: they sit over the animated
  hero and a translucent surface lets the token grid read through the labels.
- **Three zones, one button.** Left = identity + search (logo and the search
  field read as one utility cluster), centre = navigation only, right =
  proof + language + CTA. The star count and the language menu are *quiet* —
  transparent until hover — so the install CTA is the only element in the bar
  that looks like a button.
- **Search is a field, not an icon.** It sits beside the logo, so it gets a
  field's width (`clamp(132px, 11vw, 176px)`), a visible "Search" label, the ⌘K
  hint right-aligned and a hairline border — a text-entry affordance is the one
  action that earns a border. Wide enough to read as a field, no wider: it is a
  utility, not a feature. The gap to the wordmark is
  `clamp(1rem, 2vw, 1.75rem)` so the two stay separate objects rather than one
  glued lockup. On phones it collapses to the icon alone. Three bordered pills in a row made the
  right side read as a toolbar.
- **The CTA owns the right edge.** Nothing sits after it; a chip placed to its
  right steals the eye's endpoint and weakens the call to action.
- **Language shows the current locale only** (globe + `EN ▾`) and opens a compact
  grid on click, in both the nav and the footer. A permanent row of six codes is
  utility clutter.
- On phones only search + language + burger stay in the bar; everything else
  moves into the drawer, which repeats the same three groups (a crowded bar
  pushes the burger off-screen).
- **Footer** is the full site map: Install / Docs / Community / Products+Legal,
  the pre-footer CTA strip, the live version badge, social icons, and the
  **Cookie preferences** button — the only control that can reopen the GA4
  consent banner. Never reduce it to a couple of columns.
- **Locale-aware hrefs everywhere**: build internal links with
  `getRelativeLocaleUrl(currentLocale, …)`, and make the language switcher
  path-preserving (`getRelativeLocaleUrl(l, currentPath)`), never locale roots.
- **Every visible string goes through `t(key, lang)`.** Five locale homepages
  are generated from these components; a hardcoded string ships English to all
  of them. Section components take a `lang` prop and the page passes it down.
  Scripts must not author user-visible copy either — pass labels in via data
  attributes (see the ecosystem toggle).
- **Sections that must exist**: the proof screenshots (the only real evidence on
  the page), the install matrix with per-agent hook tabs, and the share-your-gain
  widget (the only user-generated distribution loop). They were dropped once in
  the V3 rewrite and had to be rebuilt.
- `id="install"` belongs to InstallV3 alone; the closing CTA links to it.

---

## 15. The rest of the site (every page, not just the landing)

The V3 system is the site's only design system. `landing.css` and the old
`SiteHeader`/`SiteFooter` survive **only** for `LandingPage.astro`, the backup
of the previous homepage — nothing else may import them.

- **Every non-landing page uses `src/layouts/PageV3.astro`.** It owns the V3
  nav, the footer, the search modal, the `.lp3` token scope, `landing-v3.css`,
  the skip link and the fixed-nav offset. Pages supply content and their own
  scoped `<style>` only — they never mount their own header, footer or search.
- **Content pages run a tighter rhythm than the landing.** `PageV3` lowers
  `--lp3-sec-pad` to `clamp(4rem, 6vw, 6.5rem)`: the landing gives each section
  one big statement, content pages carry lists and tables and read as dead space
  at landing spacing.
- **Page-specific CSS stays in the page**, never in `landing-v3.css`, and uses
  tokens only — no hardcoded hex.
- **The docs use the same nav.** `src/components/starlight/Header.astro` mounts
  `NavV3` inside a `.lp3` wrapper; `landing-v3.css` is fully `.lp3*`-scoped so it
  cannot leak into Starlight. `--sl-nav-height` in `starlight-overrides.css` must
  stay equal to the nav height (64px) or the docs content slides under it.
  The docs keep the compact `global/Footer.astro` — a marketing site map under
  every reference page would fight the content.
- **Restyling never rewrites content.** When a page moves to V3, every word,
  link href, image and aria-label stays exactly as it was; only the presentation
  changes. Verify by diffing the built page's text nodes and hrefs before/after.
- **Runtime-generated markup pins its class names.** `benchmarks.js` builds the
  KPIs, table and chain against `.bench-*` classes — restyle them, never rename.
- Build-time repo facts (stars, version) come from `src/lib/github.ts`, which
  caches one fetch per build; pages must not call the GitHub API themselves.

---

## 16. Share links

- Every share target is the **product page** (`https://www.rtk-ai.app`), never
  the GitHub repo — a share should land someone on the site, and LinkedIn
  scrapes that URL to build its card.
- LinkedIn's `share-offsite` accepts a **URL only**; it ignores any text
  parameter and builds the preview from the page's own OG tags.
- A share button with nothing to share carries **no `href`** and the `is-idle`
  class. An anchor pointing at `"#"` looks live and silently jumps to the top of
  the page — that is exactly how the share-gain widget read as broken.

---

## 17. Homepage section order

The page is an argument, and the order is the argument's shape. Numbered
sections are the argument; everything else is furniture.

```
Hero
Companies                       ← trust band, unnumbered
01 / The problem                Your context window is valuable.
02 / The solution               Fast enough to disappear.  (the spec table)
03 / See it in action           The difference is clear.
04 / The evidence               Measured, not claimed.
05 / The impact                 More room to think.
Works with your AI coding stack ← compatibility band, unnumbered
06 / Get started                Running in 30 seconds.
FAQ · Final CTA                 ← closing utility, unnumbered
```

Why this shape, so it does not drift back:

- **Show before you claim.** The impact ("more room to think") sits *after* the
  demo and the measured evidence. It used to come before both, which asserted
  the payoff before anything earned it.
- **Section 02 IS the specs.** It used to carry a NOISE → gate → SIGNAL field
  diagram under "RTK cleans the noise." — the same metaphor, with the same gate
  mark, that the hero choreography already performs. Two identical visuals back
  to back. 02 now carries the part the hero cannot show: what the thing is made
  of. The retired strings (`v3.solution.title`, `.lede`, `.diagram_sr`,
  `.label_noise`, `.label_signal`) and the `.lp3-field*` CSS are kept so the
  diagram can be restored, but do not re-add it above the specs.
- **Compatibility is a qualifier, not an opener.** "Works with your stack" sits
  right before Get started (does it fit → install), instead of stacking a second
  band of names on top of the page before the story starts.
- **No share-your-gain widget.** It was restored from the old design, then cut:
  it only works for someone who has already installed RTK and run the command,
  so on an acquisition page it is a form most visitors cannot use. The closing
  CTA still carries plain share links. (Legacy `landing/ShareGain.astro` and the
  `v3.share.*` strings remain for the archived homepage.)
- **Numbering must stay consecutive.** It ran 01–04 then 06–07 with two
  unnumbered sections inside the run — a gap advertises a step the page does not
  have. If a section joins the argument, renumber the rest.

---

## 18. The AI CONTEXT chart (01 / The problem)

It mirrors Claude Code's own `/context` profiler — same categories, same
vocabulary — because a reader can check it against their own terminal. Two
rules keep it honest:

- **Show a session near capacity (86%), not a half-empty one.** A window at 40%
  has no problem to show and makes RTK look irrelevant. Real working sessions run
  close to autocompact — that is the pain, and the resting/no-JS state must be
  the BEFORE picture, since this is the problem section.
- **The fixed costs stay tiny.** System prompt + tools ~3%, MCP ~1%, memory ~1%,
  skills ~0.5%. That is what the real profiler shows, and it is also the
  argument: overhead is not the problem, the conversation is — and CLI output is
  the compressible part of it. Scroll compresses that row 18% → 5%, taking the
  window 86% → 73%: out of compaction territory.
- **The state is legible without reading numbers.** At ≥80% the used figure and
  the total bar carry `--red` (`.is-full`); below, they return to mint. The
  colour change is the sell — a reader sees the window go from warning to safe.
- **Never inflate the CLI share.** An earlier version claimed 54% of the window
  was CLI noise and that RTK freed 48 points. RTK's own SkillsBench post puts
  bash output at a bounded slice of the bill, so that chart contradicted the
  company's published analysis — the fastest way to lose a technical reader.
- **It is labelled an example.** These proportions swing hard between projects
  and tool setups, so the caption says "Example session — varies by project and
  tooling" rather than presenting one profile as a measurement.

---

## 19. Claims must be measured

Every number on the page is checkable by the audience, so it is checked.

- **Overhead** says `< 20 ms`. Measured on rtk 0.48.0 (OSS master) against
  absolute-path raw binaries, Apple Silicon, 40 warm runs: median **+9.0 ms**,
  range **+4.6 ms** (git log) to **+15.8 ms** (git diff); `find` is *faster*
  through rtk. The old `< 10 ms` was false for git diff; 20 ms keeps a ceiling
  (which is what a spec row should give) with headroom over the worst case.
  It is still one machine's figure, so re-measure per release — slower hardware
  sits higher, and a ceiling is the claim most worth re-checking.
  *Method, to reproduce:* build OSS master in a throwaway git worktree, run each
  command with absolute paths (never via the shell — `grep`/`find` are shell
  functions here and the RTK hook rewrites the agent's Bash calls), take
  `median(rtk CMD) − median(CMD)` over 40 warm runs, and record output bytes to
  confirm RTK actually filtered rather than passed through.
- **Telemetry** says `Opt-in, no personal data`, not `None`. RTK does ship
  telemetry; it is disabled by default and needs explicit consent
  (`rtk init` / `rtk telemetry enable`). Claiming "None" is both wrong and
  needlessly defensive about a privacy-respecting design.
- **Commands** says `125+`: 64 command implementations plus 63 TOML filters in
  the rtk repo.
- Re-measure after a release rather than nudging the copy. The measurement
  script lives in the landing repo's scratchpad, not in git — rebuild it from
  the method: median of N runs, warm cache, `median(rtk CMD) − median(CMD)`.

---

## 20. Panel template (context card, demo frame)

Both instrument-style panels share one template, and the rule is **one frame,
ruled inside** — never boxes inside boxes.

- **Frame**: 1px `--lp3-line`, radius `--lp3-radius-sm` (not the larger radius),
  flat `--lp3-surface`, `overflow: hidden`. Nothing inside gets its own border,
  radius or background.
- **Divisions are hairlines**: the demo's two states are separated by a single
  vertical `--lp3-line` (horizontal when stacked ≤720px), and each column's
  micro-label strip is closed by a hairline. Two bordered sub-cards read as
  consumer UI; one ruled surface reads as an instrument.
- **Tabs are text with a 2px accent underline**, not pills. A pill with a border
  and a filled background is the single heaviest element a quiet panel can carry.
- **No decorative chrome**: the floating circular arrow between the demo columns
  was removed — the labels and the divider already say which side is which.
- **Digits use `tabular-nums`** wherever they line up in a column (line counts,
  percentages), so the figures form a vertical rule of their own.
- Colour stays semantic: mint for kept signal, `--red` for noise, everything
  else in the neutral ramp.

---

## 21. Paired screenshots (04 / The evidence)

Two real screenshots sit side by side and they have very different intrinsic
shapes: `rtkgain02` is landscape (1370×840), `rtkgain01` is portrait (609×967).
Left alone the portrait one runs nearly twice as tall and the row reads as a
mistake rather than a pair.

- **Match the heights, do not scale the image down.** Shrinking the portrait
  shot to fit would make its already small terminal type unreadable. It is
  cropped instead: `object-fit: cover; object-position: top`, so the crop takes
  the top of the frame, which is where the summary rows are.
- **Derive the crop ratio, do not eyeball it.** With grid columns `1.55fr 1fr`,
  the visible box works out to `1370 / 1307` (see the comment on
  `.lp3-proof-card.is-tall.is-cropped`). Change the columns or swap an image and
  that number has to be recomputed, otherwise the two drift apart again.
- **Cropped content always gets a way to open.** A `Show full screenshot` button
  sits between the image and the caption and toggles the crop off.
- **JS applies the crop, markup never does.** `initProofCrop()` adds
  `.is-cropped` and unhides the button together. With no JS the reader gets the
  whole image rather than a truncated one with no control, the same rule as
  `js-collapsible` on the ecosystem row and `js-marquee` on the logo banner.
- Stacked below 900px there is no neighbour to match, so the crop falls back to
  a flat `max-height: 420px` cap with the same button.

**Discord close-out.** The section ends on one hairline-separated link to
`#show-your-gains`: the cards show one developer's numbers, the link shows
everyone else's. It is a bare link, not a fourth panel, because the section
already carries two framed cards and a third box would read as an ad. Discord
invites cannot deep-link to a channel without guild and channel IDs, so the
channel is named in the copy and the href is the plain invite.

---

## 22. Claim scope: output, not the bill

RTK compresses **CLI output**. It does not reduce the system prompt, the memory
files, the MCP tool definitions or the conversation history, and those are what
actually fill a context window. Any copy that says RTK cuts "token usage" or
"token costs" by a percentage is claiming credit for the whole window, and it is
wrong. The measured claim is: **up to 90% of CLI output noise**, 89% average
across 2,900+ real commands.

- Say what is compressed: "CLI output noise", "shell output", "command output".
  Never "token usage", "your bill", "API costs" as the object of the percentage.
- Cost and longer sessions are **consequences**, phrased as such. They are not
  the number.
- The hero meter goes 86% -> 73%, the same arithmetic as the 01 chart: CLI output
  is 18% of that window and RTK takes it to 5%. It must never sweep to an empty
  window, which would claim RTK cleans context it never touches. `HeroV3.astro`,
  `initContextViz`, the hero's `data-clean-*` attributes and
  `v3.hero.visual_sr` all carry the same pair of numbers, so a change to one is a
  change to four.
- This applies to invisible copy too, and that is where it hides: meta
  descriptions, JSON-LD (`SoftwareApplication`, `HowTo`, `WebPage`, FAQ answers),
  the RSS channel description, `astro.config.mjs`, prefilled share links and
  screen-reader text. The FAQ answers feed `FAQPage` schema, so a loose sentence
  there is quoted back by AI search verbatim.

---

## 23. RTK Pro placement

Pro is the same product for a bigger audience, not a second brand.

- **The free path is always offered first.** `ProCta` sits after `FinalCta`, so
  the page closes on "install the CLI", then "take it to a team". Never above.
- **Bounded panel, not a full-bleed section.** `FinalCta` owns the page's climax
  with the watermark, scene light and grain. Pro is a framed card inside a normal
  container, which reads as an adjacent offer rather than a second ending.
- **Green, always.** Per the token rules cyan belongs to ICM and violet to Vox,
  and Pro is neither. Separate Pro by TREATMENT (elevated panel, corner wash,
  hairline three-column grid, mono eyebrow with a dot), never by a fourth hue.
- **Say what it adds, in three, in this order:** observability, security,
  governance. The order is the buying argument, not alphabetical: first see what
  the team spends, then make it safe to hand out, then hand it out at scale. The
  panel's grid is sized for exactly three; a fourth turns it into a feature list
  and it stops being a CTA.
- **The lede states the shape of the product, not its adjectives.** RTK runs on
  one machine, Pro connects those machines into one layer. A reader who does not
  already know what Pro *is* learns it in the first sentence.
- **Close with the reassurance.** "The CLI stays free and open source, Apache
  2.0, forever" sits beside the button. An open-source project that ends its
  homepage on a paid product owes the reader that sentence.
- The nav's Product menu follows the same order: Install first, RTK Pro last.

---

## 24. Point at the source, do not recite the number

The FAQ answer to "how many tokens does RTK actually save?" used to recite a
dataset that does not exist: "2,900+ real-world commands", per-command figures
for cargo test / git status / find / grep, and an 89% average. Numbers in prose
go stale, drift between pages, and cannot be checked. A benchmark page can.

- **An answer may carry `links`.** `FaqV3` takes an optional
  `links: [{ href, label }]` and renders them under the answer; the same links
  are appended to the FAQPage JSON-LD as anchors, which the spec permits, so
  schema and page never disagree. Reach for this instead of quoting a figure.
- **A figure appears once, at its source.** 88.9% efficiency and 130M tokens
  saved live in the proof section because the screenshot beside them shows those
  exact values. They are not a site-wide average and must not be restated as one
  in meta descriptions, `featureList`, or share text.
- **Check a caption against its own image.** The proof caption read "138M tokens
  saved" next to a screenshot printing "130.0M". If a number labels an image,
  read the image.
- FAQ answers feed `FAQPage` schema, so AI search quotes them verbatim. An
  invented statistic there is repeated as fact by systems that never see the page.

---

## 25. The two numbers, and who we are

**56% is the average, 90% is the ceiling.** 56% is measured across the commands
RTK actually *rewrites*, not across everything a shell runs, and both bounds must
carry that scope in the sentence itself, so neither can be lifted out and quoted
as a global figure. "Up to 90%" alone is a ceiling presented as a norm; "56%"
alone invites "of what?". Say both, scoped, or link to the benchmarks.

The community aggregate is **billions of tokens saved** (French: *milliards*).
It stays a word, not a count-up stat: `animateCount` needs a leading numeral, and
inventing one to animate would be exactly the failure of §24.

**The entity is RTK AI Labs**, everywhere and untranslated: the byline, the
copyright holder, the blog author, the schema `Organization`. Not "RTK Team",
not "rtk-ai" (that is the GitHub org and the domain, not the name of the people).

**Do not stack reassurances.** The Pro panel's note is "The CLI stays free and
open source." The licence is already in the footer of every page and on the spec
table; repeating "Apache 2.0, forever" beside the paid CTA protests too much.

---

## 26. Decoration must never end on a straight line

`.lp3-cta` carries `overflow: hidden`, which clips its watermark and scene light
at the section's bottom edge. While that section was the last one on the page the
cut fell on the footer's own border and nobody saw it. Adding `ProCta` after it
exposed the cut as a hard horizontal seam straight across the page.

- Any absolutely-positioned decoration inside an `overflow: hidden` section must
  **fade before it reaches the clip**, via `mask-image: linear-gradient(...)`.
  All three of `.lp3-cta`'s layers now do: the watermark, the scene light and the
  film grain.
- **The grain was the real offender, and it declares no colour at all.** At 2.5%
  opacity over `--bg` it shifts the section about three RGB units, which is
  invisible as a tint and glaring as an edge: a full-bleed `inset: 0` rectangle
  ending on a straight line. Anything that tints a whole section, noise, glow,
  vignette, has to fade at any boundary that is not already marked by a hairline.
- **Measure, do not squint.** A three-unit step is real but nearly invisible on a
  dark screen. Sample a pixel column down the boundary and look for the jump, or
  screenshot the strip and stretch its contrast; guessing from a screenshot is
  how the grain survived the first fix.
- The general rule: a background that ends at a geometric boundary reads as a
  rendering bug, not as a section change. Sections divide with a hairline
  (`--lp3-line`) or with nothing, never with a clipped gradient or a sliced image.
- This is a class of bug that only appears when the running order changes, so
  **re-check the seams above and below any section you insert**, not just the
  section itself.

---

## 27. The sheen sweep is for closing CTAs only

`initButtonSheen` sweeps a highlight across `.lp3-btn-primary` when it scrolls
into view. It is deliberately scoped:

- **Never in the footer.** The footer is on every page, so a sweep there fires on
  every page, on every scroll to the bottom, on the 404 as readily as on the
  landing. A highlight that plays everywhere stops reading as emphasis and starts
  reading as a nervous tic. `initButtonSheen` filters out anything inside
  `.lp3-footer`; the button keeps its hover state, which is where a footer CTA
  earns attention.
- It fires **once per element** (`io.unobserve` on first sweep), so scrolling up
  and down does not replay it.
- Currently sweeping: the hero CTA, the closing CTA in `#ship`, and the Pro CTA
  in `#pro`. Three moments, each closing a section of the argument. Adding a
  fourth means asking which of the existing three should lose it.
- `reduced()` gates the whole thing, so `prefers-reduced-motion` disables it.

---

## 28. One figure, one owner

The footer said "18k+ developers" while the hero three screens above said
"140K+". Both shipped on the same page, in six languages, for as long as the
footer had existed. Nobody reading top to bottom would trust either.

- **`HeroV3.astro`'s `stats` array owns the adoption numbers**: downloads,
  stars, developers, commands, tools. Anything else that states one of them
  copies from there, and changing it there means grepping for the old value in
  every locale before calling the change done.
- Localised numbers do not grep like English ones. `18k` also lives as
  `18 000`, `18.000`, `18,000 人` and `1.8 万`. Search the digits in every
  formatting convention, not the English string.
- Retired files count. The claim was also in `legacy/HeroV3-v1.astro` and in the
  superseded `SiteFooter.astro`; both are kept deliberately, so both get fixed,
  or the wrong number comes back with whatever restores them.

---

## 29. Hero Pro chip: kicker on desktop, epilogue on phone

Above 700px the chip sits over the H1 as a quiet kicker; the eye passes it on the
way to the headline and loses nothing. Below 700px it becomes a near-full-width
pill that arrives *before* the page has said what it is, so the headline lands
second. Under 700px it is ordered **after the CTAs**: headline, Install and
GitHub, then the chip. Below the title alone was not enough, that still put a
secondary link between the headline and the primary button. Nothing may stand
between the H1 and Install on a phone.

- **CSS `order` only, never a second copy of the markup.** Duplicating the link
  and toggling with `hidden` would give the crawler two Pro links and the screen
  reader an invisible one.
- **This one does move focusable elements past each other**, so it is the case
  the point above warns about: the chip is first in the DOM but last visually, and
  a keyboard user tabs to it before reaching Install. Accepted because the chip is
  a single low-stakes link inside one small block that is entirely on screen at
  once, so nothing is hidden from anyone. Any larger reorder gets a DOM change
  instead of `order` (WCAG 2.4.3).
- The copy stagger uses `:nth-child`, which follows the DOM, so the reveal timing
  is untouched. The chip is already excluded from that stagger and revealed last
  by `.pro-on`, so appearing last visually is what the choreography always meant.
- Breakpoint is 700px, not the 960px where the hero stacks: on a tablet the
  headline still has room to sit under a kicker.

---

## 30. Parity audit against production (run before merging)

The rework is verified against the live site, not against memory. Reproducible:

1. **Pages** — diff `sitemap-0.xml` from prod and from the local preview.
2. **Links** — crawl every `<a href>` in `dist/**/*.html` and resolve each internal
   target against the built files. Zero broken links on site pages is the bar.
3. **Assets** — same crawl for `src`/`href` ending in an asset extension.
4. **Schemas** — parse every `application/ld+json` block. Note they may be a
   top-level **array**, not an object or a `@graph`; a checker that assumes a
   dict reports false failures.
5. **Chrome** — nav, footer, search trigger and cookie reset must be present on
   every non-docs page.

**What this audit caught, and the rule it leaves behind:** localizing a URL is
only safe when the localized page is actually built. `/team/`, `/blog/`,
`/blog/<post>/` and `/404` are English-only, so `getRelativeLocaleUrl` on them
produced `/fr/team/` and friends: 20 dead links, plus `hreflang` alternates
advertising the same dead URLs to crawlers. Both now route through
`localizedPath()` in `src/lib/i18n.ts`, which falls back to the locale homepage.
**One helper, used by both the switcher and the `hreflang` block, so the two can
never disagree.** Add a locale build for a page, and its prefix goes in
`LOCALIZED_PREFIXES` in that file, nowhere else.

---

## 31. Docs links resolve against their own directory

`plugins/remark-docs-links.mjs` rewrites relative `.md` links in the RTK docs.
It used to keep only the filename and prefix `/guide/`, so `./installation.md`
inside `getting-started/` became `/guide/installation/`, a page that does not
exist. Nine links shipped as 404s, on production, for as long as the docs have
been nested. They survived review because **the sidebar was always right**:
Starlight builds it from config and never touches the plugin, so navigating
normally never hit the dead link. Only the sentence inside the prose did.

- The plugin resolves against `file.history[0]`, the containing directory, and
  emits a real `/docs/...` URL. Content dir == URL path, so no mapping table.
- With no resolvable path it leaves the link alone rather than guessing.
- **Internal doc links must never route through the `/guide/` backcompat
  redirects** in `astro.config.mjs`. That map is for old inbound links from
  outside the site; using it internally hides broken links behind a redirect.
- `/guide/technical/` and `/guide/filter-workflow/` pointed at `/docs/` pages
  that no longer exist in the rtk repo, so they redirected onto a 404. They now
  land on `/docs/`. A redirect target needs checking whenever docs are removed
  upstream.
- **Caching gotcha:** the content layer caches rendered markdown in
  `node_modules/.astro/data-store.json`, keyed on content. Editing a remark
  plugin does not invalidate it, and `touch` on the source does not either. Only
  a config change or deleting that file forces a re-render, so verify a plugin
  fix after one of those, never on a warm build.
