#!/usr/bin/env python3
"""Pull benchmark data from OVH S3 (add-only), then rebuild the manifests.

Usage:
    python scripts/fetch-benchmarks.py              
    python scripts/fetch-benchmarks.py --rebuild-only  # rebuild manifests, no S3 (no creds needed)

Required vars: OVH_S3_ENDPOINT, OVH_S3_BUCKET, OVH_S3_REGION,
               AWS_ACCESS_KEY_ID (or OVH_S3_ACCESS_KEY),
               AWS_SECRET_ACCESS_KEY (or OVH_S3_SECRET_KEY)
"""
from __future__ import annotations

import csv
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

_EMAIL_RE = re.compile(r'[\w.+\-]+@[\w.\-]+\.[a-zA-Z]{2,}')

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent

MANIFESTS = {"index.json", "trend.json"}


def wanted(rel: str) -> bool:
    """Only mirror what the /benchmarks/ page uses: metrics.json, data/, reports/public/."""
    parts = rel.split("/")
    if len(parts) < 2:
        return False
    sub = parts[1]
    if sub == "metrics.json" or sub == "data":
        return True
    if sub == "reports":
        return len(parts) > 2 and parts[2] == "public"
    return False


def parse_version(name: str) -> tuple[int, ...]:
    return tuple(int(p) for p in name.split("."))


UNUSED_PDF_KEYS = {
    "pdf_internal_url",
    "pdf_ecosystem_url",
    "pdf_combined_internal_url",
    "pdf_combined_ecosystem_url",
}


def strip_unused_keys(node):
    if isinstance(node, dict):
        return {k: strip_unused_keys(v) for k, v in node.items() if k not in UNUSED_PDF_KEYS}
    if isinstance(node, list):
        return [strip_unused_keys(v) for v in node]
    return node


def _redact(line: str) -> str:
    return _EMAIL_RE.sub("<email>", line)


def merge_csvs(out: Path, sources: list[Path]) -> bool:
    if not sources:
        return False
    lines: list[str] = []
    for i, src in enumerate(sources):
        rows = src.read_text(encoding="utf-8").splitlines()
        if not rows:
            continue
        if i == 0:
            lines.append(rows[0])          # header — no redaction needed
            lines.extend(_redact(r) for r in rows[1:])
        else:
            lines.extend(_redact(r) for r in rows[1:])
    if not lines:
        return False
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return True


def build_data_downloads(vdir: Path) -> dict[str, list[dict[str, str]]]:
    data = vdir / "data"
    if not data.is_dir():
        return {}
    base = f"/data/benchmarks/{vdir.name}/data"

    runs_by_eco: dict[str, list[str]] = {}
    summary = data / "per_run_summary.csv"
    if summary.exists():
        with summary.open(encoding="utf-8", newline="") as f:
            for row in csv.DictReader(f):
                eco = (row.get("task_name") or "").split(" ")[0].lower()
                if eco and row.get("run_id"):
                    runs_by_eco.setdefault(eco, []).append(row["run_id"])

    def turns_files(suffix: str, run_ids: list[str] | None) -> list[Path]:
        if run_ids is None:
            return sorted((data / "turns").glob(f"*_{suffix}.csv"))
        return sorted(f for rid in run_ids for f in (data / "turns").glob(f"{rid}_{suffix}.csv"))

    downloads: dict[str, list[dict[str, str]]] = {}

    def add(scope: str, label: str, filename: str) -> None:
        downloads.setdefault(scope, []).append({"label": label, "url": f"{base}/{filename}"})

    if merge_csvs(data / "turns-all.csv", turns_files("turns", None)):
        add("all", "Download turns data (CSV)", "turns-all.csv")
    if merge_csvs(data / "session-summaries-all.csv", turns_files("session_summaries", None)):
        add("all", "Session summaries (CSV)", "session-summaries-all.csv")
    if (data / "all_sessions.csv").exists():
        add("all", "All sessions (CSV)", "all_sessions.csv")
    if summary.exists():
        add("all", "Per-run summary (CSV)", "per_run_summary.csv")

    for eco, run_ids in sorted(runs_by_eco.items()):
        if merge_csvs(data / f"turns-{eco}.csv", turns_files("turns", run_ids)):
            add(eco, "Download turns data (CSV)", f"turns-{eco}.csv")
        if merge_csvs(data / f"session-summaries-{eco}.csv", turns_files("session_summaries", run_ids)):
            add(eco, "Session summaries (CSV)", f"session-summaries-{eco}.csv")

    return downloads


def rebuild_manifests(dest: Path) -> list[str]:
    metrics: dict[str, dict] = {}
    for child in sorted(dest.iterdir()):
        mfile = child / "metrics.json"
        if not child.is_dir() or not mfile.exists():
            continue
        try:
            parse_version(child.name)
        except ValueError:
            continue
        data = strip_unused_keys(json.loads(mfile.read_text(encoding="utf-8")))
        downloads = build_data_downloads(child)
        if downloads:
            data["data_downloads"] = downloads
        mfile.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        metrics[child.name] = data

    versions = sorted(metrics, key=parse_version, reverse=True)
    ecosystems = sorted({
        e["ecosystem"]
        for m in metrics.values()
        for e in m.get("ecosystems", [])
    })

    index = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "versions": versions,
        "ecosystems": ecosystems,
        "latest_version": versions[0] if versions else None,
        "total_runs": sum(m.get("run_count") or 0 for m in metrics.values()),
        "total_sessions": sum(m.get("sample_size") or 0 for m in metrics.values()),
    }

    trend = []
    for v in sorted(metrics, key=parse_version):
        m = metrics[v]
        agg = m.get("aggregate") or {}
        trend.append({
            "version": v,
            "cost_savings_pct": (agg.get("cost") or {}).get("savings_pct"),
            "token_savings_pct": (agg.get("tokens") or {}).get("savings_pct"),
            "bash_savings_pct": (agg.get("bash_bytes") or {}).get("savings_pct"),
            "pass_rate_on": (agg.get("pass_rate") or {}).get("on"),
            "pass_rate_off": (agg.get("pass_rate") or {}).get("off"),
            "sample_size": (agg.get("sample_size_on") or 0) + (agg.get("sample_size_off") or 0),
            "ecosystems": {
                e["ecosystem"]: {
                    "cost_savings_pct": (e.get("cost") or {}).get("savings_pct"),
                    "token_savings_pct": (e.get("tokens") or {}).get("savings_pct"),
                    "bash_savings_pct": (e.get("bash_bytes") or {}).get("savings_pct"),
                    "sample_size": (e.get("sample_size_on") or 0) + (e.get("sample_size_off") or 0),
                }
                for e in m.get("ecosystems", [])
            },
        })

    (dest / "index.json").write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")
    (dest / "trend.json").write_text(json.dumps(trend, indent=2) + "\n", encoding="utf-8")
    return versions


def load_dotenv():
    env_file = REPO_ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        val = val.split("#")[0].strip().strip("\"'")
        os.environ.setdefault(key.strip(), val)


def main():
    dest = REPO_ROOT / "public" / "data" / "benchmarks"
    dest.mkdir(parents=True, exist_ok=True)

    if "--rebuild-only" in sys.argv[1:]:
        versions = rebuild_manifests(dest)
        print(f"✓ Rebuilt index.json + trend.json from {len(versions)} version(s): {', '.join(versions)}")
        return

    load_dotenv()

    endpoint = os.environ.get("OVH_S3_ENDPOINT", "")
    bucket   = os.environ.get("OVH_S3_BUCKET", "")
    region   = os.environ.get("OVH_S3_REGION", "")
    prefix   = os.environ.get("OVH_S3_PREFIX", "benchmarks").strip("/")
    access   = os.environ.get("AWS_ACCESS_KEY_ID") or os.environ.get("OVH_S3_ACCESS_KEY", "")
    secret   = os.environ.get("AWS_SECRET_ACCESS_KEY") or os.environ.get("OVH_S3_SECRET_KEY", "")

    missing = []
    if not endpoint:
        missing.append("OVH_S3_ENDPOINT")
    if not bucket:
        missing.append("OVH_S3_BUCKET")
    if not access:
        missing.append("AWS_ACCESS_KEY_ID / OVH_S3_ACCESS_KEY")
    if not secret:
        missing.append("AWS_SECRET_ACCESS_KEY / OVH_S3_SECRET_KEY")
    if missing:
        print(f"error: missing env vars: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)

    import boto3

    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        region_name=region or None,
        aws_access_key_id=access,
        aws_secret_access_key=secret,
    )

    print(f"Add-only sync s3://{bucket}/{prefix}/ → public/data/benchmarks/")
    print("  (never overwrites or deletes local files — only downloads what's missing;")
    print("   index.json and trend.json are rebuilt locally from all versions)")

    paginator = client.get_paginator("list_objects_v2")
    added = skipped = 0

    for page in paginator.paginate(Bucket=bucket, Prefix=f"{prefix}/"):
        for obj in page.get("Contents", []):
            key = obj["Key"]
            rel = key[len(prefix) + 1:]  # strip "benchmarks/"
            if not rel or not wanted(rel):
                continue
            local = dest / rel
            if local.exists():
                skipped += 1
                continue
            local.parent.mkdir(parents=True, exist_ok=True)
            client.download_file(bucket, key, str(local))
            if local.suffix == ".csv":
                local.write_text(_redact(local.read_text(encoding="utf-8")), encoding="utf-8")
            print(f"  ↓ {rel}")
            added += 1

    versions = rebuild_manifests(dest)
    print(f"  ↻ index.json + trend.json rebuilt from {len(versions)} version(s): {', '.join(versions)}")

    print(f"\n✓ Done. {added} added, {skipped} kept (already present).")
    print("  Run 'pnpm dev' to preview the updated /benchmarks/ page.")


if __name__ == "__main__":
    main()
