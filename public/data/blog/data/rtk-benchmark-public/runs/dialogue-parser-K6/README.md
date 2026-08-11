# dialogue-parser (K=6)

Paired A/B run, RTK ON vs OFF. Tables below are the output of `compare_pairs.py`; per-trial values in `data/per_trial.csv`.

```
======================================================================
RTK ON vs OFF   results/sweep-20260806-191959/dialogue-parser
======================================================================

QUALITY  (all trials; a timed-out/errored trial = NOT passed)
  arm                    trials  errored  passed  pass-rate  mean-rwd
  OFF (stock)                 6        0       2        33%     0.806
  ON  (rtk)                   6        1       1        17%     0.667
  -> pass-rate delta = -17 pp   <-- ON pass rate DROPPED (possible rtk regression)

COST & TOKENS  (MEAN over all trials with a value -- errored included)
  metric              OFF mean     ON mean      Δ%  perm-p  n OFF/ON
  Cost USD               $0.37       $0.30  -17.6%   0.158       6/5
  Input tokens         170,999     174,589   +2.1%   0.680       6/5
  Cache tokens         157,057     168,158   +7.1%   0.447       6/5
  Output tokens          6,081       6,254   +2.8%   0.686       6/5
  TOTAL spend            $2.22       $1.52  -31.4%

BASH OUTPUT  (mean per trial, from session logs; ~tokens = bytes/4)
  metric                     OFF            ON      Δ%
  bytes                    1,252         1,665  +33.1%
  ~tokens                    313           416  +33.1%
```
