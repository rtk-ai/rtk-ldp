/**
 * prepare-docs.mjs
 *
 * Prepares RTK docs for Starlight:
 *   1. Walks $RTK_REPO_PATH/docs/guide/ recursively
 *   2. Copies to src/content/docs/guide/ preserving subdirectory structure
 *   3. Files already have valid Starlight frontmatter — no injection needed
 *   4. Generates the anchor map for cross-reference resolution
 *
 * Run: node scripts/prepare-docs.mjs
 * CI:  RTK_REPO_PATH=./rtk-repo node scripts/prepare-docs.mjs
 */

import {
  readFileSync, writeFileSync, mkdirSync, existsSync,
  readdirSync, rmSync, statSync,
} from 'fs'
import { resolve, dirname, relative, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// RTK repo path: env var > ../rtk (local sibling) > ./rtk-repo (CI)
const RTK_REPO_PATH = process.env.RTK_REPO_PATH
  ?? (existsSync(resolve(ROOT, '../rtk')) ? resolve(ROOT, '../rtk') : resolve(ROOT, 'rtk-repo'))

const DOCS_SRC = resolve(RTK_REPO_PATH, 'docs/guide')
const OUT_GUIDE = resolve(ROOT, 'src/content/docs/guide')
const ANCHOR_MAP_PATH = resolve(ROOT, 'src/data/docs-anchor-map.json')

// Clear Astro's content layer store to avoid stale entries
const DATA_STORE = resolve(ROOT, '.astro/data-store.json')
if (existsSync(DATA_STORE)) rmSync(DATA_STORE)

// Graceful fail if RTK repo absent — generate stub so Astro can still build
if (!existsSync(DOCS_SRC)) {
  console.warn(`[prepare-docs] WARNING: RTK docs not found at ${DOCS_SRC}`)
  console.warn(`[prepare-docs] Generating stub for local development.`)

  mkdirSync(OUT_GUIDE, { recursive: true })
  writeFileSync(
    resolve(OUT_GUIDE, 'index.md'),
    `---
title: "RTK Documentation"
description: "RTK docs are generated during CI from the rtk repository."
sidebar:
  order: -1
---

# RTK Documentation

Documentation is generated at build time from the [rtk repository](https://github.com/rtk-ai/rtk).

To build locally:

\`\`\`bash
RTK_REPO_PATH=../rtk node scripts/prepare-docs.mjs
\`\`\`
`,
    'utf-8'
  )
  process.exit(0)
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Recursively collect all .md files under a directory.
 * Returns paths relative to the given root dir.
 */
function walkMd(dir, base = dir, skip = new Set()) {
  const results = []
  for (const entry of readdirSync(dir)) {
    if (skip.has(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results.push(...walkMd(full, base, skip))
    } else if (entry.endsWith('.md')) {
      results.push(relative(base, full))
    }
  }
  return results.sort()
}

/**
 * Normalize code fence languages Shiki might not recognize.
 */
function normalizeLangs(content) {
  return content.replace(/^(```|~~~)(\S+)/gm, (_match, fence, lang) => {
    const map = { 'Dockerfile': 'docker', 'C': 'c', 'C++': 'cpp' }
    const normalized = map[lang] ?? lang.toLowerCase()
    return `${fence}${normalized}`
  })
}

/**
 * Slugify a heading to match rehype-slug / Starlight anchor behavior.
 */
function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Extract all headings from content and add to anchor map.
 */
function buildAnchorMap(content, pageUrl, existingMap) {
  const lines = content.split('\n')
  let inFrontmatter = false
  let fmCount = 0

  for (const line of lines) {
    if (!inFrontmatter && fmCount === 0 && line.trim() === '---') {
      inFrontmatter = true; fmCount++; continue
    }
    if (inFrontmatter && line.trim() === '---') {
      inFrontmatter = false; fmCount++; continue
    }
    if (inFrontmatter) continue

    const headingMatch = line.match(/^#{1,6}\s+(.+)$/)
    if (headingMatch) {
      const anchor = slugifyHeading(headingMatch[1].trim())
      if (anchor && !existingMap[anchor]) {
        existingMap[anchor] = pageUrl
      }
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

console.log('[prepare-docs] Starting...')
console.log(`[prepare-docs] Source: ${DOCS_SRC}`)
console.log(`[prepare-docs] Output: ${OUT_GUIDE}`)

// Clean and recreate output dir
rmSync(OUT_GUIDE, { recursive: true, force: true })
mkdirSync(OUT_GUIDE, { recursive: true })

const SKIP = new Set(['README.md'])
const mdFiles = walkMd(DOCS_SRC, DOCS_SRC, SKIP)

if (mdFiles.length === 0) {
  console.error(`[prepare-docs] ERROR: No .md files found in ${DOCS_SRC}`)
  process.exit(1)
}

let count = 0
const anchorMap = {}

for (const relPath of mdFiles) {
  const src = resolve(DOCS_SRC, relPath)
  // Normalize to lowercase for Starlight slug compatibility
  const outRelPath = relPath.toLowerCase()
  const outPath = resolve(OUT_GUIDE, outRelPath)

  // Ensure subdirectory exists
  mkdirSync(dirname(outPath), { recursive: true })

  let content = readFileSync(src, 'utf-8')
  content = normalizeLangs(content)

  // Compute page URL: strip .md, add leading /guide/
  const slug = outRelPath.replace(/\.md$/, '').replace(/\/index$/, '')
  const pageUrl = `/guide/${slug}/`

  buildAnchorMap(content, pageUrl, anchorMap)
  writeFileSync(outPath, content, 'utf-8')

  console.log(`[prepare-docs]   ✓ ${relPath} → guide/${slug || ''}`)
  count++
}

// Write anchor map
mkdirSync(resolve(ROOT, 'src/data'), { recursive: true })
writeFileSync(ANCHOR_MAP_PATH, JSON.stringify(anchorMap, null, 2), 'utf-8')
console.log(`[prepare-docs] ✓ Done. ${count} files copied.`)
console.log(`[prepare-docs] ✓ Anchor map: ${Object.keys(anchorMap).length} entries → ${ANCHOR_MAP_PATH}`)
