# Recherche Mobbin — Patterns UI/UX pour RTK landing

**Date** : 2026-05-14
**Périmètre** : Landing rtk-ai.app (/, section Hero, Install, Demo)
**Source** : Mobbin via MCP `mcp__mobbin__search_screens` (mode fast, platform web)
**Scope OUT** : Social proof, comparisons, docs UX, changelog, sub-product Vox/ICM (voir sessions 2-3)

## Limites Mobbin observées

Mobbin couvre bien les **SaaS developer tools web** (Resend, Neon, Modal, AWS) mais pas les landing pages CLI pur (Bun, Warp, Homebrew). Les patterns de terminal asciinema n'apparaissent pas. Les résultats sont utiles mais restent dans le registre "API platform" plutôt que "CLI proxy". Pour chaque thème, 3-5 screens sur 8 étaient pertinents.

---

## Thème 1 — Hero CLI / dev tool landing

**Queries** : `"developer tool landing hero CLI install"` — 5 résultats utiles / 8

### Top 3 screens (design engineer pass)

**Resend** — [mobbin.com/screens/72bd36ac...](https://mobbin.com/screens/72bd36ac-0d76-4f93-b5a2-1a73afb92d92)
Fond noir (#0a0a0a), typographie serif display très grande ("Email for developers"), texte gauche-aligné, visuel 3D droit (cube géométrique animé). Nav plate avec 7 items + 2 CTAs à droite (filled "Get Started" + ghost "Documentation"). Décision UX clé : le lien vers la doc est en ghost CTA au même niveau que le CTA commercial, ce qui réduit la friction pour les devs qui veulent explorer avant d'acheter.

**AutoSend** — [mobbin.com/screens/1f4da970...](https://mobbin.com/screens/1f4da970-2f42-4d98-95fd-684378cfc617)
Layout left-text / right-illustration, headline "Email for Developers, Marketers, & AI Agents", sous-headline 1 ligne, 2 CTAs (SIGN UP rempli + TALK TO FOUNDERS ghost). En dessous du fold : compteur live temps-réel ("795,110 emails sent in the last 7 days") + logo strip clients. La métrique live est un signal de preuve très dense en un seul chiffre — évite la liste de features.

**Vapi** — [mobbin.com/screens/c960e4d4...](https://mobbin.com/screens/c960e4d4-12cc-4211-ac97-83136a5c152f)
"Voice AI agents for developers", headline centré, fond noir, animation equalizer sonore en arrière-plan (représente visuellement ce que fait le produit). Bouton central "TALK TO VAPI" = CTA qui EST la démo. Logo strip clients sous le fold. Le background animé remplace le screenshot produit — zéro bruit, tout dit en 4 mots + animation.

### Patterns actionnables pour RTK

1. **Ghost CTA "Docs" au même niveau que le CTA commercial**
   Le hero RTK a actuellement le bouton principal (install) sans lien docs équivalent. Ajouter un ghost CTA "Read the docs" ou "See the guide" aligné avec le CTA principal réduit la friction des devs qui préfèrent lire avant d'agir.
   Référence : `src/pages/index.astro` section Hero (CTA block)
   Effort : XS

2. **Métrique live comme seul proof-point au-dessus de la section preuve**
   Au lieu d'attendre la section Proof, mettre une métrique chiffrée sous le hero immédiat : "X tokens saved today" ou "X% reduction mesurée sur cargo test". Un seul chiffre, en variant (--text-muted), en dessous des CTAs.
   Référence : `src/pages/index.astro` juste sous le hero, avant la section Problem
   Effort : S (nécessite décision sur quelle métrique afficher)

3. **Animation de fond qui REPRÉSENTE la valeur (pas juste décore)**
   RTK compresse des outputs. L'animation de fond pourrait montrer du texte/tokens qui "disparaissent" ou "se condensent" — plutôt qu'une illustration décorative. Coût : CSS ou canvas léger.
   Référence : `src/pages/index.astro` section Hero, `src/styles/landing.css`
   Effort : M (conception + implémentation CSS/canvas)

### Patterns à éviter

- **Illustration 3D générique côté droit** : les cubes et sphères 3D (Resend, Google AI Studio) sont indifférenciés sur le segment dev tools en 2026. Si RTK n'a pas d'asset visuel fort, mieux vaut du texte/terminal pur qu'un asset 3D banal.
- **Headline "for developers" générique** : "Email for developers", "Voice AI for developers" — le segment dev tools est saturé de ce pattern. RTK doit ancrer immédiatement sur la valeur mesurée : -60-90% tokens, pas "for developers".

### Questions ouvertes
- La métrique "tokens saved" est-elle mesurable en temps réel ou seulement comme benchmark ? Si pas de données live, quelle métrique fixe utiliser (nb downloads, nb cmds exécutées avec rtk gain)?

---

## Thème 2 — Install / copy-paste blocks

**Queries** : `"install command code block copy button developer"` — 5 résultats utiles / 8

### Top 3 screens (design engineer pass)

**Neon** — [mobbin.com/screens/94fb6fc0...](https://mobbin.com/screens/94fb6fc0-0fb0-4358-b6da-534a1f5addb9)
Quickstart multi-étapes dans un panel modal. Étape "Start your app" montre 4 tabs (npm / yarn / bun / **pnpm** actif + soulignement) avec le code dans le bloc en dessous et une icône copy à droite de la commande. Fond de bloc : légèrement grisé (#f5f5f5). La tab active est soulignée, pas en filled-pill. Décision UX clé : les package manager tabs sont un composant discret (juste des textes + underline), pas des boutons — réduction maximale du bruit visuel autour de la commande.

**Modal** — [mobbin.com/screens/1052aa52...](https://mobbin.com/screens/1052aa52-940d-4600-b211-d2bac1cdf7fa)
Onboarding "Create your first app" avec accordion numéroté (1, 2). Étape 1 dépliée montre un bloc terminal dark (`#1a1a1a`) avec 2 commandes préfixées `$` en vert clair + fond sombre. La commande suit naturellement la prose d'explication. Décision UX : numéroter les étapes + accordions déroule la complexité sans l'afficher d'un coup — anti-anxiété pour un premier contact.

**Apollo** — [mobbin.com/screens/50326c28...](https://mobbin.com/screens/50326c28-ee66-41be-baf7-69b3417f38eb)
"Add the Apollo code snippet" : grand bloc code fond blanc + bordure légère, bouton **Copy** texte simple en bas à droite du bloc. Section "How to install?" en accordéon juste dessous avec 5 étapes numérotées en prose. Le Copy button est placé DANS le bloc, pas flottant — il appartient au bloc visuellement.

### Patterns actionnables pour RTK

1. **Package manager tabs (brew / cargo / npm) avec underline actif, pas boutons**
   RTK a 3 méthodes d'install. Le pattern Neon (tabs texte + underline actif) est plus élégant que des pills-buttons. Le bloc de commande change selon la tab active (JS simple, pas de lib). Copy icon à droite de chaque commande.
   Référence : `src/pages/index.astro` section Install, `src/styles/landing.css`
   Effort : S

2. **Bloc terminal dark avec préfixe `$` en couleur accent**
   Le fond du bloc install doit être sombre (`var(--bg-card)` minimum, idéalement plus sombre type `#0a0f1e`) avec le `$` en `var(--accent)` (#00e599) et la commande en `var(--text)`. Distingue clairement ce qui est à taper de ce qui est output.
   Référence : `src/pages/index.astro` section Install, `src/styles/global.css` tokens déjà en place
   Effort : XS

3. **Copy button natif dans le bloc (pas flottant)**
   Positionner l'icône copy comme élément du bloc (padding-right du bloc), pas en position:absolute flottant. Sur hover du bloc, copy apparaît. Au click : icône switch vers ✓ pendant 1.5s, puis retour. Pas de toast "Copied!" — le changement d'icône suffit.
   Référence : `src/pages/index.astro`, `src/styles/landing.css`
   Effort : S

### Patterns à éviter

- **Bloc code trop large avec du code applicatif** (Apollo) : RTK affiche 1 commande, pas 40 lignes de JavaScript. Ne pas grossir le bloc pour "faire professionnel" — la concision EST le produit.
- **Tabs en pills/filled-buttons** : crée du bruit autour de la commande principale. L'eye-tracking va sur les boutons, pas sur la commande.

### Questions ouvertes
- Afficher 1 seule tab par défaut (brew sur macOS) avec détection UA ? Ou toujours montrer les 3 tabs sans détection ?
- Le hook CI (GitHub Actions) mérite-t-il sa propre tab ou une section séparée dans la doc ?

---

## Thème 3 — Terminal demos web

**Queries** : `"terminal animation demo developer tool landing"` — 4 résultats utiles / 8
**Limites observées** : Aucun résultat montrant un vrai terminal asciinema ou CLI animated capture. Mobbin couvre des demos interactifs produit, pas des replays de sessions shell.

### Top 3 screens (design engineer pass)

**AWS Lambda** — [mobbin.com/screens/ccc2e1c7...](https://mobbin.com/screens/ccc2e1c7-2a2c-430d-8a72-d9085e2f1646)
Section "How it works" avec tabs runtime (.NET / Java / **Node.js** actif / Python / Ruby / Custom). Bloc code statique en dessous avec numéros de ligne. Bouton "Run" en accent orange + "Next: Lambda responds to events" enchaîné. Décision UX : la démo n'est pas dans le hero — elle est dans une section dédiée plus bas. Le hero vend, la section "How it works" prouve. Séparation claire des rôles.

**ElevenLabs** — [mobbin.com/screens/1a733d7d...](https://mobbin.com/screens/1a733d7d-6f0c-4671-9570-90220cff2c82)
Produit-dans-le-hero : interface voix interactive directement dans la landing (text input + liste de voix + bouton Play). Le produit EST la démo, instantanément. Tabs produits en haut (ElevenCreative / ElevenAgents) + context "Text to Speech" en haut à droite. Décision UX audacieuse : zéro friction pour tester, mais nécessite un produit qui fonctionne côté serveur live.

**Codecademy** — [mobbin.com/screens/01dbfb5f...](https://mobbin.com/screens/01dbfb5f-536a-4770-b9d7-2f752d10913b)
Split-pane éditeur : code à gauche (dark, syntaxe colorée, tabs fichiers) + preview navigateur à droite. Bouton "Save + Run" en accent jaune, centré en bas. Pattern classique learn-by-doing : le code ET son résultat visible simultanément. Adapté à l'apprentissage, pas directement à une landing CLI.

### Patterns actionnables pour RTK

1. **Section "How it works" avec mode tabs (avant/après ou par commande type)**
   Plutôt qu'une animation terminal full-auto, créer une section "Before / After RTK" avec 2 panels statiques : gauche = `cargo test` raw output (200 lignes), droite = `rtk cargo test` output condensé (5 lignes). Tabs par type de commande (git / cargo / gh). Click sur un tab remplace les deux panels. Zéro animation requise, impact maximal sur la valeur perçue.
   Référence : `src/pages/index.astro` section Demo, `src/styles/landing.css`
   Effort : S/M

2. **Séparation hero (vend) / section demo (prouve)**
   AWS Lambda le fait bien : le hero est une accroche value prop, la démo est 2 sections plus bas. RTK a tendance à vouloir tout montrer above the fold. Laisser la section Demo en dessous de la section Problem (pas dans le hero) allège le hero et donne à la démo l'espace pour respirer.
   Référence : `src/pages/index.astro` (ordre des sections)
   Effort : XS (réorganisation, pas code)

3. **Animation CSS lightweight "token counter" plutôt que terminal replay**
   Un compteur de tokens qui diminue (ex: 15,000 → 1,200) avec une transition CSS `counter()` ou `countUp.js` est plus léger, plus lisible, et plus percutant qu'un replay de session shell. L'animation dure 2s, se rejoue au scroll-into-view. Poids < 2KB.
   Référence : `src/pages/index.astro` section Demo ou Hero, `src/styles/landing.css`
   Effort : S

### Patterns à éviter

- **Produit-dans-le-hero style ElevenLabs** : nécessite un backend live capable d'exécuter RTK. Risque de latence, de coût serveur, et de fallback horrible si ça freeze. Pour une CLI tool, le risque dépasse le bénéfice.
- **Terminal replay GIF autoplay** : les GIFs >200KB ralentissent LCP (Core Web Vitals). Si on utilise un replay, c'est une vidéo `<video autoplay muted loop>` < 500KB WebP/H264, pas un GIF.
- **Split-pane éditeur interactif** (Codecademy) : sur-engineering pour une landing page d'un outil CLI. La valeur RTK est dans la réduction d'output, pas dans l'édition de code.

### Questions ouvertes
- La section Demo actuelle utilise-t-elle déjà un GIF ou une vidéo ? Vérifier le poids dans `public/assets/` avant de choisir la technique.
- Le "before/after" est-il reproductible automatiquement à chaque release (extrait du vrai output RTK) ou manuel ?

---

## Session 2 : Social proof, Comparaisons, Changelog

---

## Thème 4 — Social proof / community trust

**Queries** : `"github stars badge developer tool homepage"` (2 résultats pertinents / 8, réinterprétés OAuth) puis `"developer testimonial community size trust landing page"` (4 résultats pertinents / 8)
**Limites observées** : Le terme "github" déclenche majoritairement des résultats d'intégration GitHub OAuth (Clay, Fibery, Felt) au lieu de badges social proof sur landing pages. Mobbin insuffisant pour ce thème, 2 reformulations épuisées.

### Références Session 1 applicables

Chatbase (logo strip + compteur "2M+ chatbots"), Vapi (strip désaturé sous CTA), et Resend ("Join 200,000+ developers" dans le sous-headline) sont déjà analysés en Thème 1. Les 3 patterns s'appliquent à la preuve sociale RTK.

### Patterns actionnables pour RTK

1. **Compteur de downloads build-time sous les CTAs hero**
   Cargo.io et Homebrew exposent des chiffres en build-time. Format : "Used by X developers" en `var(--text-muted)`. Sous 1000 downloads, afficher "Early adopters" plutôt qu'un chiffre. Valeur statique au build, pas de requête HTTP en runtime.
   Référence : `src/pages/index.astro` section Hero (sous le CTA block)
   Effort : S

2. **Logo strip désaturé si noms connus disponibles**
   4-6 avatars GitHub de devs connus, désaturés. Si les utilisateurs connus sont absents, sauter ce pattern (un strip d'inconnus détruit la crédibilité).
   Référence : `src/pages/index.astro` section Proof
   Effort : XS (si noms connus disponibles)

### Patterns à éviter

- **Badge shield.io GitHub stars** : requête externe non cachée, LCP impact. Si on affiche les stars, valeur statique build-time.
- **Citations longues avec avatars** : RTK n'a pas encore de corpus de testimonials suffisant pour ce pattern.

---

## Thème 5 — Comparison tables / before-after

**Queries** : `"before after comparison table developer tool landing"` (4 résultats pertinents / 8)
**Limites observées** : Résultats majoritairement tables de pricing ou diff viewers internes. Tables "avant/après ROI" peu représentées dans Mobbin.

### Top 3 screens (design engineer pass)

**Google Workspace** — "CURRENT EDITION / SWITCH TO" : 2 colonnes côte à côte. Colonne gauche fond neutre, colonne droite fond légèrement accentué avec outline coloré. Chaque ligne = une feature, check ou cross. L'asymétrie visuelle guide le regard sans caption explicatif. Applicable directement pour "Sans RTK / Avec RTK".

**Neon** — "Compare plans" avec lignes alternées légèrement teintées. Features différenciatrices en gras, identiques en check simple. Réduit la charge cognitive en mettant en évidence uniquement ce qui change.

**Linear** — 2 panels "before / after" côte à côte + flèche centrale. La direction temporelle est imposée visuellement sans caption.

### Patterns actionnables pour RTK

1. **Panel "Sans RTK / Avec RTK" à 2 colonnes, fond asymétrique**
   Gauche : `cargo test` raw output (200 lignes, scrollable, texte en `var(--text-dim)`). Droite : `rtk cargo test` (5 lignes, texte en `var(--text)`, bordure `1px solid var(--accent)`). Label "Avant / Après" en `var(--text-muted)` au-dessus de chaque panel.
   Référence : `src/pages/index.astro` section Demo, `src/styles/landing.css`
   Effort : S

2. **Badge de réduction en overlay sur le panel droit**
   "-90% tokens" en badge centré sur la bordure haute du panel droit, fond `var(--bg-card)`, texte `var(--accent)`. Zéro prose requise pour expliquer la valeur, le chiffre se lit seul.
   Référence : `src/pages/index.astro` section Demo
   Effort : XS

### Patterns à éviter

- **Feature table RTK vs commandes brutes** : RTK n'a pas de tiers de fonctionnalités. L'output réduit est le seul différenciateur réel, le before/after le montre mieux qu'un tableau.

---

## Thème 7 — Changelog / release notes UX

**Queries** : `"changelog release notes developer tool product updates"` (4 résultats pertinents / 8)
**Limites observées** : 4/8 résultats étaient des UIs de version history pour restauration de documents (Manus, WRITER, Substack), pas des changelogs publics. Pattern sous-représenté dans Mobbin.

### Top 3 screens (design engineer pass)

**GitBook** — Page "Changelog" dans la nav docs. Heading "Changelog", sous-titre "New updates and improvements", bouton "RSS feed" visible en haut à droite (pas enfoui dans les settings). Entrées par date, chaque entrée avec sous-titre de type ("Product feature") et CTA "Read the documentation". Le changelog est une page ordinaire de la doc, navigable comme toutes les autres. Pour RTK, c'est le pattern le plus proche de `rss-entries.ts` + Starlight.

**Suno** — Modal "What's New?" avec badges de type colorés ("New Feature"), date, description courte, lien "Learn more". Le format badge type + date + description + lien est réutilisable dans une page `/changelog` statique même si le modal in-app ne s'applique pas à une CLI.

### Patterns actionnables pour RTK

1. **Page `/changelog` dans Starlight avec bouton RSS visible**
   RTK a déjà `src/data/rss-entries.ts` qui alimente `/rss.xml`. Ce qui manque est une page lisible par un humain. Créer une page Starlight qui liste les entrées avec format : date | badge-type | description | lien, avec un lien "RSS feed" visible en haut (href vers `/rss.xml`).
   Référence : `src/data/rss-entries.ts`, `astro.config.mjs` (sidebar Starlight), `src/content/docs/`
   Effort : S/M

2. **Badges de type colorés dans les entrées changelog**
   `release` en `var(--accent)`, `new_feature` en `var(--cyan)`, `performance` en `var(--violet)`. Cohérent avec les tokens produits existants. Rend le scanning rapide sans lire chaque description.
   Référence : `src/data/rss-entries.ts` (champ `type`), `src/styles/global.css`
   Effort : XS

### Patterns à éviter

- **Modal "What's New?" in-app** : RTK est un CLI, aucune surface in-app pour ce type de notification.
- **Version history UI** (Manus, WRITER, Lovable) : restauration de documents, pas un changelog public produit.

---

## Synthèse : 12 patterns P1 (Sessions 1 et 2)

### Session 1 : Hero, Install, Demo

| # | Pattern | Section | Effort | Impact |
|---|---------|---------|--------|--------|
| 1 | Ghost CTA "Docs" aligné avec le CTA principal | Hero | XS | Réduit friction dev |
| 2 | Bloc terminal dark, $ en --accent, copy in-bloc | Install | XS | Clarté + confiance |
| 3 | Package manager tabs (brew/cargo/npm) underline style | Install | S | Réduit confusion install |
| 4 | Before/after output panels + mode tabs | Demo | S/M | Prouve la valeur immédiatement |
| 5 | Séparation hero (vend) / demo (prouve) — ordre sections | Structure | XS | Allège le hero |
| 6 | Compteur token animé CSS au scroll | Demo ou Hero | S | Impact visuel fort, poids nul |

### Session 2 : Social proof, Comparaisons, Changelog

| # | Pattern | Section | Effort | Impact |
|---|---------|---------|--------|--------|
| 7 | Compteur downloads build-time sous les CTAs hero | Hero | S | Preuve sociale sans requête externe |
| 8 | Logo strip désaturé si devs connus disponibles | Hero/Proof | XS | Crédibilité sans bruit visuel |
| 9 | Panel before/after 2 colonnes fond asymétrique + tabs | Demo | S | Valeur mesurée visuellement évidente |
| 10 | Badge "-90% tokens" overlay panel droit | Demo | XS | Chiffre sans prose |
| 11 | Page /changelog Starlight avec lien RSS exposé | Docs | S/M | Distribution et rétention utilisateurs |
| 12 | Badges type colorés (release/feature/perf) dans changelog | Changelog | XS | Scanning rapide de l'historique |

---

## Références complémentaires (liste plate)

- Resend hero: https://mobbin.com/screens/72bd36ac-0d76-4f93-b5a2-1a73afb92d92 — dark hero for devs, ghost docs CTA
- Google AI Studio code panel: https://mobbin.com/screens/7bdd4070-16aa-4056-bf9e-11add8bd2e35 — language selector + copy UX
- Felt API tokens: https://mobbin.com/screens/f32e50c7-20dd-4feb-bfed-21d748a991b3 — copy-token modal pattern
- Vapi hero: https://mobbin.com/screens/c960e4d4-12cc-4211-ac97-83136a5c152f — animation background = product value
- Chatbase hero: https://mobbin.com/screens/a4425cb6-c493-43b8-aa1a-14898a35ccaf — logo strip + animated product preview
- Savee multi-install: https://mobbin.com/screens/a4425cb6-c493-43b8-aa1a-14898a35ccaf — 4 platform buttons in a row
