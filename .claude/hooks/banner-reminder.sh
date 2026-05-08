#!/usr/bin/env bash
# banner-reminder.sh
# PostToolUse: remind to update RSS + sitemap when a new Astro page is created.

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool // empty')

[[ "$TOOL" != "Write" ]] && exit 0

FILE_PATH=$(echo "$INPUT" | jq -r '.parameters.file_path // empty')
[[ -z "$FILE_PATH" ]] && exit 0

if echo "$FILE_PATH" | grep -qE 'src/pages/[^/]+\.astro$|src/pages/[^/]+/index\.astro$'; then
  if echo "$FILE_PATH" | grep -qE '(404|rss)'; then
    exit 0
  fi

  RELATIVE="${FILE_PATH#*/src/pages/}"

  cat << EOF
{
  "systemMessage": "New Astro page created: src/pages/$RELATIVE\n  1. Update src/data/rss-entries.ts — add a new_page entry at the top\n  2. Update sitemap if it exists (src/pages/sitemap/index.astro)\n  3. Add JSON-LD WebPage schema if needed (Layout.astro auto-injects, just check)"
}
EOF
fi

exit 0
