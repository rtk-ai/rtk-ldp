# rtk-landing

Landing site for [RTK — Rust Token Killer](https://github.com/rtk-ai/rtk). Built with Astro 5 + Starlight.

Live: **[www.rtk-ai.app](https://www.rtk-ai.app)**

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Astro 5 |
| Docs | Starlight |
| Styles | CSS custom properties (dark-only design system) |
| Deploy | GitHub Pages via GitHub Actions |
| Fonts | DM Sans + JetBrains Mono (Google Fonts) |

---

## Site structure

### Pages

| Route | Description |
|-------|-------------|
| `/` | Main landing page |
| `/vox/` | Vox product page — local-first TTS for Claude Code |
| `/icm/` | ICM product page — persistent memory for AI agents |
| `/guide/` | Starlight documentation (generated from rtk repo) |
| `/rss.xml` | RSS feed (releases + updates) |

### Homepage sections (`/`)

| Section | Component | Description |
|---------|-----------|-------------|
| Hero | `Hero.astro` | Headline, stats (89%, 3x, 30+), terminal demo, GitHub stars badge |
| Problem | `Problem.astro` | 3 problem cards: context pollution, short sessions, cost explosion |
| Demo | `DemoSlideshow.astro` | 11 before/after slides (cargo test, git status, grep, find…) |
| Proof | `Proof.astro` | Real `rtk gain` screenshots with token savings data |
| Tool Comparison | `ToolComparison.astro` | How RTK extends Claude Code, Cursor, Gemini CLI session limits |
| Cloud Waitlist | `CloudWaitlist.astro` | Email capture for RTK Cloud beta |
| Install | `Install.astro` | 3 install methods (curl, Homebrew, Cargo) + `rtk init --global` |
| Share Gain | `ShareGain.astro` | Paste `rtk gain` output, generate social share card |
| CTA | `Cta.astro` | Final call to action |
| FAQ | `index.astro` | 6 Q&A accordion — also exposes FAQPage JSON-LD schema |
| Starred by | `index.astro` | Scrolling carousel of companies whose devs starred RTK |

### Vox page sections (`/vox/`)

| Section | Description |
|---------|-------------|
| Hero | Give Claude Code a voice — stats: 3 backends, 8 MCP tools, 0 API calls |
| Features | 6 feature cards: task notifications, spoken summaries, voice cloning, local, cross-platform, one-command setup |
| Backends | `say` (macOS native), `qwen` (Apple Silicon neural), `qwen-native` (pure Rust, all platforms) |
| Demo | CLI usage examples: basic TTS, voice cloning, configuration |
| Integration | 4 init modes: `mcp`, `cli`, `skill`, `all` — 8 MCP tools listed |
| Install | curl, Cargo, GPU variants — then `vox init mcp` |
| Platform defaults | Table: macOS vs Linux/WSL backend selection |

### ICM page sections (`/icm/`)

| Section | Description |
|---------|-------------|
| Hero | Your AI forgets everything. Fix that. — stats: ∞ session memory, 22 MCP tools, 1 binary |
| Features | Temporal decay, knowledge graphs, hybrid search (BM25 + vector), MCP native, 100% local |
| Memoirs | Knowledge graph feature — typed relations (depends_on, contradicts, refines) |
| Search | Hybrid BM25 (30%) + cosine similarity (70%) via sqlite-vec |
| Install | curl + `icm init` — auto-configures 14 editors |
| Editor support | Claude Code, Cursor, Windsurf, VS Code/Copilot, Gemini Code Assist, Zed, Amp, Amazon Q, Cline, and more |

### Documentation (`/guide/`)

Generated from the [rtk](https://github.com/rtk-ai/rtk) repo at build time. Sections:

| Route | Content |
|-------|---------|
| `/guide/` | Overview |
| `/guide/getting-started/installation/` | Installation methods |
| `/guide/getting-started/quick-start/` | First steps |
| `/guide/getting-started/supported-agents/` | Compatible AI tools |
| `/guide/configuration/` | Config options |
| `/guide/what-rtk-covers/` | Supported commands |
| `/guide/analytics/gain/` | `rtk gain` analytics |
| `/guide/troubleshooting/` | Common issues |

---

## Local development

```bash
pnpm install

# Full dev server — docs included (recommended)
pnpm dev:full

# Landing only — /guide/* will return 404 (docs not generated)
pnpm dev
```

> **`/guide/` returns 404?** You're running `pnpm dev` without generating the docs first.
> Run `pnpm dev:full` instead — it runs `prepare-docs.mjs` + `build-search-index.mjs` before starting the dev server.

```bash
# Custom rtk repo path (default: ../rtk)
RTK_REPO_PATH=/path/to/rtk pnpm dev:full

# Or generate docs once, then use the faster pnpm dev
node scripts/prepare-docs.mjs
pnpm dev
```

---

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Dev server on port 4321 (landing only, no docs) |
| `pnpm dev:full` | prepare-docs + build-search + dev server (full site) |
| `pnpm build` | Full production build (prepare-docs + build-search + astro build) |
| `pnpm build:guide` | Run `prepare-docs.mjs` only |
| `pnpm build:search` | Run `build-search-index.mjs` only |
| `pnpm preview` | Preview the production build locally |

---

## Docs pipeline

Docs pages come from the [rtk](https://github.com/rtk-ai/rtk) repo. The pipeline:

```
rtk/docs/guide/**/*.md
        ↓ scripts/prepare-docs.mjs
src/content/docs/guide/          (gitignored — generated at build)
        ↓ Starlight autogenerate
/guide/**/ routes
```

In CI (`deploy.yml`), the rtk repo is cloned fresh at `./rtk-repo` before each build.

To update docs locally after a change in the rtk repo:

```bash
node scripts/prepare-docs.mjs
# or with a specific path:
RTK_REPO_PATH=/path/to/rtk node scripts/prepare-docs.mjs
```

---

## Key files

| File | Role |
|------|------|
| `src/pages/index.astro` | Homepage — imports all landing sections, holds FAQ + JSON-LD schemas |
| `src/pages/vox/index.astro` | Vox product page |
| `src/pages/icm/index.astro` | ICM product page |
| `src/layouts/Layout.astro` | Base HTML shell — meta tags, OG, WebPage schema auto-inject |
| `src/components/landing/` | All landing page section components |
| `src/components/starlight/` | Starlight overrides (Header, Footer, Head) |
| `src/components/global/` | Shared components (Header, SearchModal, I18nScript) |
| `src/styles/landing.css` | All landing page styles |
| `src/styles/starlight-overrides.css` | Docs page style overrides |
| `src/data/rss-entries.ts` | Manual RSS entries — edit here on each release |
| `src/data/docs-search-entries.ts` | Auto-generated search index for docs (do not edit) |
| `src/data/docs-anchor-map.json` | Anchor map for cross-doc links (generated) |
| `scripts/prepare-docs.mjs` | Docs pipeline: rtk repo → Starlight content |
| `scripts/build-search-index.mjs` | Builds the Cmd+K search index |
| `public/robots.txt` | Crawler config — explicit allow for GPTBot, PerplexityBot, ClaudeBot |
| `astro.config.mjs` | Astro + Starlight config, redirects, sidebar |
| `.github/workflows/deploy.yml` | CI/CD: build + deploy to GitHub Pages |

---

## SEO / GEO

The site is optimized for both traditional SEO and GEO (Generative Engine Optimization — visibility in AI search like ChatGPT, Perplexity, Claude).

**Schema markup (JSON-LD):**
- Homepage: `@graph` with `Organization`, `SoftwareApplication`, `FAQPage`, `HowTo`, `WebPage`, `SpeakableSpecification`
- `/vox/` and `/icm/`: `SoftwareApplication` + `WebPage`
- `/guide/*`: `BreadcrumbList` + `TechArticle` (via Starlight Head override)

**GEO signals:**
- `robots.txt` explicitly allows GPTBot, PerplexityBot, ClaudeBot, Anthropic-ai, Google-Extended
- Authoritative prose paragraphs with per-command measurements in body text
- FAQPage with 6 Q&A — crawlable by AI engines

**Images:**
- All illustrations converted to WebP (-40% average size)
- `width`/`height` attributes on all images (CLS prevention)

---

## RSS

The RSS feed at `/rss.xml` is sourced from `src/data/rss-entries.ts`.

After each release or significant update, add an entry at the top of `rssEntries`:

```ts
{
  type: 'release',           // release | new_page | new_doc | new_feature | performance
  title: 'RTK v0.35.0 released',
  date: 'Apr 10, 2026',
  description: '...',        // 1-3 sentences, no HTML
  link: 'https://www.rtk-ai.app/...',
}
```

---

## Deploy

Pushes to `main` trigger the GitHub Actions workflow automatically.

The workflow:
1. Clones the rtk repo at `./rtk-repo`
2. Runs `prepare-docs.mjs` to generate doc content
3. Runs `build-search-index.mjs`
4. Builds with `astro build`
5. Deploys to GitHub Pages

DNS: `www.rtk-ai.app` → `rtk-ai.github.io` (CNAME in `public/CNAME`)
