/**
 * prepare-pipelines.mjs
 *
 * Builds src/data/pipelines.json (GENERATED — git-ignored) from the reviewed
 * allowlist in the rtk-ai/pipelines repo:
 *   1. Reads every approved/<owner>/<repo>/<sha>/{pipeline.toml,entry.toml,report.json}
 *   2. Drops entries matched by revoked.toml; keeps the newest approval per owner/repo
 *   3. Validates identifiers and BUILDS the install line from them (never copied from author text)
 *   4. Enriches with GitHub (stars, forks, parent, avatar) — falls back to report.json.repo, never fails the build
 *   5. Re-checks the author numbers the bot normalized (benchmark.toml, README share card): shape and bounds only
 *
 * Run: node scripts/prepare-pipelines.mjs
 * CI:  PIPELINES_REPO_PATH=./pipelines-repo node scripts/prepare-pipelines.mjs
 * Dev: PIPELINES_REPO_PATH=../pipelines/test/fixtures/sample-repo node scripts/prepare-pipelines.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { parse as parseToml } from 'smol-toml'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT = resolve(ROOT, 'src/data/pipelines.json')
const SITE = 'https://www.rtk-ai.app'
const REVIEW_REPO = 'rtk-ai/pipelines'

const OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/
const REPO_RE = /^[A-Za-z0-9_.-]{1,100}$/
const SHA_RE = /^[0-9a-f]{40}$/
const NAME_RE = /^[A-Za-z0-9_-]+$/
const MAX_TOML = 64 * 1024

const PIPELINES_REPO_PATH = process.env.PIPELINES_REPO_PATH
  ?? (existsSync(resolve(ROOT, '../pipelines/approved')) ? resolve(ROOT, '../pipelines') : resolve(ROOT, 'pipelines-repo'))

function emit(data) {
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

console.log('[prepare-pipelines] Starting...')
console.log(`[prepare-pipelines] Source: ${PIPELINES_REPO_PATH}`)

if (!existsSync(join(PIPELINES_REPO_PATH, 'approved'))) {
  console.warn(`[prepare-pipelines] WARNING: no approved/ directory at ${PIPELINES_REPO_PATH} — emitting an empty list.`)
  if (process.env.CI) console.log('::warning::prepare-pipelines: allowlist not found, /pipelines/ built empty')
  emit({ generated: new Date().toISOString(), rtkMin: null, pipelines: [], revoked: [] })
  process.exit(0)
}

const readToml = (p) => (existsSync(p) ? parseToml(readFileSync(p, 'utf-8')) : {})
const readJson = (p, fb) => { try { return existsSync(p) ? JSON.parse(readFileSync(p, 'utf-8')) : fb } catch { return fb } }

const revokedRaw = readToml(join(PIPELINES_REPO_PATH, 'revoked.toml')).revoked ?? []
const revoked = (Array.isArray(revokedRaw) ? revokedRaw : []).map((r) => ({
  owner: String(r.owner ?? ''), repo: String(r.repo ?? ''), sha: String(r.sha ?? '*'),
  reason: String(r.reason ?? '').slice(0, 300),
  date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date ?? ''),
})).filter((r) => OWNER_RE.test(r.owner) && REPO_RE.test(r.repo) && (r.sha === '*' || SHA_RE.test(r.sha)))
const isRevoked = (o, r, s) => revoked.some((x) => x.owner.toLowerCase() === o.toLowerCase() && x.repo.toLowerCase() === r.toLowerCase() && (x.sha === '*' || x.sha === s))

const approvals = readJson(join(PIPELINES_REPO_PATH, 'state/approvals.json'), {})
const pin = readJson(join(PIPELINES_REPO_PATH, 'rtk.pin'), {})

/** Walk approved/<owner>/<repo>/<sha>/ and validate every id before anything else. */
function walkApproved() {
  const base = join(PIPELINES_REPO_PATH, 'approved')
  const out = []
  for (const owner of readdirSync(base)) {
    const od = join(base, owner)
    if (!statSync(od).isDirectory() || !OWNER_RE.test(owner)) continue
    for (const repo of readdirSync(od)) {
      const rd = join(od, repo)
      if (!statSync(rd).isDirectory() || !REPO_RE.test(repo)) continue
      for (const sha of readdirSync(rd)) {
        const dir = join(rd, sha)
        if (!statSync(dir).isDirectory() || !SHA_RE.test(sha)) continue
        const files = ['pipeline.toml', 'entry.toml', 'report.json'].map((f) => join(dir, f))
        if (!files.every(existsSync)) { console.warn(`[prepare-pipelines]   ! ${owner}/${repo}@${sha.slice(0, 7)} incomplete — skipped`); continue }
        out.push({ owner, repo, sha, dir })
      }
    }
  }
  return out
}

function textOf(v, max) {
  return typeof v === 'string' ? v.slice(0, max) : null
}

/**
 * `rtk pipeline share publish` writes the repo description itself:
 *   "RTK pipeline · <headline> (self-reported) · rtk pipeline add github:o/r"
 * Keep only the author's headline; a description that is just the install
 * line carries no information. Anything else is author text, capped.
 */
function headlineOf(description) {
  const d = textOf(description, 300)
  if (!d) return null
  const m = d.match(/^RTK pipeline · (.+?) \(self-reported\) · rtk pipeline add /)
  if (m) return m[1].slice(0, 120)
  if (/^RTK pipeline · rtk pipeline add /.test(d)) return null
  return d.slice(0, 200)
}

const fin = (v, min = -1e9, max = 1e9) => (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null)
const REL_PATH_RE = /^(?!.*\.\.)[A-Za-z0-9_][A-Za-z0-9_./-]{0,99}$/

/**
 * The author's A/B result as the bot normalized it (scripts/lib/benchmark.mjs
 * in rtk-ai/pipelines). Checked again here: every number finite and bounded,
 * every string capped, deltas never taken from the file. Null when anything
 * essential is off.
 */
function sanitizeBenchmark(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return null
  const suite = textOf(b.suite, 60)
  const cost = b.cost && typeof b.cost === 'object' ? { baseline: fin(b.cost.baseline, 0, 1e7), pipeline: fin(b.cost.pipeline, 0, 1e7), per: textOf(b.cost.per, 20) ?? 'trial' } : null
  if (!suite || !cost || cost.baseline === null || cost.pipeline === null || cost.baseline <= 0) return null
  const q = b.quality && typeof b.quality === 'object' ? { metric: textOf(b.quality.metric, 40), baseline: fin(b.quality.baseline), pipeline: fin(b.quality.pipeline), higherIsBetter: b.quality.higher_is_better !== false } : null
  const quality = q && q.metric && q.baseline !== null && q.pipeline !== null ? q : null
  const tasks = (Array.isArray(b.tasks) ? b.tasks : []).slice(0, 50).map((t) => ({
    name: textOf(t?.name, 80), baseline: fin(t?.baseline, 0, 1e7), pipeline: fin(t?.pipeline, 0, 1e7),
    qualityBaseline: fin(t?.quality_baseline), qualityPipeline: fin(t?.quality_pipeline),
  })).filter((t) => t.name && t.baseline !== null && t.pipeline !== null)
  const rel = (v) => { const s = textOf(v, 100); return s && REL_PATH_RE.test(s) ? s : null }
  return {
    suite, agent: textOf(b.agent, 60), model: textOf(b.model, 60), baseline: textOf(b.baseline, 80) ?? 'without this pipeline',
    trialsPerArm: Number.isInteger(b.trials_per_arm) && b.trials_per_arm > 0 ? b.trials_per_arm : null,
    dates: (Array.isArray(b.dates) ? b.dates : []).slice(0, 12).map((d) => textOf(d, 10)).filter((d) => d && /^\d{4}-\d{2}-\d{2}$/.test(d)),
    details: rel(b.details), raw: rel(b.raw), notes: textOf(b.notes, 400),
    cost, quality, tasks,
  }
}

/** The rtk share card rows the bot parsed out of the author's README. */
function sanitizeSelfReported(s) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return null
  const levers = (Array.isArray(s.levers) ? s.levers : []).slice(0, 12).map((l) => ({
    kind: ['command_filtering', 'delegated_reads', 'cache_hits', 'other'].includes(l?.kind) ? l.kind : 'other',
    lever: textOf(l?.lever, 60), activity: fin(l?.activity, 0, 1e9), activityUnit: textOf(l?.activity_unit, 12),
    removedPct: fin(l?.removed_pct, 0, 100), cachedPct: fin(l?.cached_pct, 0, 100), tokensKeptOut: fin(l?.tokens_kept_out, 0, 1e12),
  })).filter((l) => l.lever && l.activity !== null && (l.removedPct !== null || l.cachedPct !== null || l.tokensKeptOut !== null))
  const headline = textOf(s.headline, 120)
  if (!headline && levers.length === 0) return null
  return { headline, rtkVersion: textOf(s.rtk_version, 30), measuredOn: textOf(s.measured_on, 10), levers }
}

function buildEntry({ owner, repo, sha, dir }) {
  const entry = readToml(join(dir, 'entry.toml'))
  const report = readJson(join(dir, 'report.json'), null)
  const toml = readFileSync(join(dir, 'pipeline.toml'), 'utf-8')
  if (!report) throw new Error('report.json unreadable')
  if (entry.owner !== owner || entry.repo !== repo || entry.sha !== sha) throw new Error('entry.toml does not match its path')
  if (Buffer.byteLength(toml, 'utf-8') > MAX_TOML) throw new Error('pipeline.toml over 64 KB')
  const name = NAME_RE.test(String(entry.name)) ? String(entry.name) : (NAME_RE.test(String(report.name)) ? String(report.name) : null)
  if (!name) throw new Error('no valid name')
  const tier = ['safe', 'structural', 'text'].includes(entry.tier) ? entry.tier : null
  if (!tier) throw new Error(`tier ${entry.tier} not listable`)
  const source = entry.source === 'gist' ? 'gist' : 'github'
  const gistId = source === 'gist' && /^[0-9a-f]{20,40}$/.test(String(entry.gist_id)) ? String(entry.gist_id) : null
  if (source === 'gist' && !gistId) throw new Error('gist entry without a valid gist_id')
  const gistFile = source === 'gist' ? (textOf(entry.gist_file, 100) ?? 'pipeline.toml').replace(/[^A-Za-z0-9_.-]/g, '') : null

  const install = source === 'gist'
    ? `rtk pipeline add https://gist.githubusercontent.com/${owner}/${gistId}/raw/${sha}/${gistFile}`
    : `rtk pipeline add github:${owner}/${repo}@${sha}`
  const repoUrl = source === 'gist' ? `https://gist.github.com/${owner}/${gistId}/${sha}` : `https://github.com/${owner}/${repo}`
  const fileUrl = source === 'gist' ? repoUrl : `https://github.com/${owner}/${repo}/blob/${sha}/pipeline.toml`
  const readmeUrl = source === 'gist' ? null : `https://github.com/${owner}/${repo}/blob/${sha}/README.md`

  const meta = approvals[`${owner}/${repo}@${sha}`] ?? {}
  const repoMeta = approvals[`${owner}/${repo}`] ?? {}
  const facts = report.repo ?? {}

  const egress = (Array.isArray(report.egress) ? report.egress : []).map((e) => ({
    name: textOf(e.name, 60), provider: textOf(e.provider, 40), model: textOf(e.model, 80),
    host: textOf(e.host, 120), baseUrl: textOf(e.base_url, 200), local: e.local === true,
    apiKeyEnv: textOf(e.api_key_env, 80), canonicalEnv: textOf(e.canonical_env, 80),
    custom: e.custom === true, noncanonicalEnv: e.noncanonical_env === true,
  }))
  const envVars = [...new Set(egress.map((e) => e.apiKeyEnv ?? e.canonicalEnv).filter(Boolean))]
  const needsApiKey = egress.some((e) => !e.local && (e.apiKeyEnv || e.canonicalEnv))
  const localOnly = egress.length > 0 && egress.every((e) => e.local)

  return {
    id: `${owner}/${repo}`,
    owner, repo, sha, sha7: sha.slice(0, 7), name, tier, source,
    install, installShadow: `${install} --shadow`,
    stars: Number(facts.stars) || 0, forks: Number(facts.forks) || 0,
    parent: typeof facts.parent === 'string' && /^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(facts.parent) ? facts.parent : null,
    isFork: facts.is_fork === true,
    pushedAt: textOf(facts.pushedAt, 40),
    description: headlineOf(facts.description),
    approvedAt: textOf(meta.approved_at, 40) ?? textOf(entry.submitted_at, 40) ?? null,
    approvedBy: textOf(meta.approved_by, 60),
    discussionUrl: typeof (meta.discussion_url ?? repoMeta.discussion_url) === 'string' && /^https:\/\/github\.com\/rtk-ai\/pipelines\/discussions\/\d+$/.test(meta.discussion_url ?? repoMeta.discussion_url) ? (meta.discussion_url ?? repoMeta.discussion_url) : null,
    reviewPr: Number.isInteger(meta.pr) && meta.pr > 0 ? `https://github.com/${REVIEW_REPO}/pull/${meta.pr}` : null,
    reviewedWith: textOf(entry.rtk, 30) ?? textOf(report.rtk, 30),
    repoUrl, fileUrl, readmeUrl,
    avatarUrl: `https://avatars.githubusercontent.com/${owner}?s=96`,
    extends: (Array.isArray(report.extends) ? report.extends : []).filter((x) => /^rtk:[a-z-]+$/.test(x)),
    rules: (Array.isArray(report.rule_summary) ? report.rule_summary : []).map((r) => ({ position: textOf(r.position, 40), does: textOf(r.does, 200), when: textOf(r.when, 600) })),
    egress, envVars, needsApiKey, localOnly,
    textBlocks: (Array.isArray(report.text_blocks) ? report.text_blocks : []).map((b) => ({ kind: textOf(b.kind, 40), owner: textOf(b.owner, 80), text: textOf(b.text, 2000) })),
    controlRules: {
      deny: Number(report.control_rules?.deny) || 0, route: Number(report.control_rules?.route) || 0,
      rewrite: Number(report.control_rules?.rewrite) || 0, passthrough: Number(report.control_rules?.passthrough) || 0,
    },
    overrides: (Array.isArray(report.overrides) ? report.overrides : []).map((o) => ({
      target: textOf(o.target, 80), keys: (Array.isArray(o.keys) ? o.keys : []).map((k) => textOf(k, 40)),
      targetBuiltin: textOf(o.target_builtin, 40), targetAction: textOf(o.target_action, 20), touchesControl: o.touches_control === true,
    })),
    tasks: (Array.isArray(report.tasks) ? report.tasks : []).map((t) => ({ name: textOf(t.name, 60), kind: textOf(t.kind, 30), upstream: textOf(t.upstream, 60) })),
    classifiers: (Array.isArray(report.classifiers) ? report.classifiers : []).map((c) => ({ name: textOf(c.name, 60), question: textOf(c.question, 30), upstream: textOf(c.upstream, 60), labels: (Array.isArray(c.labels) ? c.labels : []).map((l) => textOf(l, 40)) })),
    measured: null,
    benchmark: sanitizeBenchmark(report.benchmark),
    selfReported: sanitizeSelfReported(report.self_reported),
    sizeBytes: Buffer.byteLength(toml, 'utf-8'),
    toml,
  }
}

const seenRepo = new Map()
let dropped = 0
for (const item of walkApproved()) {
  const { owner, repo, sha } = item
  if (isRevoked(owner, repo, sha)) { dropped++; console.log(`[prepare-pipelines]   - ${owner}/${repo}@${sha.slice(0, 7)} revoked`); continue }
  let e
  try { e = buildEntry(item) } catch (err) { console.warn(`[prepare-pipelines]   ! ${owner}/${repo}@${sha.slice(0, 7)}: ${err.message} — skipped`); continue }
  const k = e.id.toLowerCase()
  const prev = seenRepo.get(k)
  if (!prev || String(e.approvedAt ?? '') > String(prev.approvedAt ?? '')) seenRepo.set(k, e)
}
const pipelines = [...seenRepo.values()]

/** GitHub enrichment: one GraphQL query with aliases; any failure keeps the report.json numbers. */
async function enrich(list) {
  const token = process.env.GITHUB_TOKEN
  const repos = list.filter((p) => p.source === 'github')
  if (!token || repos.length === 0) { if (!token) console.warn('[prepare-pipelines] GITHUB_TOKEN unset — stars/forks come from the review snapshot'); return }
  const fields = repos.map((p, i) => `r${i}: repository(owner:${JSON.stringify(p.owner)}, name:${JSON.stringify(p.repo)}){ stargazerCount forkCount pushedAt isFork description parent{nameWithOwner} owner{avatarUrl(size:96)} }`).join('\n')
  try {
    const res = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'rtk-landing' }, body: JSON.stringify({ query: `{ ${fields} }` }) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    repos.forEach((p, i) => {
      const r = json.data?.[`r${i}`]
      if (!r) return
      p.stars = r.stargazerCount ?? p.stars
      p.forks = r.forkCount ?? p.forks
      p.pushedAt = r.pushedAt ?? p.pushedAt
      p.isFork = r.isFork === true
      p.parent = r.parent?.nameWithOwner && /^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(r.parent.nameWithOwner) ? r.parent.nameWithOwner : p.parent
      p.description = headlineOf(r.description) ?? p.description
      if (typeof r.owner?.avatarUrl === 'string' && r.owner.avatarUrl.startsWith('https://avatars.githubusercontent.com/')) p.avatarUrl = r.owner.avatarUrl
    })
    console.log(`[prepare-pipelines] ✓ GitHub facts refreshed for ${repos.length} repo(s)`)
  } catch (err) {
    console.warn(`[prepare-pipelines] GitHub enrichment failed (${err.message}) — using review-time numbers`)
  }
}

await enrich(pipelines)
pipelines.sort((a, b) => b.stars - a.stars || String(b.approvedAt).localeCompare(String(a.approvedAt)))

emit({
  generated: new Date().toISOString(),
  rtkMin: typeof pin.version === 'string' ? pin.version : null,
  pipelines,
  revoked,
})
console.log(`[prepare-pipelines] ✓ Done. ${pipelines.length} listed, ${dropped} revoked → ${OUT}`)
