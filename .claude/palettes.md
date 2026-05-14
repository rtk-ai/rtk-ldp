# RTK Landing — Palette options (Identity Redesign v2)

Évaluées en Phase 0.5 via `/preview`. Switcher interactif A/B/C/D.
Accent vert `#00e599` commun à toutes les options.

---

## Option B — Slate dark

Garde la teinte bleue-navale du site actuel, beaucoup plus sombre.
Continuité visuelle avec l'existant, identité "nuit profonde".

```css
--bg:            #0a0f1c;
--bg-alt:        #0d1322;
--bg-card:       #0f1625;
--bg-card-hover: #141c30;
--bg-elevated:   #1a2540;
--bg-glass:      rgba(10, 15, 28, 0.82);
--border:        #1e2a45;
--border-light:  #243258;
--text:          #e8edf5;
--text-bright:   #f8fafc;
--text-muted:    #94a3b8;
--text-dim:      #64748b;
```

Contraste vérifié sur `#0a0f1c` :
- `--text #e8edf5` → ~14.5:1 AAA
- `--text-muted #94a3b8` → ~6.2:1 AAA
- `--text-dim #64748b` → ~4.6:1 AA ✓

---

## ✅ Option A — Zinc (neutre pur) (RETENUE)

Référence LeanCTX / Linear / Vercel. Sans teinte de couleur.

```css
--bg:            #09090b;
--bg-alt:        #0c0c0e;
--bg-card:       #121215;
--bg-card-hover: #18181b;
--bg-elevated:   #1f1f23;
--bg-glass:      rgba(9, 9, 11, 0.80);
--border:        #1f1f23;
--border-light:  #2a2a2e;
--text:          #f4f4f5;
--text-bright:   #ffffff;
--text-muted:    #a1a1aa;
--text-dim:      #86868e;
```

---

## Option C — GitHub Dark

Palette exacte de GitHub. Familière pour les devs, légère teinte bleu-grise.

```css
--bg:            #0d1117;
--bg-alt:        #10161e;
--bg-card:       #161b22;
--bg-card-hover: #1c2330;
--bg-elevated:   #21262d;
--bg-glass:      rgba(13, 17, 23, 0.82);
--border:        #30363d;
--border-light:  #3d444d;
--text:          #e6edf3;
--text-bright:   #f0f6fc;
--text-muted:    #8b949e;
--text-dim:      #6e7681;
```

---

## Option D — Stone (warm)

Légère teinte warm/brun. Distinctif, mais moins standard dans l'écosystème dev.

```css
--bg:            #0c0a09;
--bg-alt:        #110f0d;
--bg-card:       #1c1917;
--bg-card-hover: #231f1d;
--bg-elevated:   #292524;
--bg-glass:      rgba(12, 10, 9, 0.82);
--border:        #292524;
--border-light:  #3d3734;
--text:          #f5f0ee;
--text-bright:   #fafaf9;
--text-muted:    #a8a29e;
--text-dim:      #78716c;
```