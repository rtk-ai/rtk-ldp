/**
 * impact.ts — the two things a visitor decides on: what result a pipeline
 * gives, and what it needs from them. Everything is computed from the
 * pipelines.json entry; the only author text that reaches the page is the
 * capped, labelled benchmark note.
 *
 * Evidence ladder, always labelled on the page:
 *   measured   numbers from RTK's own CI (phase 2, not yet produced)
 *   benchmark  the author's A/B run, declared in benchmark.toml
 *   usage      the author's own rtk usage, from the share card README
 *   none       nothing yet
 */

import type { Tone } from './summary'

export type Evidence = 'measured' | 'benchmark' | 'usage' | 'none'

export const EVIDENCE_LABEL: Record<Evidence, string> = {
  measured: 'Measured by RTK',
  benchmark: "Author's benchmark",
  usage: "Author's own usage",
  none: 'Not measured yet',
}
const EVIDENCE_RANK: Record<Evidence, number> = { measured: 3, benchmark: 2, usage: 1, none: 0 }

export interface Quality { text: string; tone: Tone; detail: string | null }
/** What the number measures. Only `cost` is a measurement of what a task cost end to end. */
export type ResultKind = 'cost' | 'output' | 'none'
export const KIND_LABEL: Record<ResultKind, string> = { cost: 'Total cost', output: 'Output size', none: '' }
export interface Headline {
  evidence: Evidence
  evidenceLabel: string
  kind: ResultKind
  kindLabel: string
  /** "−14%" or null when there is nothing to show */
  value: string | null
  /** what the value is of: "cost per trial", "command output" */
  unit: string | null
  /** one short line under the value */
  sub: string | null
  tone: Tone
  quality: Quality
  /** "SkillsBench · Claude Opus 5.5 · 48 trials per arm · Oct 18–19, 2026" */
  setup: string | null
}

export function delta(baseline: number | null | undefined, pipeline: number | null | undefined): number | null {
  if (baseline == null || pipeline == null || !(baseline > 0)) return null
  return (pipeline - baseline) / baseline
}

/** −13.9% / −30% / +80% / 0% — one decimal under 100 when it carries information. */
export function fmtPct(f: number): string {
  const v = Math.abs(f * 100)
  const body = (v < 100 ? v.toFixed(1) : v.toFixed(0)).replace(/\.0$/, '')
  if (Number(body) === 0) return '0%'
  return `${f > 0 ? '+' : '−'}${body}%`
}

export function fmtUsd(n: number): string {
  if (n >= 100) return `$${n.toFixed(0)}`
  if (n >= 1) return `$${n.toFixed(2)}`
  return `$${n.toFixed(n < 0.1 ? 3 : 2)}`
}

export function fmtInt(n: number): string {
  return n.toLocaleString('en-US')
}

export function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n < 10_000 ? 1 : 0)}K`
  return String(n)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function md(d: string): { m: number; d: number; y: number } | null {
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) } : null
}
/** ["2026-10-18","2026-10-19"] → "Oct 18–19, 2026" */
export function formatDates(dates: string[]): string | null {
  const ds = dates.map(md).filter(Boolean) as { m: number; d: number; y: number }[]
  if (!ds.length) return null
  const a = ds[0], b = ds[ds.length - 1]
  if (ds.length === 1 || (a.y === b.y && a.m === b.m && a.d === b.d)) return `${MONTHS[a.m]} ${a.d}, ${a.y}`
  if (a.y === b.y && a.m === b.m) return `${MONTHS[a.m]} ${a.d}–${b.d}, ${a.y}`
  if (a.y === b.y) return `${MONTHS[a.m]} ${a.d} – ${MONTHS[b.m]} ${b.d}, ${a.y}`
  return `${MONTHS[a.m]} ${a.d}, ${a.y} – ${MONTHS[b.m]} ${b.d}, ${b.y}`
}

/** "claude-opus-5-5" → "Claude Opus 5.5"; unknown ids pass through. */
export function modelName(id: string | null | undefined): string | null {
  if (!id) return null
  const m = id.match(/^claude-(opus|sonnet|haiku|fable|mythos)-(\d+)-(\d+)$/)
  if (m) return `Claude ${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}.${m[3]}`
  const g = id.match(/^gpt-(.+)$/)
  if (g) return `GPT-${g[1]}`
  const ge = id.match(/^gemini-(.+)$/)
  if (ge) return `Gemini ${ge[1]}`
  return id
}

/**
 * Verdict on the quality metric. Small benchmarks are noisy (the authors
 * themselves call per-task moves under ~20% noise), so only a move over 5%
 * of the baseline is called better or worse; under that it is "about the
 * same", with the two numbers always shown next to it.
 */
function qualityVerdict(q: any | null): Quality {
  if (!q) return { text: 'Not measured', tone: 'note', detail: null }
  const diff = q.pipeline - q.baseline
  const rel = Math.abs(diff) / Math.max(Math.abs(q.baseline), 1e-9)
  const detail = `${q.metric} ${q.baseline} → ${q.pipeline}`
  if (rel <= 0.005) return { text: 'Unchanged', tone: 'ok', detail }
  if (rel <= 0.05) return { text: 'About the same', tone: 'note', detail }
  const better = diff > 0 === (q.higherIsBetter !== false)
  return better
    ? { text: `Better (${fmtPct(rel)})`, tone: 'ok', detail }
    : { text: `Worse (${fmtPct(-rel)})`, tone: 'warn', detail }
}

export function benchmarkSetup(b: any): string | null {
  if (!b) return null
  const parts = [b.suite, modelName(b.model), b.trialsPerArm ? `${fmtInt(b.trialsPerArm)} trials per arm` : null, formatDates(b.dates ?? [])].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
}

/** The lever to lead with from a share card: command filtering first, then the biggest ratio. */
export function usageLead(sr: any): { pct: number; activity: number; unit: string; what: string } | null {
  if (!sr) return null
  const levers: any[] = sr.levers ?? []
  const cmd = levers.find((l) => l.kind === 'command_filtering' && l.removedPct != null)
  if (cmd) return { pct: cmd.removedPct, activity: cmd.activity, unit: cmd.activityUnit ?? 'commands', what: 'command output' }
  const other = levers.filter((l) => l.removedPct != null).sort((a, b) => b.removedPct - a.removedPct)[0]
  if (other) return { pct: other.removedPct, activity: other.activity, unit: other.activityUnit ?? '', what: other.lever }
  return null
}

/** The one result block every card and page leads with. */
export function headline(p: any): Headline {
  const b = p.benchmark
  if (p.measured) {
    // Reserved for RTK's own CI numbers (phase 2). Shape mirrors the benchmark block.
    const m = p.measured
    const d = delta(m.baseline, m.pipeline)
    return {
      evidence: 'measured', evidenceLabel: EVIDENCE_LABEL.measured, kind: 'output', kindLabel: KIND_LABEL.output,
      value: d == null ? null : fmtPct(d), unit: m.unit ?? 'tokens', sub: null,
      tone: 'note',
      quality: { text: 'Not measured', tone: 'note', detail: null }, setup: null,
    }
  }
  if (b?.cost) {
    const d = delta(b.cost.baseline, b.cost.pipeline)
    return {
      evidence: 'benchmark', evidenceLabel: EVIDENCE_LABEL.benchmark, kind: 'cost', kindLabel: KIND_LABEL.cost,
      value: d == null ? null : fmtPct(d),
      unit: `per ${b.cost.per ?? 'trial'}`,
      sub: `${fmtUsd(b.cost.baseline)} → ${fmtUsd(b.cost.pipeline)} vs ${b.baseline}`,
      tone: d != null && d < -0.005 ? 'ok' : d != null && d > 0.005 ? 'warn' : 'note',
      quality: qualityVerdict(b.quality),
      setup: benchmarkSetup(b),
    }
  }
  const u = usageLead(p.selfReported)
  if (u) {
    // Smaller tool outputs, not a measurement of what a task costs: never green, never big.
    return {
      evidence: 'usage', evidenceLabel: EVIDENCE_LABEL.usage, kind: 'output', kindLabel: KIND_LABEL.output,
      value: fmtPct(-u.pct / 100), unit: `${u.what} removed`,
      sub: `over ${fmtInt(u.activity)} ${u.unit}${p.selfReported.rtkVersion ? `, rtk ${p.selfReported.rtkVersion}` : ''}`,
      tone: 'note',
      quality: { text: 'Not measured', tone: 'note', detail: null },
      setup: null,
    }
  }
  return {
    evidence: 'none', evidenceLabel: EVIDENCE_LABEL.none, kind: 'none', kindLabel: '',
    value: null, unit: null, sub: null, tone: 'note',
    quality: { text: 'Not measured', tone: 'note', detail: null }, setup: null,
  }
}

/** Sort key for "Biggest saving": evidence tier first, then the saving inside the tier. */
export function impactScore(p: any): number {
  const h = headline(p)
  const base = EVIDENCE_RANK[h.evidence] * 1000
  if (h.evidence === 'benchmark') return base + Math.max(-100, Math.min(100, -(delta(p.benchmark.cost.baseline, p.benchmark.cost.pipeline) ?? 0) * 100))
  if (h.evidence === 'usage') return base + (usageLead(p.selfReported)?.pct ?? 0)
  return base
}

/** Default listing order: strongest evidence, then biggest saving, then stars, then name. */
export function sortPipelines<T extends { stars?: number; name?: string }>(list: T[]): T[] {
  return list
    .map((p, i) => ({ p, i, s: impactScore(p) }))
    .sort((a, b) => b.s - a.s || (b.p.stars ?? 0) - (a.p.stars ?? 0) || String(a.p.name ?? '').localeCompare(String(b.p.name ?? '')) || a.i - b.i)
    .map((x) => x.p)
}

export type AimKey = 'cost' | 'quality' | 'both'
export interface Aim { key: AimKey; label: string }
/**
 * What a visitor would install it for. Compression, delegation and cache
 * alignment cut cost; a pipeline whose only own content is agent guidance
 * is about quality; a benchmark that moves quality up counts as both.
 */
export function aim(p: any): Aim {
  const rules: any[] = p.rules ?? []
  const ext: string[] = p.extends ?? []
  const q = p.benchmark?.quality
  const qualityUp = q ? (q.pipeline - q.baseline) * (q.higherIsBetter === false ? -1 : 1) / Math.max(Math.abs(q.baseline), 1e-9) > 0.05 : false
  const savesTokens = rules.some((r) => /^(compress|delegate|rewrite)/.test(r.does ?? '')) || ext.length > 0
  const guides = (p.textBlocks ?? []).some((b: any) => b.kind === 'directive.text')
  if (qualityUp && savesTokens) return { key: 'both', label: 'Cost and quality' }
  if (!savesTokens && guides) return { key: 'quality', label: 'Guides your agent' }
  if (qualityUp) return { key: 'quality', label: 'Improves quality' }
  return { key: 'cost', label: 'Cuts cost' }
}

export type RequirementKind = 'local-service' | 'api-key' | 'remote-service'
export interface Requirement {
  key: string
  kind: RequirementKind
  /** "Laya", "Anthropic API key" */
  name: string
  /** one sentence a visitor needs before installing */
  what: string
  /** where it runs / what it is billed to */
  detail: string | null
  /** environment variable the pipeline reads */
  env: string | null
  /** maintainer-chosen link, never author-controlled */
  url: string | null
  /** a few words for a compact row: "local decision model on 127.0.0.1" */
  short: string
  tone: Tone
}

/**
 * What we know about the services pipelines talk to. Maintainer-controlled:
 * an unknown provider falls back to its id and the host from the file.
 */
const PROVIDERS: Record<string, { name: string; keyName?: string; what?: string; short?: string; url?: string; local?: boolean }> = {
  anthropic: { name: 'Anthropic', keyName: 'Anthropic API key' },
  openai: { name: 'OpenAI', keyName: 'OpenAI API key' },
  google: { name: 'Google', keyName: 'Google AI API key' },
  mistral: { name: 'Mistral', keyName: 'Mistral API key' },
  groq: { name: 'Groq', keyName: 'Groq API key' },
  openrouter: { name: 'OpenRouter', keyName: 'OpenRouter API key' },
  xai: { name: 'xAI', keyName: 'xAI API key' },
  deepseek: { name: 'DeepSeek', keyName: 'DeepSeek API key' },
  laya: { name: 'Laya', what: 'Open-source local decision model (@receptron/laya). Runs on your machine from Node.js; the pipeline asks it to label tasks and score reads.', short: 'local decision model', url: 'https://github.com/receptron/laya', local: true },
  ollama: { name: 'Ollama', what: 'Local model server on your machine.', short: 'local model server', url: 'https://ollama.com', local: true },
  lmstudio: { name: 'LM Studio', what: 'Local model server on your machine.', short: 'local model server', url: 'https://lmstudio.ai', local: true },
}

export function providerName(provider: string | null | undefined): string {
  if (!provider) return 'Unknown service'
  return PROVIDERS[provider]?.name ?? provider
}

function modelsVia(p: any, upstreamName: string): string[] {
  const e = (p.egress ?? []).find((x: any) => x.name === upstreamName)
  return e?.model ? [modelName(e.model) as string] : []
}

/** Everything a visitor must have before installing, deduplicated, worst first. */
export function requirements(p: any): Requirement[] {
  const out = new Map<string, Requirement>()
  for (const e of p.egress ?? []) {
    const reg = PROVIDERS[e.provider] ?? null
    if (e.local) {
      const key = `local:${e.provider ?? e.host}`
      const name = reg?.name ?? (e.provider ? `${e.provider} (local)` : `A service on ${e.host}`)
      const prev = out.get(key)
      if (prev) continue
      out.set(key, {
        key, kind: 'local-service', name,
        what: reg?.what ?? `A service the author expects on your machine at ${e.host}.`,
        detail: `Runs locally${e.host ? ` on ${e.host}` : ''}${e.apiKeyEnv ? `; token read from ${e.apiKeyEnv}` : ''}.`,
        short: 'runs locally',
        env: e.apiKeyEnv ?? null, url: reg?.url ?? null, tone: 'note',
      })
    } else if (e.custom) {
      const key = `remote:${e.host}`
      if (out.has(key)) continue
      out.set(key, {
        key, kind: 'remote-service', name: `${providerName(e.provider)} at ${e.host}`,
        what: 'A server the author chose. Content this pipeline handles is sent there.',
        detail: e.apiKeyEnv ? `Key read from ${e.apiKeyEnv}.` : null,
        short: "author's server",
        env: e.apiKeyEnv ?? e.canonicalEnv ?? null, url: null, tone: 'warn',
      })
    } else {
      const key = `key:${e.provider}`
      const models = modelsVia(p, e.name)
      const prev = out.get(key)
      if (prev) { if (models[0] && !prev.what.includes(models[0])) prev.what = prev.what.replace(/\.$/, '') + `, ${models[0]}.`; continue }
      const env = e.apiKeyEnv ?? e.canonicalEnv ?? null
      out.set(key, {
        key, kind: 'api-key', name: reg?.keyName ?? `${providerName(e.provider)} API key`,
        what: models.length ? `Helper calls run on ${models.join(', ')} and are billed to your account.` : 'Helper calls are billed to your account.',
        detail: env ? `Read from ${env}${e.noncanonicalEnv ? ' (a variable specific to this pipeline)' : ''}.` : null,
        short: '',
        env, url: null, tone: 'note',
      })
    }
  }
  const order: Record<RequirementKind, number> = { 'remote-service': 0, 'local-service': 1, 'api-key': 2 }
  return [...out.values()].sort((a, b) => order[a.kind] - order[b.kind])
}

/** Short form for a list row: "Nothing extra" or "Laya (local) · Anthropic key". */
export function needsSummary(p: any): { items: string[]; tone: Tone; nothing: boolean } {
  const reqs = requirements(p)
  if (!reqs.length) return { items: ['Nothing extra'], tone: 'ok', nothing: true }
  const items = reqs.map((r) => (r.kind === 'local-service' ? `${r.name} (local)` : r.kind === 'api-key' ? r.name.replace(' API key', ' key') : r.name))
  return { items, tone: reqs.some((r) => r.tone === 'warn') ? 'warn' : 'note', nothing: false }
}
