#!/usr/bin/env bash
# Simulate the CI/CD step that pulls benchmark data from OVH S3.
# Run this locally to refresh public/data/benchmarks/ before `pnpm dev` or `pnpm build`.
#
# Usage:
#   ./scripts/fetch-benchmarks.sh
#
# Reads credentials from .env at the repo root (same file as the benchmark repo).
# Required vars: OVH_S3_ENDPOINT, OVH_S3_BUCKET, OVH_S3_REGION,
#                AWS_ACCESS_KEY_ID (or OVH_S3_ACCESS_KEY),
#                AWS_SECRET_ACCESS_KEY (or OVH_S3_SECRET_KEY)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"

# Load .env if present (strips inline comments and surrounding quotes)
if [[ -f "$ENV_FILE" ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line//[[:space:]]/}" ]] && continue
    [[ "$line" != *=* ]] && continue
    key="${line%%=*}"
    val="${line#*=}"
    val="${val%%#*}"           # strip inline comments
    val="${val#\"}" val="${val%\"}"  # strip double quotes
    val="${val#\'}" val="${val%\'}"  # strip single quotes
    val="${val#[[:space:]]}" val="${val%[[:space:]]}"
    export "$key"="$val"
  done < "$ENV_FILE"
fi

# Support both OVH_S3_* and standard AWS_* names
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-${OVH_S3_ACCESS_KEY:-}}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-${OVH_S3_SECRET_KEY:-}}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-${OVH_S3_REGION:-}}"
ENDPOINT="${OVH_S3_ENDPOINT:-}"
BUCKET="${OVH_S3_BUCKET:-}"

# Validate
missing=()
[[ -z "$AWS_ACCESS_KEY_ID" ]]     && missing+=("AWS_ACCESS_KEY_ID / OVH_S3_ACCESS_KEY")
[[ -z "$AWS_SECRET_ACCESS_KEY" ]] && missing+=("AWS_SECRET_ACCESS_KEY / OVH_S3_SECRET_KEY")
[[ -z "$ENDPOINT" ]]              && missing+=("OVH_S3_ENDPOINT")
[[ -z "$BUCKET" ]]                && missing+=("OVH_S3_BUCKET")

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "error: missing env vars: ${missing[*]}"
  echo "  Set them in $ENV_FILE or export them before running."
  exit 1
fi

DEST="$REPO_ROOT/public/data/benchmarks"
mkdir -p "$DEST"

echo "Add-only sync s3://${BUCKET}/benchmarks/ → public/data/benchmarks/"
echo "  (never overwrites or deletes local files — only downloads what's missing;"
echo "   index.json and trend.json are rebuilt locally from all versions)"

# List all remote keys, then copy only the ones missing locally. We avoid
# `aws s3 sync` here because it overwrites changed files and `--delete` removes
# local-only files — both of which we explicitly do not want.
keys="$(aws s3api list-objects-v2 \
  --bucket "$BUCKET" \
  --prefix "benchmarks/" \
  --endpoint-url "$ENDPOINT" \
  --query 'Contents[].Key' \
  --output text)"

added=0
skipped=0
while IFS= read -r key; do
  [[ -z "$key" || "$key" == "None" ]] && continue
  rel="${key#benchmarks/}"
  [[ -z "$rel" ]] && continue                      # skip the prefix itself
  # Only mirror what the /benchmarks/ page uses: metrics.json, data/, reports/public/.
  # (index.json / trend.json are rebuilt locally from all versions below.)
  case "$rel" in
    */metrics.json|*/data/*|*/reports/public/*) ;;
    *) continue ;;
  esac
  local_path="$DEST/$rel"
  if [[ -e "$local_path" ]]; then
    skipped=$((skipped + 1))
    continue
  fi
  mkdir -p "$(dirname "$local_path")"
  aws s3 cp "s3://${BUCKET}/${key}" "$local_path" \
    --endpoint-url "$ENDPOINT" --only-show-errors
  echo "  ↓ $rel"
  added=$((added + 1))
done < <(printf '%s\n' "$keys" | tr '\t' '\n')

python3 "$SCRIPT_DIR/fetch-benchmarks.py" --rebuild-only

echo
echo "✓ Done. ${added} added, ${skipped} kept (already present)."
echo "  Run 'pnpm dev' to preview the updated /benchmarks/ page."
