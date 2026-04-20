/**
 * remark-docs-links.mjs
 *
 * Rewrites relative .md links in RTK docs to Starlight URL paths.
 *
 * Examples:
 *   ./FEATURES.md          → /docs/guide/features/
 *   ../TECHNICAL.md        → /docs/guide/technical/
 *   ./filter-workflow.md   → /docs/guide/filter-workflow/
 *
 * Links that are already absolute URLs are left untouched.
 * Links outside docs/ fall back to their original form.
 */

import { visit } from 'unist-util-visit'

/** Convert a .md filename to a Starlight slug path */
function mdToSlug(href) {
  // Strip ./ ../ prefix, keep the filename
  const clean = href.replace(/^\.\.?\//, '')
  // Lowercase, strip .md
  const slug = clean.replace(/\.md$/, '').toLowerCase()
  return `/docs/guide/${slug}/`
}

/** @returns {import('unified').Plugin} */
export function remarkDocsLinks() {
  return (tree) => {
    visit(tree, 'link', (node) => {
      const href = node.url
      // Skip absolute URLs, anchors-only, mailto
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) {
        return
      }
      // Rewrite relative .md links
      if (href.endsWith('.md') || href.match(/\.md#/)) {
        const [mdPart, anchor] = href.split('#')
        const newUrl = mdToSlug(mdPart) + (anchor ? `#${anchor}` : '')
        node.url = newUrl
      }
    })
  }
}
