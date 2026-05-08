---
name: prepare-docs
description: Regenerate docs content from the RTK repo
---

Regenerate the docs content by running the prepare-docs pipeline.

## Steps

1. Ask which RTK path to use (default: `../rtk`, worktree: prompt for path):
   - Default sibling: `RTK_REPO_PATH=../rtk`
   - Specific worktree: `RTK_REPO_PATH=/Users/florianbruniaux/Sites/rtk-ai/rtk/.worktrees/<branch>`

2. Run the script:
```bash
RTK_REPO_PATH=<path> node scripts/prepare-docs.mjs
```

3. Report: files copied count, anchor map entries count.

4. If file count is 0, diagnose why (path wrong? docs/guide/ missing?).

5. Run a quick build to validate:
```bash
pnpm build
```

6. Report build status and list of generated doc routes.

## Context

- **Source**: `$RTK_REPO_PATH/docs/guide/**/*.md` (recursive)
- **Output**: `src/content/docs/guide/` (mirrors source structure)
- **Anchor map**: `src/data/docs-anchor-map.json`
- Files already have valid Starlight frontmatter — the script does NOT inject any
