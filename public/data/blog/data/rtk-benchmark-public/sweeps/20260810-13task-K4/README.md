# 13 SkillsBench SE tasks, K=4 — RTK v0.45.0

**Run:** `results/sweep-20260810-192020` · 13 software-engineering tasks · K=4 per arm ·
model `claude-opus-4-8` · 104 trials.

## What was run
- **RTK source:** pinned release **v0.45.0** from `rtk-ai/rtk`, downloaded and
  checksum-verified in each pod. Prehook only (`rtk hook claude` on Bash matcher);
  PostToolUse hook disabled.
- **Arms:** OFF = stock `claude-code`. ON = `rtk_claude_code:RtkClaudeCode`.
- **Tasks:** 13 of the 16 non-excluded SkillsBench `software-engineering` tasks.
  Not included: `fix-build-agentops` (verifier runs a tox py37–312 matrix the image
  lacks), `flink-query` and `tictoc-unnecessary-abort-detection` (build contexts
  1.8 MB / 8 MB, over the in-cluster DinD ConfigMap limit).
- **Cluster:** AKS, one schedulable userpool node, N=5, retries=2.
- **RTK activation:** hook registered in the ON `settings.json`; 154 `rtk`-rewritten
  commands recorded across the ON transcripts.

## Per-task cost (mean over trials) and quality (mean reward)

| task | OFF $ | ON $ | Δcost | OFF q | ON q | off n | on n |
|---|---|---|---|---|---|---|---|
| azure-bgp-oscillation-route-leak | 0.49 | 0.54 | +11% | 0.00 | 0.00 | 4 | 4 |
| debug-trl-grpo | 0.60 | 0.63 | +6% | 0.42 | 0.25 | 4 | 4 |
| dialogue-parser | 0.37 | 0.32 | −12% | 0.75 | 0.79 | 4 | 4 |
| fix-build-google-auto | 2.11 | 1.91 | −10% | 1.00 | 1.00 | 4 | 4 |
| fix-visual-stability | 1.92 | 2.19 | +14% | 0.75 | 1.00 | 4 | 4 |
| jax-computing-basics | 0.28 | 0.27 | −5% | 1.00 | 1.00 | 4 | 4 |
| llm-prefix-cache-replay | 0.63 | 0.68 | +7% | 0.00 | 0.00 | 4 | 4 |
| parallel-tfidf-search | 1.37 | 0.92 | −32% | 1.00 | 1.00 | 4 | 4 |
| python-scala-translation | 1.22 | 1.01 | −17% | 0.00 | 0.00 | 4 | 4 |
| react-performance-debugging | 1.22 | 0.97 | −21% | 0.50 | 0.00 | 4 | 4 |
| simpo-code-reproduction | 0.98 | 1.04 | +7% | 0.00 | 0.00 | 4 | 4 |
| spring-boot-jakarta-migration | 0.91 | 0.86 | −5% | n/a | n/a | 4 | 4 |
| data-to-d3 | 2.04 | 1.18 | −42% | n/a | n/a | 3 | 4 |

- `data-to-d3`: verifier returned `RewardFileNotFoundError`; OFF has 3 cost trials vs
  ON 4 (imbalanced). Excluded from the cost aggregates below.
- `spring-boot`: verifier returned `RewardFileNotFoundError` (no reward); 4 vs 4 cost
  trials, kept in cost aggregates.

## Cost aggregates (12 balanced tasks, data-to-d3 excluded)
```
per-task delta:   median −4.8%   mean −4.8%
pooled normalized (all trials, permutation test):  −4.8%   p = 0.305
compare_sweep.py (per-task median + sign-flip):     −2.9%   p = 0.078
direction:  7 tasks cheaper under ON / 5 costlier
```

## Quality (gradeable tasks, mean reward)
```
ON higher: 1 (fix-visual-stability 0.75 -> 1.00)
ON lower:  2 (debug-trl-grpo 0.42 -> 0.25 ; react 0.50 -> 0.00)
tied:      8
unscorable (verifier error): 2 (data-to-d3, spring-boot)
```

## Steps and RTK rewrites on the three largest cost deltas
| task | Δcost | OFF steps | ON steps | ON `rtk` marks | ON bash output |
|---|---|---|---|---|---|
| parallel-tfidf-search | −32% | 16 | 10 | 0 | ~1 KB |
| react-performance-debugging | −21% | 36 | 30 | 0 | ~5 KB |
| python-scala-translation | −17% | 7 | 6 | 0 | ~1 KB |

## Measured RTK compression (ON arm, 154 rewrites, 48 trials)
| family | calls | compressed | est. raw | saved |
|---|---|---|---|---|
| grep | 63 | 69.5 KB | 103.8 KB | 34.2 KB |
| find | 82 | 61.3 KB | 87.6 KB | 26.3 KB |
| ls | 53 | 29.9 KB | 53.3 KB | 23.5 KB |
| tree | 11 | 12.8 KB | 21.3 KB | 8.5 KB |
| git | 18 | 15.6 KB | 21.7 KB | 6.1 KB |
| cat | 53 | 77.9 KB | 77.9 KB | 0 (not wrapped) |
| **total** | | **267 KB** | **366 KB** | **~99 KB ≈ 25,000 tokens** |

- ON arm total input tokens: 30,231,432 across 48 trials.
- Saved / total input (naive): 0.08%.
- "Est. raw" uses live-measured compression ratios (git −28%, grep −33%, ls −44%,
  find −30%); it is an estimate, not an exact reconstruction.

## Data (`data/`)
- `per_trial.csv` — 104 trials: task, arm, cost, reward, error, input/output tokens
- `cost_fair_pooled.txt` — the 12-task pooled permutation output
- `compare_sweep.txt` — per-task median / sign-flip output
- `rtk-compression-measured.txt` — the 154-rewrite table + step/mark counts

Reproduce: `python3 cost_pooled.py results/sweep-20260810-192020`
