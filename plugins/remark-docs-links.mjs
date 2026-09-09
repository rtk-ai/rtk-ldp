/**
 * remark-docs-links.mjs
 *
 * Rewrites relative .md links in RTK docs to Starlight URL paths.
 *
 * The docs are authored in the rtk repo and copied into src/content/docs/ by
 * scripts/prepare-docs.mjs, preserving their directory structure. Because that
 * directory IS the URL path under Starlight, a link only needs resolving
 * against the directory of the file that contains it.
 *
 * Examples, from a page at src/content/docs/docs/getting-started/quick-start.md:
 *   ./installation.md          → /docs/getting-started/installation/
 *   ./configuration.md         → /docs/getting-started/configuration/
 *   ../resources/telemetry.md  → /docs/resources/telemetry/
 *   ../TECHNICAL.md            → /docs/technical/
 *
 * Previously this ignored the containing directory and hardcoded a /guide/
 * prefix, so `./installation.md` inside getting-started/ became
 * `/guide/installation/`: a page that does not exist. Eleven such links shipped
 * as 404s, surviving only where astro.config.mjs happened to carry a matching
 * backcompat redirect. Internal doc links must resolve to real pages directly,
 * never by bouncing through the /guide/ compatibility map.
 *
 * Absolute URLs, anchors and mailto links are left untouched.
 */

import { visit } from 'unist-util-visit'
import path from 'node:path'

/** Starlight's content root: everything below it maps 1:1 onto the URL path. */
const CONTENT_ROOT = 'src/content/docs'

/** Directory of the current page, relative to CONTENT_ROOT (e.g. "docs/getting-started"). */
function pageDir(file) {
  const abs = (file?.history?.[0] ?? file?.path ?? '').replace(/\\/g, '/')
  const marker = `${CONTENT_ROOT}/`
  const i = abs.indexOf(marker)
  if (i === -1) return null
  return path.posix.dirname(abs.slice(i + marker.length))
}

/** Resolve a relative .md href against the page's own directory. */
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
      /* No resolvable directory (a doc rendered from outside the content root)
         leaves the link alone rather than guessing a wrong absolute path. */
      if (dir === null) return
      node.url = mdToUrl(mdPart, dir) + (anchor ? `#${anchor}` : '')
    })
  }
}
