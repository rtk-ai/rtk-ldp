#!/usr/bin/env python3
"""Audit WHY an ON-vs-OFF cost gap exists on a single task -- with receipts.

    python3 worst_pair_audit.py results/sweep-<stamp>/<task>

For each arm it ranks trials by cost, then for the costliest ON trial and the
costliest OFF trial it reports the real cost drivers from the raw claude-code
transcript:
  - step count, bash-call count, and per-command-family counts (mvn/grep/find/git)
  - whether any command was rejected by rtk ("rtk: ..."), and whether the agent
    recovered on the next command
  - the sequence of expensive commands (e.g. `mvn`) with output length + a
    fingerprint of the error each produced, so you can see whether repeated runs
    were PROGRESSING (different errors) or STUCK (same command/output re-run,
    the signature of a filter that hid signal)

The point: distinguish "rtk hid output -> agent re-ran blindly" (a real
regression) from "the task is just hard and the agent iterated" (noise). If the
no-rtk OFF arm ran a similar number of the expensive command, it's the task.
"""
from __future__ import annotations
import glob, json, os, re, sys, statistics as st

CMD_FAMILIES = ("mvn", "grep", "find", "git", "npm", "cargo", "pytest", "gradle", "make")


def _trial_dirs(arm_dir):
    return sorted(glob.glob(f"{arm_dir}/*/*/"))


def _reward(td):
    p = os.path.join(td, "verifier", "reward.txt")
    if os.path.exists(p):
        try:
            return float(open(p).read().strip())
        except Exception:
            return None
    return None


def _cost(td):
    try:
        d = json.load(open(os.path.join(td, "result.json")))
        return (d.get("agent_result") or {}).get("cost_usd")
    except Exception:
        return None


def _exc(td):
    try:
        d = json.load(open(os.path.join(td, "result.json")))
        e = d.get("exception_info")
        if isinstance(e, dict):
            return e.get("exception_message") or e.get("exception_type") or "error"
        return e
    except Exception:
        return None


def _pairs(td):
    """Return [(bash_command, output_text)] in order from the claude-code jsonl."""
    js = glob.glob(f"{td}/agent/sessions/projects/*/*.jsonl")
    if not js:
        return []
    out, pending = [], None
    for ln in open(js[0]):
        try:
            e = json.loads(ln)
        except Exception:
            continue
        c = e.get("message", {}).get("content")
        if not isinstance(c, list):
            continue
        for x in c:
            if not isinstance(x, dict):
                continue
            if x.get("type") == "tool_use" and x.get("name") == "Bash":
                pending = x["input"].get("command", "")
            if x.get("type") == "tool_result":
                t = x.get("content")
                if isinstance(t, list):
                    t = " ".join(y.get("text", "") for y in t if isinstance(y, dict))
                out.append((pending, str(t)))
                pending = None
    return out


def _steps(td):
    try:
        t = json.load(open(os.path.join(td, "agent", "trajectory.json")))
        return len(t.get("steps", []))
    except Exception:
        return None


def audit_trial(td, label):
    pairs = _pairs(td)
    bash = [c for c, _ in pairs if c]
    fam = {f: sum(1 for c in bash if re.search(rf"\b{f}\b", c)) for f in CMD_FAMILIES}
    fam = {k: v for k, v in fam.items() if v}
    rtk_rejects = []
    for i, (cmd, out) in enumerate(pairs):
        if re.search(r"\brtk:\s", out):
            nxt = next((pairs[j][0] for j in range(i + 1, len(pairs)) if pairs[j][0]), None)
            rtk_rejects.append((cmd, re.search(r"rtk:[^\n]{0,90}", out).group(0), nxt))
    print(f"\n### {label}")
    print(f"    steps={_steps(td)}  bash_calls={len(bash)}  cost=${_cost(td)}  reward={_reward(td)}")
    print(f"    command families: {fam}")
    if rtk_rejects:
        print(f"    rtk rejections: {len(rtk_rejects)}")
        for cmd, msg, nxt in rtk_rejects:
            print(f"      - cmd : {cmd[:80].replace(chr(10),' ')}")
            print(f"        msg : {msg}")
            print(f"        next: {(nxt or '')[:80].replace(chr(10),' ')}  <- recovery")
    else:
        print("    rtk rejections: 0")
    # expensive-command progression (default: the most-run family)
    if fam:
        top = max(fam, key=fam.get)
        seq = [(c, o) for c, o in pairs if c and re.search(rf"\b{top}\b", c)]
        print(f"    '{top}' progression ({len(seq)} runs)  [out_len | ERR/OK | fingerprint]:")
        for i, (c, o) in enumerate(seq, 1):
            err = "ERR" if ("[ERROR]" in o or "BUILD FAILURE" in o or "FAILED" in o) else (
                "OK " if ("SUCCESS" in o or "passed" in o.lower()) else "?  ")
            m = re.search(r"\[ERROR\][^\n]{0,80}", o) or re.search(r"\b(FAIL|Error)[^\n]{0,60}", o)
            fp = (m.group(0) if m else o[:56]).replace("\n", " ")
            print(f"      {top}#{i:2} {len(o):6}  {err}  {fp}")


def main(task_dir):
    task = os.path.basename(task_dir.rstrip("/"))
    print("=" * 74)
    print(f"WORST-PAIR AUDIT  {task}")
    print("=" * 74)
    for arm in ("off", "on"):
        tds = _trial_dirs(os.path.join(task_dir, arm))
        rows = [(td, _cost(td), _reward(td), _exc(td)) for td in tds]
        graded = [(td, c) for td, c, r, e in rows if c is not None and r is not None]
        graded.sort(key=lambda x: x[1], reverse=True)
        costs = [c for _, c in graded]
        infra = sum(1 for _, c, r, e in rows if r is None and e)
        print(f"\n[{arm.upper()}] graded={len(graded)}  infra_errors={infra}  "
              f"cost mean=${st.mean(costs):.2f} range=${min(costs):.2f}-${max(costs):.2f}"
              if costs else f"\n[{arm.upper()}] no graded trials")
    # deep-dive the costliest ON and OFF
    for arm in ("on", "off"):
        tds = _trial_dirs(os.path.join(task_dir, arm))
        graded = [(td, _cost(td)) for td in tds if _cost(td) is not None and _reward(td) is not None]
        if not graded:
            continue
        worst = max(graded, key=lambda x: x[1])[0]
        audit_trial(worst, f"COSTLIEST {arm.upper()} TRIAL  ({os.path.basename(worst.rstrip('/'))})")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: python3 worst_pair_audit.py <results/sweep-STAMP/task>", file=sys.stderr)
        sys.exit(2)
    main(sys.argv[1])
