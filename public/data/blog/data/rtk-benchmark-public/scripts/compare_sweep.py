#!/usr/bin/env python3
"""Cross-task PAIRED comparison of RTK ON vs OFF over a sweep (many tasks).

    python compare_sweep.py results/sweep-<stamp>

The right design for "does rtk shift cost": pair by TASK (each task run in both
arms), take each task's MEDIAN over its k trials, then test the per-task deltas
across tasks. Pairing removes between-task difficulty; the across-task test
averages out the per-pair agent-path noise (and surfaces any systematic shift).

- Quality per task: pass rate over all trials (errored/timeout = fail).
- Cost/tokens per task: median over non-errored trials.
- Across tasks: median of the per-task % deltas + a paired SIGN-FLIP permutation
  test (stdlib Wilcoxon-style: under H0 each task's delta is equally likely +/-).
"""
from __future__ import annotations

import random
import statistics as st
import sys
from pathlib import Path

import compare_pairs as cp  # reuse _load_arm / _nums / _reward_eff


def _find_tasks(root: Path):
    """Task subdirs = dirs that contain both an off/ and on/ subdir."""
    tasks = []
    for d in sorted(root.iterdir()):
        if d.is_dir() and (d / "off").is_dir() and (d / "on").is_dir():
            tasks.append(d)
    return tasks


def _median_or_none(xs):
    return st.median(xs) if xs else None


def _sign_flip_p(deltas, iters=50000, seed=12345):
    """Paired permutation test: under H0 each delta's sign is random."""
    deltas = [d for d in deltas if d is not None]
    if len(deltas) < 2:
        return None
    rng = random.Random(seed)
    obs = abs(st.mean(deltas))
    hits = 0
    for _ in range(iters):
        s = sum(d if rng.random() < 0.5 else -d for d in deltas)
        if abs(s / len(deltas)) >= obs - 1e-12:
            hits += 1
    return hits / iters


def main(root: str) -> int:
    root_p = Path(root)
    tasks = _find_tasks(root_p)
    if not tasks:
        print(f"no task subdirs (with off/ and on/) under {root_p}", file=sys.stderr)
        return 1

    print("=" * 74)
    print(f"RTK ON vs OFF -- PAIRED across {len(tasks)} tasks   {root_p}")
    print("=" * 74)
    print(f"\n{'task':<32}{'OFF pass':>9}{'ON pass':>9}{'OFF $':>9}{'ON $':>9}{'Δcost':>8}")

    cost_deltas, inp_deltas = [], []
    q_better = q_worse = q_tie = 0
    for td in tasks:
        off = cp._load_arm(td / "off")
        on = cp._load_arm(td / "on")
        # quality: pass rate over all trials
        op = sum(1 for t in off if cp._reward_eff(t) >= 1.0)
        np_ = sum(1 for t in on if cp._reward_eff(t) >= 1.0)
        opr = op / len(off) if off else 0
        npr = np_ / len(on) if on else 0
        if npr > opr: q_better += 1
        elif npr < opr: q_worse += 1
        else: q_tie += 1
        # cost / tokens: per-task median over non-errored
        oc = _median_or_none(cp._nums(off, "cost_usd"))
        nc = _median_or_none(cp._nums(on, "cost_usd"))
        oi = _median_or_none(cp._nums(off, "n_input_tokens"))
        ni = _median_or_none(cp._nums(on, "n_input_tokens"))
        dc = (nc - oc) / oc * 100 if (oc and nc) else None
        di = (ni - oi) / oi * 100 if (oi and ni) else None
        cost_deltas.append(dc)
        inp_deltas.append(di)
        dcs = f"{dc:+.0f}%" if dc is not None else "  n/a"
        ocs = f"${oc:.2f}" if oc else "  -"
        ncs = f"${nc:.2f}" if nc else "  -"
        print(f"  {td.name:<30}{op}/{len(off):<7}{np_}/{len(on):<7}{ocs:>9}{ncs:>9}{dcs:>8}")

    print("\n" + "-" * 74)
    cd = [d for d in cost_deltas if d is not None]
    idd = [d for d in inp_deltas if d is not None]

    def _pline(label, xs):
        if not xs:
            print(f"{label}: no comparable tasks (all errored or single-arm)")
            return
        p = _sign_flip_p(xs)
        ptxt = f"paired sign-flip p = {p:.3f}" if p is not None else "p n/a (need >=2 tasks)"
        print(f"{label}: median per-task delta = {st.median(xs):+.1f}%   ({ptxt})   n={len(xs)} tasks")

    _pline("COST ", cd)
    _pline("INPUT", idd)
    print(f"QUALITY: ON better on {q_better} tasks, worse on {q_worse}, tied on {q_tie}")
    print("-" * 74)
    print("Read-out: p>=0.05 => rtk's cost shift is indistinguishable from zero")
    print("across tasks. Quality 'worse' count is the regression signal to watch.")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: python compare_sweep.py <results/sweep-STAMP>", file=sys.stderr)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
