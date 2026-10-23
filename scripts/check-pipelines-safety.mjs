/**
 * check-pipelines-safety.mjs — build-time guard for the marketplace pages.
 * No author-controlled string may ever be rendered as HTML, so these source
 * trees must not use set:html, innerHTML, outerHTML or insertAdjacentHTML.
 */
import { readdirSync, readFileSync, statSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIRS = ['src/pages/pipelines', 'src/components/pipelines', 'src/scripts/pipelines.ts']
const BANNED = /set:html|innerHTML|outerHTML|insertAdjacentHTML|document\.write/

function walk(p) {
  const st = statSync(p)
  if (st.isFile()) return [p]
  return readdirSync(p).flatMap((f) => walk(join(p, f)))
}

const hits = []
for (const d of DIRS) {
  let files = []
  try { files = walk(resolve(ROOT, d)) } catch { continue }
  for (const f of files) {
    readFileSync(f, 'utf-8').split('\n').forEach((line, i) => { if (BANNED.test(line)) hits.push(`${f}:${i + 1}: ${line.trim()}`) })
  }
}
if (hits.length) {
  console.error('[check-pipelines-safety] raw HTML sinks are not allowed under the pipelines pages:')
  for (const h of hits) console.error(`  ${h}`)
  process.exit(1)
}
console.log('[check-pipelines-safety] ✓ no raw HTML sinks under pipelines pages')
