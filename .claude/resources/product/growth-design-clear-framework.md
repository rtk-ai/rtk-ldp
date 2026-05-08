# CLEAR Framework - The Psychology of UI Design

> Source: [Growth.Design CLEAR UI](https://growth.design/courses/clear-ui)
> Reference: [LinkedIn article by Sadan Wakeel](https://www.linkedin.com/pulse/psychology-ui-design-beginners-guide-clear-framework-sadan-wakeel-vevsc)
> Date de capture: 2026-03-05

---

## Vue d'ensemble

Le **CLEAR Framework** est un framework de design visuel ancre dans la psychologie cognitive.
Il s'applique a tout type d'interface : dashboards, apps mobiles, landing pages, etc.

L'objectif : rendre n'importe quel ecran "clear" (lisible, utilisable, engageant).

---

## C - Copy

> "Every good design starts with good copywriting."

Le texte est le fondement du design, pas un ajout apres coup.

### Principes

- Le microcopy (boutons, instructions, messages d'erreur) guide l'utilisateur
- Utiliser du vrai contenu des le debut du design, pas du Lorem Ipsum
- Un texte vague ou confus rend l'interface hostile
- Chaque element textuel doit avoir un objectif clair
- Le ton doit correspondre a l'audience (tutoiement pour ados, vouvoiement pour pros)

### Checklist

- [ ] Chaque bouton decrit son action ("Envoyer le document" > "Soumettre")
- [ ] Les messages d'erreur expliquent quoi faire, pas juste ce qui a echoue
- [ ] Les placeholders donnent un exemple concret, pas une description
- [ ] Les labels sont courts et descriptifs
- [ ] Le CTA principal utilise un verbe d'action

### Biais cognitifs lies

- **Framing Effect** : Le choix des mots change la perception
- **Processing Fluency** : Le texte simple est percu comme plus fiable
- **Anchoring** : Le premier texte lu cadre les attentes

---

## L - Layout

> "If your layout is unclear, users feel lost."

La structure compte autant que l'esthetique.

### Principes

- L'alignement, le groupement et l'espacement ameliorent la scannabilite
- Les grilles creent de la previsibilite et de l'equilibre
- La proximite aide a comprendre les relations entre elements
- Un espacement reflechi aide la digestion du contenu
- La hierarchie spatiale guide le parcours de lecture

### Checklist

- [ ] Les elements lies sont groupes visuellement (Law of Proximity)
- [ ] La grille est coherente sur tous les ecrans
- [ ] Le whitespace est utilise intentionnellement (pas juste "du vide")
- [ ] Le parcours de lecture F-pattern ou Z-pattern est respecte
- [ ] Les actions principales sont dans la zone de pouce (mobile)

### Biais cognitifs lies

- **Law of Proximity** : Elements proches = lies mentalement
- **Cognitive Load** : Un layout clair reduit l'effort mental
- **Visual Hierarchy** : Le placement guide l'attention
- **Fitts's Law** : Les cibles importantes sont grandes et proches

---

## E - Emphasis

> "Design is about guiding attention."

La hierarchie visuelle determine ce qui est vu en premier.

### Principes

- Le contraste, la taille, la couleur et le placement dirigent le focus
- Trop d'elements en concurrence diluent l'emphase
- L'emphase doit etre guidee par l'objectif, pas la decoration
- Chaque ecran a UN element principal qui attire l'oeil
- Les elements secondaires supportent sans rivaliser

### Checklist

- [ ] Un seul CTA principal par ecran (pas deux boutons "primaires")
- [ ] Le contraste est suffisant pour guider l'oeil (WCAG AA)
- [ ] Les titres ont une hierarchie visuelle claire (H1 > H2 > H3)
- [ ] Les elements decoratifs ne rivalisent pas avec le contenu
- [ ] Le focus visuel correspond a l'objectif business de l'ecran

### Biais cognitifs lies

- **Von Restorff Effect** : Ce qui est different est retenu
- **Selective Attention** : Les gens ne voient que ce qui ressort
- **Centre-Stage Effect** : Le centre attire l'attention
- **Contrast** : La difference cree la saillance

---

## A - Accessibility

> "Design isn't complete unless it works for everyone."

L'accessibilite est un fondement, pas un supplement.

### Principes

- Le design inclusif couvre les deficiences visuelles, motrices, daltonisme
- Les ratios de contraste et les polices lisibles sont essentiels
- La navigation clavier est non-negociable
- La compatibilite lecteur d'ecran est obligatoire
- Designer pour tous cree de meilleurs produits universellement

### Checklist

- [ ] Contraste texte >= 4.5:1 (normal) et >= 3:1 (large) -- WCAG AA
- [ ] Touch targets >= 44x44px sur mobile
- [ ] Focus visible sur tous les elements interactifs
- [ ] Les images ont des alt-texts descriptifs
- [ ] La navigation clavier est fonctionnelle bout en bout
- [ ] Les couleurs ne sont pas le seul vecteur d'information (icones + texte)
- [ ] `prefers-reduced-motion` est respecte pour les animations

### Biais cognitifs lies

- **Aesthetic-Usability Effect** : Un design beau ET accessible maximise la tolerance
- **Empathy Gap** : Les designers valides sous-estiment les besoins d'accessibilite
- **Tesler's Law** : La complexite cachee cote design apparait cote utilisateur

---

## R - Reward

> "Good design makes people feel good."

Les micro-recompenses creent une connexion emotionnelle.

### Principes

- Les animations subtiles et messages de succes creent du plaisir
- Le feedback interactif encourage la repetition d'usage
- Les moments de recompense transforment la fonctionnalite en experience
- Les petits details influencent significativement le sentiment
- L'engagement emotionnel laisse des impressions durables

### Checklist

- [ ] Chaque action reussie a un feedback positif (toast, animation, checkmark)
- [ ] Les etats de succes sont celebres proportionnellement a l'effort
- [ ] Les micro-animations donnent vie a l'interface (mais respectent prefers-reduced-motion)
- [ ] Les messages de completion sont personnalises quand possible
- [ ] Les surprises positives (delighters) sont presentes sans etre envahissantes

### Biais cognitifs lies

- **Peak-End Rule** : L'experience est jugee par son pic et sa fin
- **Variable Reward** : Les recompenses imprevisibles creent de l'engagement
- **Delighters** : Les surprises positives augmentent la memorisation
- **Spark Effect** : Les animations engageantes creent de l'attachement
- **Zeigarnik Effect** : Le sentiment d'incompletude motive le retour

---

## Application au projet Methode Aristote

### Mapping CLEAR x Aristote

| Lettre                | Application prioritaire Aristote                                                  |
| --------------------- | --------------------------------------------------------------------------------- |
| **C** (Copy)          | Microcopy en francais, tutoiement pour eleves, verbes d'action dans les CTA       |
| **L** (Layout)        | Mobile-first, zone de pouce, navigation par onglets en seance                     |
| **E** (Emphasis)      | Un CTA par ecran, heading jaune (#fff800), badges pour le statut                  |
| **A** (Accessibility) | WCAG AA, touch 44px, contraste tokens semantiques, `prefers-reduced-motion`       |
| **R** (Reward)        | Feedback post-action (toasts), progression visible, celebrations de fin de seance |

### Utilisation en audit

Pour auditer un ecran ou un flow avec le CLEAR framework :

```
Pour chaque ecran, evaluer :

C - Le texte est-il clair, actionnable, adapte a l'audience ?
L - Le layout guide-t-il le parcours de lecture et d'action ?
E - L'element le plus important est-il le plus visible ?
A - Contraste, touch targets, keyboard nav, screen reader ?
R - L'utilisateur recoit-il un feedback positif apres chaque action ?
```

---

## Licence

Ce document est un resume de reference du [CLEAR Framework par Growth.Design](https://growth.design/courses/clear-ui).
Pour le cours complet avec exemples interactifs, exercices et certificat, visiter le site source.
