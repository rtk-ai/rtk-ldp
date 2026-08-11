#!/usr/bin/env python3
"""Honest pooled cost comparison for a sweep (RTK ON vs OFF).

    python3 cost_pooled.py results/sweep-<stamp>

Cost is the question, so reward is ignored -- we keep every trial that produced a
cost and drop only errored trials (RuntimeError / ApiRateLimitError etc., which
have no cost). Each trial's cost is normalized by its task's OFF mean so tasks of
different price scales are comparable, then all trials are pooled into ONE
permutation test.

Why not per-task medians (compare_sweep.py)? On small skewed samples the median
flips sign vs the mean (a right-skewed arm shows a cheap median but expensive
mean), so median-of-medians can report -15% while the pooled/mean view is ~0.
Pooling all trials and normalizing avoids letting one middle trial set the
headline. Prints mean, median, and pooled-normalized with a permutation p-value.
"""
from __future__ import annotations
import glob
import json
import os
import random
import statistics as st
import sys


def _task_dirs(root):
    return [d for d in sorted(glob.glob(os.path.join(root, "*")))
            if os.path.isdir(os.path.join(d, "off")) and os.path.isdir(os.path.join(d, "on"))]


def _costs(task_dir, arm):
    """Clean costs for an arm: has cost_usd, no fatal exception."""
    out = []
    for rj in glob.glob(f"{task_dir}/{arm}/*/*/result.json"):
        try:
            d = json.load(open(rj))
        except Exception:
            continue
        exc = d.get("exception_info")
        if isinstance(exc, dict) and exc.get("exception_type"):
            continue
        c = (d.get("agent_result") or {}).get("cost_usd")
        if c is not None:
            out.append(c)
    return out


def _perm_p(off, on, iters=50000, seed=42):
    obs = abs(st.mean(on) - st.mean(off))
    pool = off + on
    nO = len(off)
    rng = random.Random(seed)
    hits = 0
    for _ in range(iters):
        rng.shuffle(pool)
        if abs(st.mean(pool[nO:]) - st.mean(pool[:nO])) >= obs - 1e-12:
            hits += 1
    return hits / iters


def main(root: str) -> int:
    tasks = _task_dirs(root)
    if not tasks:
        print(f"no task subdirs with off/ and on/ under {root}", file=sys.stderr)
        return 1

    print("=" * 72)
    print(f"POOLED COST (RTK ON vs OFF, reward-agnostic)   {root}")
    print("=" * 72)
    print(f"\n{'task':<30}{'OFF n':>6}{'ON n':>6}{'OFF mean':>10}{'ON mean':>9}{'Δmean':>8}{'Δmed':>7}")

    off_norm, on_norm = [], []
    tot_o = tot_n = 0
    dmean, dmed = [], []
    for td in tasks:
        o, n = _costs(td, "off"), _costs(td, "on")
        if not o or not n:
            print(f"  {os.path.basename(td):<28}{len(o):>6}{len(n):>6}   (skipped: an arm has no clean cost)")
            continue
        tot_o += len(o); tot_n += len(n)
        om, nm = st.mean(o), st.mean(n)
        dmean.append((nm - om) / om * 100)
        dmed.append((st.median(n) - st.median(o)) / st.median(o) * 100)
        off_norm += [c / om for c in o]
        on_norm += [c / om for c in n]
        print(f"  {os.path.basename(td):<28}{len(o):>6}{len(n):>6}{om:>10.2f}{nm:>9.2f}"
              f"{dmean[-1]:>+7.0f}%{dmed[-1]:>+6.0f}%")

    if not off_norm:
        print("\nno comparable tasks", file=sys.stderr)
        return 1

    mo, mn = st.mean(off_norm), st.mean(on_norm)
    p = _perm_p(off_norm, on_norm)
    print("\n" + "-" * 72)
    print(f"clean cost trials: OFF={tot_o}  ON={tot_n}   ({len(tasks)} task-pairs)")
    print(f"median of per-task MEAN   deltas = {st.median(dmean):+.1f}%")
    print(f"median of per-task MEDIAN deltas = {st.median(dmed):+.1f}%   <- skew-prone (compare_sweep view)")
    print(f"\nPOOLED normalized (1.0 = each task's OFF mean, all trials):")
    print(f"  OFF mean = {mo:.3f}   ON mean = {mn:.3f}   ->  ON {(mn/mo - 1) * 100:+.1f}%   permutation p = {p:.3f}")
    print("-" * 72)
    print("Read-out: the POOLED line is the honest cost delta. p>=0.05 => cost-neutral.")
    print("If MEDIAN and MEAN deltas disagree in sign, the sample is skewed -- trust pooled.")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: python3 cost_pooled.py <results/sweep-STAMP>", file=sys.stderr)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
