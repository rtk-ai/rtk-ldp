/**
 * remark-docs-links.mjs
 *
 * Rewrites relative .md links in RTK docs to Starlight URL paths.
 *
 * Examples:
 *   ./installation.md      → /docs/getting-started/installation/
 *   ../resources/x.md      → /docs/resources/x/
 *
 * Links that are already absolute URLs are left untouched.
 * Links outside docs/ fall back to their original form.
 */

import { visit } from 'unist-util-visit'
import path from 'node:path'

const CONTENT_ROOT = 'src/content/docs'

function pageDir(file) {
  const abs = (file?.history?.[0] ?? file?.path ?? '').replace(/\\/g, '/')
  const marker = `${CONTENT_ROOT}/`
  const i = abs.indexOf(marker)
  if (i === -1) return null
  return path.posix.dirname(abs.slice(i + marker.length))
}

function mdToUrl(href, dir) {
  const base = dir && dir !== '.' ? dir : ''
  const joined = path.posix.normalize(path.posix.join(base, href))
  let slug = joined.replace(/\.md$/i, '').toLowerCase()
  if (slug === 'index') return '/'
  slug = slug.replace(/\/index$/, '')
  return `/${slug}/`
}

/** @returns {import('unified').Plugin} */
export function remarkDocsLinks() {
  return (tree, file) => {
    const dir = pageDir(file)
    visit(tree, 'link', (node) => {
      const href = node.url
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) {
        return
      }
      if (!href.endsWith('.md') && !href.match(/\.md#/)) return

      const [mdPart, anchor] = href.split('#')
      if (dir === null) return
      node.url = mdToUrl(mdPart, dir) + (anchor ? `#${anchor}` : '')
    })
  }
}
