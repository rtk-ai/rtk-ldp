# RTK Landing — Claude Code Instructions

## URLs

| Environment | URL |
|-------------|-----|
| **Production** | https://www.rtk-ai.app |
| **GitHub Repo** | https://github.com/rtk-ai/rtk-landing |
| **RTK Repo** | https://github.com/rtk-ai/rtk |

---

## Stack technique

| Layer | Tech |
|-------|------|
| Framework | Astro 5 |
| Docs | Starlight |
| Styles | CSS custom properties (dark-only design system) |
| Deploy | GitHub Pages via GitHub Actions |
| Fonts | DM Sans + JetBrains Mono (Google Fonts) |

**No React. No component framework. Pure Astro + CSS.**

---

## Local dev

```bash
# Full dev (docs incluses) — à utiliser par défaut
pnpm dev:full

# Landing only — /guide/* renvoie 404 sans les docs
pnpm dev

# Chemin custom vers le repo rtk (défaut: ../rtk)
RTK_REPO_PATH=/path/to/rtk pnpm dev:full
```

> **`/guide/` retourne 404 ?** Utilise `pnpm dev:full` — il génère les docs avant de lancer le serveur.

## Build & deploy

```bash
pnpm build    # Build complet (prepare-docs + build-search + astro build)
pnpm preview  # Preview dist/
```

Push sur `main` → deploy automatique via GitHub Actions.

### Épingler la version des docs RTK en CI

La variable repo `RTK_DOCS_REF` contrôle le tag/branche cloné en CI (défaut : `master`).

Pour épingler à un tag spécifique :
1. GitHub → Settings → Variables → Repository variables
2. Créer `RTK_DOCS_REF` = `v1.5.0` (ou le tag voulu)
3. Le prochain build clonera ce tag au lieu de `master`

Supprimer la variable pour revenir sur `master` automatiquement.

---

## Architecture

```
src/
  pages/
    index.astro              # Landing page (Hero, Problem, Demo, Proof, FAQ…)
    vox/index.astro          # Page produit Vox
    icm/index.astro          # Page produit ICM
    rss.xml.ts               # Endpoint RSS
    404.astro
  content/docs/guide/        # GÉNÉRÉ — ne jamais éditer (prepare-docs.mjs)
  layouts/
    Layout.astro             # Shell HTML — meta tags, OG, WebPage schema auto-inject
  components/
    landing/                 # Sections landing (Nav, Hero, Problem, Install…)
    global/                  # Partagés (Header docs, SearchModal, I18nScript)
    starlight/               # Overrides Starlight (Header, Footer, Head)
  data/
    rss-entries.ts           # ← ÉDITER ICI pour ajouter des entrées RSS
    docs-search-entries.ts   # GÉNÉRÉ — ne pas éditer
    docs-anchor-map.json     # GÉNÉRÉ — ne pas éditer
  styles/
    global.css               # Design tokens + resets (source de vérité)
    landing.css              # Styles pages landing
    starlight-overrides.css  # Overrides thème Starlight
scripts/
  prepare-docs.mjs           # Pipeline docs: rtk/docs/guide/ → src/content/docs/guide/
  build-search-index.mjs     # Construit docs-search-entries.ts
```

---

## Design system

Tokens dans `src/styles/global.css`. **Jamais de styles inline pour des couleurs qui ont un token.**

```css
--bg: #060b18          --accent: #00e599
--bg-alt: #0c1225      --cyan: #38bdf8
--bg-card: #0f1629     --violet: #a78bfa
--text: #e2e8f0        --border: #1a2344
--text-muted: #8294ab
--text-dim: #64748b
```

---

## Fichiers critiques

| Fichier | Rôle |
|---------|------|
| `src/pages/index.astro` | Landing — sections + schemas JSON-LD (@graph complet) |
| `src/pages/vox/index.astro` | Page Vox — SoftwareApplication schema |
| `src/pages/icm/index.astro` | Page ICM — SoftwareApplication schema |
| `src/layouts/Layout.astro` | Shell — WebPage schema auto-injecté, détection @graph |
| `src/components/starlight/Head.astro` | BreadcrumbList dynamique sur /guide/* |
| `src/data/rss-entries.ts` | Entrées RSS — éditer manuellement à chaque release |
| `public/robots.txt` | AI bots : GPTBot, PerplexityBot, ClaudeBot, Anthropic-ai autorisés |
| `astro.config.mjs` | Config Astro + Starlight (sidebar, TechArticle schema global) |
| `.github/workflows/deploy.yml` | CI/CD : clone rtk → build → GitHub Pages |

---

## Source de vérité

| Donnée | Source | Ne jamais éditer |
|--------|--------|-----------------|
| Contenu docs | `rtk/docs/guide/**/*.md` | `src/content/docs/guide/` |
| Index search docs | `build-search-index.mjs` | `src/data/docs-search-entries.ts` |
| Anchor map | `prepare-docs.mjs` | `src/data/docs-anchor-map.json` |
| Entrées RSS | `src/data/rss-entries.ts` | `src/pages/rss.xml.ts` |

---

## SEO / GEO

### Schémas JSON-LD en place

| Page | Schémas |
|------|---------|
| `/` | `@graph` : Organization, SoftwareApplication, FAQPage, HowTo, WebPage + SpeakableSpecification |
| `/vox/` | SoftwareApplication + WebPage (via Layout auto-inject) |
| `/icm/` | SoftwareApplication + WebPage (via Layout auto-inject) |
| `/guide/*` | BreadcrumbList dynamique + TechArticle (via Starlight Head override) |

**Règles :**
- `src/pages/index.astro` utilise un objet `@graph` — Layout.astro le détecte et ne duplique pas WebPage
- `/vox/` et `/icm/` passent un objet simple → Layout injecte WebPage automatiquement
- Ne jamais ajouter `@context` dans les objets enfants d'un `@graph`

### FAQ — workflow de mise à jour

La FAQ est dans `faqItems` au début de `src/pages/index.astro`.
Modifier le tableau → le composant HTML ET le FAQPage JSON-LD se mettent à jour automatiquement.

### Images

- **Toutes les illustrations doivent être en WebP** (`public/assets/illustrations/*.webp`)
- Toujours ajouter `width` et `height` sur les balises `<img>` (prévention CLS)
- Les OG images restent en PNG (Twitter/X ne supporte pas WebP pour les cards)
- Conversion : `cwebp -q 85 -preset photo input.jpg -o output.webp`

### robots.txt

Bots IA explicitement autorisés : `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Anthropic-ai`, `Bingbot`, `Google-Extended`.
Ne pas bloquer ces bots — c'est critique pour la visibilité GEO.

---

## Après chaque release RTK

1. Mettre à jour `src/data/rss-entries.ts` — ajouter une entrée en haut :

```ts
{
  type: 'release',           // release | new_page | new_doc | new_feature | performance
  title: 'RTK vX.Y.Z released',
  date: 'Apr 10, 2026',
  description: '1-3 phrases, no HTML',
  link: 'https://www.rtk-ai.app/',
}
```

2. Push → deploy auto.

---

## Nav architecture

| Page | Composant nav |
|------|--------------|
| Landing (`/`) | `src/components/global/SiteHeader.astro` (variant="landing") |
| Produits (`/vox/`, `/icm/`) | `src/components/global/SiteHeader.astro` (variant="product") |
| Docs (`/guide/**`) | `src/components/global/Header.astro` (Starlight override) |

Les anchor links dans SiteHeader.astro utilisent des chemins absolus (`/#problem`, `/#install`) pour fonctionner depuis n'importe quelle page.

---

## Workflow obligatoire avant push sur main

```bash
pnpm build    # Doit passer avec 0 erreur
```

Vérifier : 0 erreurs TypeScript, toutes les pages générées, `/rss.xml` accessible.
