#!/usr/bin/env bash
# security-gate.sh
# Detects hardcoded secrets before writing to source files.
# Exit 0 = allow, Exit 2 = block (stderr message shown to Claude)

set -e

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [[ "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "Edit" ]]; then
    exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.file_path // empty')

EXTENSION="${FILE_PATH##*.}"
SOURCE_EXTENSIONS="js ts jsx tsx astro css json mjs"
is_source=false
for ext in $SOURCE_EXTENSIONS; do
    [[ "$EXTENSION" == "$ext" ]] && is_source=true && break
done
[[ "$is_source" == "false" ]] && exit 0

if [[ "$TOOL_NAME" == "Write" ]]; then
    CONTENT=$(echo "$INPUT" | jq -r '.content // empty')
else
    CONTENT=$(echo "$INPUT" | jq -r '.new_string // empty')
fi

# Provider API keys
if echo "$CONTENT" | grep -qE '(sk-[a-zA-Z0-9]{20,}|sk-ant-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|AKIA[A-Z0-9]{16})'; then
    echo "SECURITY-GATE: Provider API key pattern detected in $FILE_PATH — move to .env or environment variables" >&2; exit 2
fi

# Hardcoded secrets
if echo "$CONTENT" | grep -qiE '(api[_-]?key|password|secret|token|bearer)\s*=\s*["'"'"'][^"'"'"'$\{][^"'"'"']{8,}["'"'"']'; then
    echo "SECURITY-GATE: Potential hardcoded secret in $FILE_PATH — use import.meta.env" >&2; exit 2
fi

# Private key material
if echo "$CONTENT" | grep -qE '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----'; then
    echo "SECURITY-GATE: Private key material detected in $FILE_PATH" >&2; exit 2
fi

exit 0
