#!/usr/bin/env python3
"""Compare RTK ON vs OFF from a run-pairs.sh output dir, WITHOUT bias.

    python compare_pairs.py results/pairs-<stamp>

Design choices that keep the comparison honest:
  - QUALITY = pass rate over ALL trials; a timed-out/errored trial counts as a
    FAILURE (reward 0), never silently dropped. That's the metric that catches a
    filter breaking the task.
  - COST/TOKENS = mean + total over ALL trials that have a value (errored trials'
    partial cost included). We do NOT median over survivors only -- excluding
    killed/expensive trials is exactly the survivorship bias that made an earlier
    run look 23% cheaper when total spend was identical.
  - A permutation test (stdlib, no scipy) gives a p-value; small deltas at low K
    are usually noise.
  - If the two arms have different errored counts, cost is CONFOUNDED (timed-out
    trials are truncated) and we say so -- prefer pass-rate + total spend then.
"""
from __future__ import annotations

import json
import random
import re
import statistics as st
import sys
from pathlib import Path

_TIMESTAMP_DIR = re.compile(r"^\d{4}-\d{2}-\d{2}__\d{2}-\d{2}-\d{2}$")

def _rtext(c):
    if isinstance(c, str):
        return c
    if isinstance(c, list):
        return "".join(b.get("text", "") if isinstance(b, dict) else str(b) for b in c)
    return ""


def _bash_output_bytes(trial_dir: Path):
    """Total bytes of Bash tool output for one trial, from its session JSONL.

    Returns None if no transcript is present.
    """
    proj = trial_dir / "agent" / "sessions" / "projects"
    jf = next(proj.rglob("*.jsonl"), None) if proj.exists() else None
    if jf is None:
        return None
    bash_ids, total = set(), 0
    for line in jf.read_text().splitlines():
        try:
            d = json.loads(line)
        except Exception:
            continue
        content = d.get("message", {}).get("content")
        if not isinstance(content, list):
            continue
        for b in content:
            if not isinstance(b, dict):
                continue
            if b.get("type") == "tool_use" and b.get("name") == "Bash":
                bash_ids.add(b.get("id"))
            elif b.get("type") == "tool_result" and b.get("tool_use_id") in bash_ids:
                total += len(_rtext(b.get("content", "")))
    return total


def _load_arm(arm_dir: Path) -> list[dict]:
    """One record per trial (parent dir name is '<task>__<hash>')."""
    trials = []
    for rj in sorted(arm_dir.rglob("result.json")):
        name = rj.parent.name
        if "__" not in name or _TIMESTAMP_DIR.match(name):
            continue  # skip run-level aggregate result.json
        try:
            d = json.loads(rj.read_text())
        except Exception:
            continue
        ar = d.get("agent_result") or {}
        vr = (d.get("verifier_result") or {}).get("rewards") or {}
        trials.append(
            {
                "name": name,
                "errored": d.get("exception_info") is not None,
                "reward": vr.get("reward"),
                "cost_usd": ar.get("cost_usd"),
                "n_input_tokens": ar.get("n_input_tokens"),
                "n_cache_tokens": ar.get("n_cache_tokens"),
                "n_output_tokens": ar.get("n_output_tokens"),
                "bash_output_bytes": _bash_output_bytes(rj.parent),
            }
        )
    return trials


def _nums(trials, key):
    """All numeric values for a key, across ALL trials (no survivor filter)."""
    return [t[key] for t in trials if isinstance(t.get(key), (int, float))]


def _reward_eff(t):
    """Effective reward: a trial with no reward (killed before verify) = 0."""
    r = t["reward"]
    return r if isinstance(r, (int, float)) else 0.0


def _perm_p(a, b, iters=20000, seed=12345):
    """Two-sided permutation test on difference of means. Stdlib only."""
    if len(a) < 2 or len(b) < 2:
        return None
    rng = random.Random(seed)
    obs = abs(st.mean(a) - st.mean(b))
    pool = list(a) + list(b)
    na = len(a)
    hits = 0
    for _ in range(iters):
        rng.shuffle(pool)
        if abs(st.mean(pool[:na]) - st.mean(pool[na:])) >= obs - 1e-9:
            hits += 1
    return hits / iters


def _pct(o, n):
    return f"{(n - o) / o * 100:+.1f}%" if o else "   n/a"


def main(root: str) -> int:
    root_p = Path(root)
    off = _load_arm(root_p / "off")
    on = _load_arm(root_p / "on")
    if not off and not on:
        print(f"no trial result.json under {root_p}/off or /on", file=sys.stderr)
        return 1

    print("=" * 70)
    print(f"RTK ON vs OFF   {root_p}")
    print("=" * 70)

    # --- QUALITY: pass rate over ALL trials; timeout/errored = failure ---
    print("\nQUALITY  (all trials; a timed-out/errored trial = NOT passed)")
    print(f"  {'arm':<22}{'trials':>7}{'errored':>9}{'passed':>8}{'pass-rate':>11}{'mean-rwd':>10}")
    q = {}
    for label, arm in (("OFF (stock)", off), ("ON  (rtk)", on)):
        n = len(arm)
        err = sum(t["errored"] for t in arm)
        passed = sum(1 for t in arm if _reward_eff(t) >= 1.0)
        mr = st.mean([_reward_eff(t) for t in arm]) if arm else 0.0
        q[label] = (n, passed)
        print(f"  {label:<22}{n:>7}{err:>9}{passed:>8}{passed/n*100 if n else 0:>10.0f}%{mr:>10.3f}")
    if all(q.values()):
        (no, po), (nn, pn) = q["OFF (stock)"], q["ON  (rtk)"]
        dpp = (pn / nn - po / no) * 100 if no and nn else 0
        flag = "   <-- ON pass rate DROPPED (possible rtk regression)" if dpp < 0 else ""
        print(f"  -> pass-rate delta = {dpp:+.0f} pp{flag}")

    # --- COST & TOKENS: mean + total over ALL trials (no survivor bias) ---
    print("\nCOST & TOKENS  (MEAN over all trials with a value -- errored included)")
    print(f"  {'metric':<16}{'OFF mean':>12}{'ON mean':>12}{'Δ%':>8}{'perm-p':>8}{'n OFF/ON':>10}")
    metrics = [("cost_usd", "Cost USD", True),
               ("n_input_tokens", "Input tokens", False),
               ("n_cache_tokens", "Cache tokens", False),
               ("n_output_tokens", "Output tokens", False)]
    for key, name, is_cost in metrics:
        vo, vn = _nums(off, key), _nums(on, key)
        if not vo or not vn:
            continue
        mo, mn = st.mean(vo), st.mean(vn)
        fo = f"${mo:,.2f}" if is_cost else f"{mo:,.0f}"
        fn = f"${mn:,.2f}" if is_cost else f"{mn:,.0f}"
        p = _perm_p(vo, vn)
        ps = f"{p:.3f}" if p is not None else "  -"
        print(f"  {name:<16}{fo:>12}{fn:>12}{_pct(mo, mn):>8}{ps:>8}{f'{len(vo)}/{len(vn)}':>10}")

    # total spend -- the number that exposes survivorship bias
    to, tn = sum(_nums(off, "cost_usd")), sum(_nums(on, "cost_usd"))
    print(f"  {'TOTAL spend':<16}{'$'+format(to,',.2f'):>12}{'$'+format(tn,',.2f'):>12}{_pct(to, tn):>8}")

    # --- BASH OUTPUT bytes + ~tokens (from session logs, mean per trial) ---
    vo, vn = _nums(off, "bash_output_bytes"), _nums(on, "bash_output_bytes")
    if vo and vn:
        mo, mn = st.mean(vo), st.mean(vn)
        print("\nBASH OUTPUT  (mean per trial, from session logs; ~tokens = bytes/4)")
        print(f"  {'metric':<16}{'OFF':>14}{'ON':>14}{'Δ%':>8}")
        print(f"  {'bytes':<16}{mo:>14,.0f}{mn:>14,.0f}{_pct(mo, mn):>8}")
        print(f"  {'~tokens':<16}{mo/4:>14,.0f}{mn/4:>14,.0f}{_pct(mo, mn):>8}")

    # --- confound / significance guidance ---
    eo, en = sum(t["errored"] for t in off), sum(t["errored"] for t in on)
    print("\nREAD-OUT")
    if eo != en:
        print(f"  ⚠ errored counts differ (OFF {eo}, ON {en}). Timed-out trials are")
        print("    truncated, so per-trial COST is confounded -- trust pass-rate and")
        print("    TOTAL spend over cost means here. Re-run with a higher")
        print("    AGENT_TIMEOUT_MULT so no legit trial is clipped.")
    print("  - Cost/tokens use MEAN over ALL trials, not survivor-median, so a")
    print("    clipped expensive trial can't fake a saving.")
    print("  - perm-p >= 0.05 => the delta is indistinguishable from noise.")
    print("  - Pass rate must NOT drop under ON; that's the real regression signal.")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: python compare_pairs.py <results/pairs-STAMP>", file=sys.stderr)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
