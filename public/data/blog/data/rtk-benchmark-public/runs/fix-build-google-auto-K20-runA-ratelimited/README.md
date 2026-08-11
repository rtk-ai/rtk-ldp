# fix-build-google-auto (K=20, run A)

Paired A/B run, RTK ON vs OFF. Tables below are the output of `compare_pairs.py`; per-trial values in `data/per_trial.csv`.

Note: 10 ON trials errored with `ApiRateLimitError` and recorded $0 cost; they are included in the table means and counted as not passed.

```
======================================================================
RTK ON vs OFF   results/pairs-20260805-142852
======================================================================

QUALITY  (all trials; a timed-out/errored trial = NOT passed)
  arm                    trials  errored  passed  pass-rate  mean-rwd
  OFF (stock)                20        0      20       100%     1.000
  ON  (rtk)                  20       10      10        50%     0.500
  -> pass-rate delta = -50 pp   <-- ON pass rate DROPPED (possible rtk regression)

COST & TOKENS  (MEAN over all trials with a value -- errored included)
  metric              OFF mean     ON mean      Δ%  perm-p  n OFF/ON
  Cost USD               $1.92       $1.10  -42.9%   0.021     20/20
  Input tokens       1,622,148     956,258  -41.0%   0.036     20/20
  Cache tokens       1,570,419     927,896  -40.9%   0.037     20/20
  Output tokens         24,683      13,935  -43.5%   0.021     20/20
  TOTAL spend           $38.38      $21.91  -42.9%

BASH OUTPUT  (mean per trial, from session logs; ~tokens = bytes/4)
  metric                     OFF            ON      Δ%
  bytes                   51,250        27,414  -46.5%
  ~tokens                 12,812         6,853  -46.5%
```
