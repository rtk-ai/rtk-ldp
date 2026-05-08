# Baseline — avant refactor UI/UX

**Créé le** : 2026-05-08
**Branch base** : master @ 70adaa3
**Branch refactor** : refactor/ui-ux-overhaul

## État de référence

Screenshots automatiques non disponibles (extension Chrome non connectée).
Rollback : `git revert <merge-commit-hash>` puis push master → redeploy ~3 min.

## Problèmes connus (audit)

- `landing.css` L26-52 : `:root` override écrase `--text-muted` (#64748b, 4.2:1 FAIL) et `--text-dim` (#475569, 2.5:1 FAIL)
- 12+ valeurs littérales px/rem dans landing.css (aucune tokenisation)
- Logo chargé depuis avatars.githubusercontent.com (dépendance externe)
- 3 navs séparés, 2 footers séparés, 0 primitives atomiques

## Rollback test

Commit anodin pour tester le redeploy : `git commit --allow-empty -m "chore: rollback test"` → push → vérifier GitHub Actions.
