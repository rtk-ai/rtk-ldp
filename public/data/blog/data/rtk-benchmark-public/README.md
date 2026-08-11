# RTK ON-vs-OFF benchmark data (SkillsBench / Harbor)

Paired A/B measurements of Claude Code with RTK enabled (ON) vs stock (OFF) on SkillsBench tasks. This dataset contains measurements only: task names, arms, per-trial cost, reward, error type, and token counts. No session transcripts, no command strings, no credentials, no host paths.

## Contents

- `runs/` — single-task paired runs. Each folder: `README.md` (comparative tables) + `data/per_trial.csv` + `data/compare_pairs.txt`
- `sweeps/` — multi-task sweeps. Each folder: `README.md` + per-trial and aggregate data files
- `scripts/` — the analysis tools used to compute the statistics. Pure Python, stdlib only, no network

## Runs — headline rows (from each run's `compare_pairs.txt`)

| run | trials/arm | errored OFF/ON | pass OFF/ON | cost OFF | cost ON | Δcost | perm-p | n OFF/ON |
|---|---|---|---|---|---|---|---|---|
| fix-build-google-auto-K6 | 6 | 1 / 1 | 83% / 83% | $1.92 | $2.40 | +25.0% | 0.399 | 5/5 |
| fix-build-google-auto-K20-runA-ratelimited¹ | 20 | 0 / 10 | 100% / 50% | $1.92 | $1.10 | −42.9% | 0.021 | 20/20 |
| fix-build-google-auto-K20-runB | 20 | 1 / 1 | 85% / 95% | $1.84 | $1.55 | −15.6% | 0.411 | 19/19 |
| fix-build-google-auto-K6-run4 | 6 | 1 / 1 | 83% / 83% | $2.36 | $2.50 | +6.0% | 0.888 | 5/5 |
| dialogue-parser-K6 | 6 | 0 / 1 | 33% / 17% | $0.37 | $0.30 | −17.6% | 0.158 | 6/5 |

¹ 10 ON trials errored with `ApiRateLimitError` and recorded $0 cost; they are included in the table means and counted as not passed.

## Sweeps

| sweep | tasks | K | trials | pooled Δcost | perm-p |
|---|---|---|---|---|---|
| 20260807-K6-3tasks | 3 | 6 | 32 clean | −3.2% | 0.801 |
| 20260810-13task-K4 (RTK v0.45.0) | 13 (12 balanced²) | 4 | 104 | −4.8% | 0.305 |

² `data-to-d3` excluded from cost aggregates: verifier returned `RewardFileNotFoundError` and its arms are imbalanced (3 OFF / 4 ON).

The 13-task sweep also ships `transcript_stats.csv` (per-trial counts derived from transcripts, numbers only: tool calls, bash calls, rtk rewrite markers, bash output bytes) and `rtk-compression-measured.txt` (per-command-family compression measurements).

## Reproduce

The scripts read the CSVs in this dataset:

```
python3 scripts/cost_pooled.py      # pooled normalized delta + permutation test
python3 scripts/compare_pairs.py    # per-task arm comparison
python3 scripts/compare_sweep.py    # cross-task median + sign-flip test
python3 scripts/worst_pair_audit.py # per-task cost-driver breakdown
```

See each script's header for input arguments.
