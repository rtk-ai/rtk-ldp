#!/bin/bash
# smart-suggest.sh
# Hook: UserPromptSubmit - Suggest relevant commands/skills for rtk-ldp context
# Non-blocking, max 1 suggestion per prompt

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty' 2>/dev/null || true)

[[ -z "$PROMPT" || ${#PROMPT} -lt 8 ]] && exit 0

PROMPT_LC=$(echo "$PROMPT" | tr '[:upper:]' '[:lower:]')

[[ "$PROMPT_LC" =~ ^/ ]] && exit 0

LABEL_CMD="Command"
LABEL_SKILL="Skill"

suggest() {
    local label="$1" name="$2" reason="$3"
    local check
    check=$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's|^/||' | awk '{print $1}')
    if echo "$PROMPT_LC" | grep -qF "$check"; then
        exit 0
    fi

    cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "[Suggestion] $label: $name -- $reason"
  }
}
EOF
    exit 0
}

# SEO / Schemas
if echo "$PROMPT_LC" | grep -qE '(seo|schema|json.ld|structured.data|faqpage|og.tag|meta.descr)'; then
    suggest "$LABEL_CMD" "/audit-seo" "Full SEO audit: JSON-LD schemas + OG tags + meta"
fi

# Images / WebP
if echo "$PROMPT_LC" | grep -qE '(image|webp|png|jpg|jpeg|illustration|cwebp|convert)'; then
    suggest "$LABEL_CMD" "/check-images" "Check WebP coverage + width/height attributes"
fi

# Build / Deploy
if echo "$PROMPT_LC" | grep -qE '(build|deploy|erreur.*build|build.*err|pnpm build|astro build|typescript|ts error)'; then
    suggest "$LABEL_CMD" "/build-check" "Run pnpm build + report errors/warnings"
fi

# RSS / Release
if echo "$PROMPT_LC" | grep -qE '(rss|release|nouvelle.*version|version.*rtk|changelog|sortie)'; then
    suggest "$LABEL_CMD" "/update-rss" "Add RSS entry after a release or new content"
fi

# Docs pipeline
if echo "$PROMPT_LC" | grep -qE '(docs|guide|documentation|prepare.doc|sync.*rtk|rtk.*doc|doc.*pipeline)'; then
    suggest "$LABEL_CMD" "/prepare-docs" "Regenerate docs from RTK repo"
fi

# Design tokens
if echo "$PROMPT_LC" | grep -qE '(couleur|color|token.*design|design.*token|css.*var|variable.*css|global\.css)'; then
    suggest "$LABEL_SKILL" "Skill(seo-geo)" "Check design token usage + no inline colors"
fi

# Accessibility
if echo "$PROMPT_LC" | grep -qE '(accessib|a11y|aria|wcag|contraste|alt.*text|lecteur.*[eé]cran)'; then
    suggest "$LABEL_SKILL" "Skill(ui-ux-pro-max)" "Accessibility audit: WCAG AA check"
fi

# Plan critique
if echo "$PROMPT_LC" | grep -qE '(voici.*plan|mon plan|je veux.*implémenter|avant.*coder|plan.*feature|valide.*plan)'; then
    suggest "$LABEL_CMD" "/critique-plan" "Challenge the plan before implementation"
fi

# Memory / recall
if echo "$PROMPT_LC" | grep -qE '(retiens|souviens|remember|note que|décision|on a décidé)'; then
    suggest "$LABEL_CMD" "/remember" "Store in persistent memory (cross-session)"
fi

exit 0
