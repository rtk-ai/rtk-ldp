# Changelog

All notable changes to the rtk-landing site.

---

## [Unreleased]

---

## 2026-04-06 — Full SEO/GEO audit

### Added

**Schema markup (JSON-LD)**
- Homepage: full `@graph` block — `Organization`, `SoftwareApplication`, `FAQPage`, `HowTo`, `WebPage`, `SpeakableSpecification` — all entities linked by `@id`
- `/vox/`: `SoftwareApplication` schema with 6-item `featureList`
- `/icm/`: `SoftwareApplication` schema with 7-item `featureList`
- `Layout.astro`: auto-injects `WebPage` + `Publisher` schema on every landing page; detects `@graph` to avoid duplicates
- `/guide/*`: dynamic `BreadcrumbList` (via new `src/components/starlight/Head.astro` override)
- `/guide/*`: global `TechArticle` schema with publisher info (via `astro.config.mjs` Starlight `head` config)
- `HowTo` schema: 3-step install process with `totalTime`, `tool`, and per-step URLs
- `SpeakableSpecification`: points to `h1`, `.hero-context`, `.faq-answer`, `.session-note`
- `softwareVersion` + `releaseNotes` URL in SoftwareApplication schemas

**GEO optimization**
- `.hero-context` paragraph: authoritative prose with per-command measurements (cargo test 91.8%, git status 80.8%, find 78.3%, grep 49.5%)
- FAQ section: 6-item accordion (`<details>`/`<summary>`) — answer-first format, data-rich, crawlable
- `robots.txt`: explicit allow for `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Anthropic-ai`, `Bingbot`, `Google-Extended`
- `FAQPage` JSON-LD: 6 Q&A pairs — auto-synced from the same `faqItems` array that renders the HTML

**Performance**
- Converted 10 images to WebP: 8 illustrations (−38–47%) + 2 screenshots (−45–54%) — total −41% weight
- Added `width`/`height` attributes to all `<img>` tags (CLS prevention)
- Updated all `src` references from `.jpg`/`.png` to `.webp`

**Documentation**
- Root `CLAUDE.md` created with full project instructions (URLs, stack, architecture, SEO rules, FAQ workflow, image rules)
- `CHANGELOG.md` created (this file)
- `README.md` rewritten: full page/section breakdown, key files table, SEO/GEO section, docs pipeline diagram
- GitHub repo: description + 10 topics added (`astro`, `starlight`, `rtk`, `claude-code`, `token-optimization`, `seo`, `developer-tools`…)
- `.claude/CLAUDE.md`: updated with SEO/GEO sections, new key files, FAQ workflow

**Dev experience**
- README: `pnpm dev:full` highlighted as default command with 404 callout for `/guide/`
- Header: Cmd+K search button added to docs pages nav
- `SearchModal` added to Starlight pages

---

## 2026-04-05 — Astro 5 + Starlight migration (Phase 0–2)

### Added
- Astro 5 setup with Starlight for docs
- Landing page sections: Hero, Problem, DemoSlideshow, Proof, ToolComparison, CloudWaitlist, Install, ShareGain, Cta
- Vox product page (`/vox/`)
- ICM product page (`/icm/`)
- Docs pipeline: `prepare-docs.mjs` + `build-search-index.mjs`
- RSS feed at `/rss.xml`
- GitHub Actions deploy workflow
- Dark-only CSS design system with custom properties
- Starlight Header/Footer overrides
- Global Cmd+K search modal
- i18n script (data-i18n attributes)
- Viking illustration series (8 JPG assets)
- `rtk gain` screenshot assets
- PostToolUse hook: RSS reminder on git push
