# fix-build-google-auto (K=6, run 4)

Paired A/B run, RTK ON vs OFF. Tables below are the output of `compare_pairs.py`; per-trial values in `data/per_trial.csv`.

```
======================================================================
RTK ON vs OFF   results/sweep-20260807-072640/fix-build-google-auto
======================================================================

QUALITY  (all trials; a timed-out/errored trial = NOT passed)
  arm                    trials  errored  passed  pass-rate  mean-rwd
  OFF (stock)                 6        1       5        83%     0.833
  ON  (rtk)                   6        1       5        83%     0.833
  -> pass-rate delta = +0 pp

COST & TOKENS  (MEAN over all trials with a value -- errored included)
  metric              OFF mean     ON mean      Δ%  perm-p  n OFF/ON
  Cost USD               $2.36       $2.50   +6.0%   0.888       5/5
  Input tokens       2,077,124   2,293,686  +10.4%   0.826       5/5
  Cache tokens       2,019,397   2,231,392  +10.5%   0.818       5/5
  Output tokens         30,918      30,493   -1.4%   0.983       5/5
  TOTAL spend           $11.80      $12.50   +6.0%

BASH OUTPUT  (mean per trial, from session logs; ~tokens = bytes/4)
  metric                     OFF            ON      Δ%
  bytes                   50,378        64,822  +28.7%
  ~tokens                 12,594        16,206  +28.7%
```
