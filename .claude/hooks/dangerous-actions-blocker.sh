#!/usr/bin/env bash
# dangerous-actions-blocker.sh
# Blocks destructive operations and secret exposure for rtk-ldp

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool // empty')
PARAMS=$(echo "$INPUT" | jq -r '.parameters // empty')

block_action() {
  local reason="$1"
  printf '{"block": true, "reason": "BLOCKED: %s"}\n' "$reason"
  exit 0
}

is_sensitive_path() {
  local path="$1"
  case "$path" in
    *.env*|*secret*|*credential*|*password*|*.pem|*.key|*.cert|*/.ssh/*|*/.aws/*)
      return 0 ;;
    *)
      return 1 ;;
  esac
}

check_staged_secrets() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    return 0
  fi
  local patterns=("GITHUB_TOKEN" "ANTHROPIC_API_KEY" "AWS_.*KEY")
  for pattern in "${patterns[@]}"; do
    if git diff --cached | grep -qE "$pattern"; then
      block_action "Secret pattern in staged files: $pattern"
    fi
  done
}

if [[ "$TOOL" == "Bash" ]]; then
  COMMAND=$(echo "$PARAMS" | jq -r '.command // empty')
  DESTROY="rf /"
  if [[ "$COMMAND" == *"rm -$DESTROY"* ]] || [[ "$COMMAND" =~ ":(){" ]]; then
    block_action "Destructive operation blocked"
  fi
  FORCE_PUSH="--force.*main"
  if [[ "$COMMAND" =~ "git push".*$FORCE_PUSH ]]; then
    block_action "Force push to main blocked"
  fi
  if [[ "$COMMAND" =~ "git commit" ]]; then
    check_staged_secrets
  fi
  if [[ "$COMMAND" =~ cat.*\.env|head.*\.env|tail.*\.env ]]; then
    block_action "Attempted to read .env file via Bash"
  fi
fi

if [[ "$TOOL" == "Edit" ]] || [[ "$TOOL" == "Write" ]]; then
  FILE_PATH=$(echo "$PARAMS" | jq -r '.file_path // .path // empty')
  if is_sensitive_path "$FILE_PATH"; then
    block_action "Editing sensitive file blocked: $FILE_PATH"
  fi
fi

printf '{"block": false}\n'
exit 0
