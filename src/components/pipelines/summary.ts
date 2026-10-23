/**
 * summary.ts — plain-language layer over a pipelines.json entry.
 * Everything here is derived from the reviewed file by the bot (rules,
 * upstreams, text blocks); nothing comes from author-written prose.
 * Pure string building: no DOM, no markup.
 */

export type Tone = 'ok' | 'note' | 'warn'
export interface Fact {
  key: 'data' | 'needs' | 'agent'
  label: string
  value: string
  detail?: string
  tone: Tone
  anchor?: string
}
interface Rule { position: string | null; does: string | null; when: string | null }

const SUBJECT: Record<string, string> = {
  read: 'file reads', write: 'file writes', edit: 'edits', shell: 'shell commands', search: 'searches',
  web: 'web fetches', subagent: 'sub-agent calls', mcp: 'MCP calls', any: 'every tool call',
}
const SUBJECT_ONE: Record<string, string> = {
  read: 'a file read', write: 'a file write', edit: 'an edit', shell: 'a shell command', search: 'a search',
  web: 'a web fetch', subagent: 'a sub-agent call', mcp: 'an MCP call', any: 'any tool call',
}
const PROXY_PART: Record<string, string> = {
  tool_result: 'tool results', tool_use: 'tool calls', assistant: 'assistant turns', user: 'user turns',
  system: 'the system prompt', tools: 'tool definitions', model: 'the model name', cache: 'cache settings', any: 'every request',
}
const PROVIDER: Record<string, string> = { anthropic: 'Anthropic', openai: 'OpenAI', google: 'Google', laya: 'Laya' }

/** Human names for the built-in presets a pipeline can build on. */
const BUILTIN: Record<string, string> = {
  'rtk:default': "RTK's default pipeline",
  'rtk:posthook': "RTK's standard output compression",
  'rtk:proxy': "RTK's proxy-side compression",
  'rtk:delegate-reads': "RTK's large-read delegation",
  'rtk:verbatim-diffs': "RTK's verbatim diffs",
  'rtk:terse': "RTK's terse mode",
}
export function builtinName(id: string): string {
  return BUILTIN[id] ?? id
}

function splitPosition(position: string | null): { phase: string; subject: string } {
  const [phase = '', subject = ''] = (position ?? '').split(/\s+/)
  return { phase, subject }
}
function subjectOf(position: string | null): string {
  const { phase, subject } = splitPosition(position)
  if (phase === 'proxy') return PROXY_PART[subject] ?? subject
  return SUBJECT[subject] ?? subject
}

/** "before read" → "Before a file read"; "proxy tool_result" → "On tool results sent to the model". */
export function whenLabel(position: string | null): string {
  const { phase, subject } = splitPosition(position)
  if (phase === 'before') return `Before ${SUBJECT_ONE[subject] ?? subject}`
  if (phase === 'after') return `After ${SUBJECT_ONE[subject] ?? subject}`
  if (phase === 'proxy') return `On ${PROXY_PART[subject] ?? subject} sent to the model`
  return position ?? ''
}

type Kind = 'route' | 'deny' | 'rewrite' | 'passthrough' | 'compress'
function kindOf(does: string | null): Kind {
  const d = (does ?? '').trim()
  if (d.startsWith('delegate')) return 'route'
  if (d === 'block') return 'deny'
  if (d.startsWith('rewrite')) return 'rewrite'
  if (d === 'passthrough') return 'passthrough'
  return 'compress'
}
function taskOf(does: string | null): string | null {
  return (does ?? '').match(/^delegate\s*->\s*(\S+)/)?.[1] ?? null
}

function list(items: string[], word = 'and'): string {
  const u = [...new Set(items.filter(Boolean))]
  if (u.length <= 1) return u[0] ?? ''
  if (u.length === 2) return `${u[0]} ${word} ${u[1]}`
  return `${u.slice(0, -1).join(', ')} ${word} ${u[u.length - 1]}`
}

function providerName(e: any): string {
  return PROVIDER[e?.provider] ?? e?.provider ?? 'an upstream model'
}

/** Where a task sends content: "Anthropic (claude-haiku-5-5)" or "a local service". */
function taskDestination(p: any, taskName: string | null): string | null {
  if (!taskName) return null
  const t = (p.tasks ?? []).find((x: any) => x.name === taskName)
  if (!t) return null
  const e = (p.egress ?? []).find((x: any) => x.name === t.upstream)
  const kind = t.kind === 'summarize' ? 'summarised' : t.kind === 'digest' ? 'digested' : t.kind ? String(t.kind) : 'handled'
  if (!e) return `${kind} by a worker model`
  if (e.local) return `${kind} by a local service on ${e.host ?? 'your machine'}`
  return `${kind} by ${providerName(e)}${e.model ? ` (${e.model})` : ''}`
}

/** "delegate -> bulk-read" → "hands it to the bulk-read task, summarised by Anthropic (claude-haiku-5-5)". */
export function actionSentence(p: any, does: string | null): string {
  const d = (does ?? '').trim()
  const task = taskOf(d)
  if (task) {
    const dest = taskDestination(p, task)
    return dest ? `hands it to the ${task} task, ${dest}` : `hands it to the ${task} task`
  }
  if (d === 'block') return 'blocks it'
  if (d === 'passthrough') return 'leaves the output uncompressed'
  if (/^rewrite\s*->\s*rtk/.test(d)) return 'runs the command through rtk'
  const m = d.match(/^compress\s*\[(.*)\]/)
  if (m) return m[1] ? `compresses the output (${m[1]})` : 'compresses the output'
  return d || 'applies'
}

/** Turn "file_lines_gt=350, whole_file=true, score.need_lte=0.65" into readable fragments. */
export function humanConditions(when: string | null): string[] {
  if (!when) return []
  const out: string[] = []
  // split on commas that are not inside quotes or brackets
  const parts: string[] = []
  let cur = '', depth = 0, q = false
  for (let i = 0; i < when.length; i++) {
    const ch = when[i]
    if (ch === '"' && when[i - 1] !== '\\') q = !q
    if (!q && ch === '[') depth++
    if (!q && ch === ']') depth--
    if (ch === ',' && !q && depth === 0) { parts.push(cur); cur = '' } else cur += ch
  }
  if (cur.trim()) parts.push(cur)
  for (const raw of parts) {
    const m = raw.trim().match(/^([a-z_.]+?)(?:_(gt|gte|lt|lte|in|matches|eq|ne))?=(.*)$/i)
    if (!m) { out.push(raw.trim()); continue }
    const [, key, op, val] = m
    const n = val.replace(/^"|"$/g, '')
    const cmp = op === 'gt' ? 'over' : op === 'gte' ? 'at least' : op === 'lt' ? 'under' : op === 'lte' ? 'at most' : ''
    if (key === 'file_lines') out.push(`the file is ${cmp} ${n} lines`)
    else if (key === 'output_lines') out.push(`the output is ${cmp} ${n} lines`)
    else if (key === 'output_bytes') out.push(`the output is ${cmp} ${n} bytes`)
    else if (key === 'whole_file') out.push(n === 'true' ? 'the whole file is read' : 'only part of the file is read')
    else if (key.startsWith('score.')) out.push(`the ${key.slice(6)} decision step scores ${cmp} ${n}`)
    else if (key.startsWith('class.')) out.push(`the task was labelled ${list(n.replace(/[\[\]"]/g, '').split(/\s*,\s*/), 'or')}`)
    else if (key === 'command') out.push('the command matches a pattern')
    else if (key === 'recent_calls') out.push('the recent calls match a pattern')
    else if (key === 'path') out.push('the path matches a pattern')
    else out.push(`${key.replace(/_/g, ' ')} ${op ? cmp || op : 'is'} ${n}`.trim())
  }
  return out
}

export interface RuleSentence { when: string; conditions: string[]; action: string; raw: string | null }
export function ruleSentence(p: any, r: Rule): RuleSentence {
  return { when: whenLabel(r.position), conditions: humanConditions(r.when), action: actionSentence(p, r.does), raw: r.when }
}

export interface OverrideSentence { verb: string; target: string; builtin: string | null; tail: string; control: boolean }
export function overrideSentence(o: any): OverrideSentence {
  const keys: string[] = o.keys ?? []
  const toggle = keys.length === 1 && keys[0] === 'enabled'
  return {
    verb: toggle ? 'Switches the built-in rule' : 'Changes the built-in rule',
    target: String(o.target),
    builtin: o.targetBuiltin ?? null,
    tail: toggle ? 'on or off' : `(${list(keys)})`,
    control: !!o.touchesControl,
  }
}

/**
 * One derived sentence: "Delegates file reads and shell commands to a worker
 * model, and briefs your agent." Falls back to the built-in it enables.
 */
export function oneLiner(p: any): string {
  const rules: Rule[] = p.rules ?? []
  const ext: string[] = p.extends ?? []
  const briefs = (p.textBlocks ?? []).some((b: any) => b.kind === 'directive.text')
  const changed = (p.overrides ?? []).length
  if (rules.length === 0) {
    const base = ext.length
      ? `Turns on ${list(ext.map(builtinName))}${changed ? ` with ${changed} built-in rule${changed === 1 ? '' : 's'} changed` : ''}. Adds nothing else`
      : 'Adds no rules of its own'
    return briefs ? `${base}, but briefs your agent.` : `${base}.`
  }
  const by: Record<Kind, string[]> = { route: [], deny: [], rewrite: [], passthrough: [], compress: [] }
  for (const r of rules) by[kindOf(r.does)].push(subjectOf(r.position))
  const clauses: string[] = []
  if (by.route.length) clauses.push(`sends ${list(by.route)} to a worker model`)
  if (by.deny.length) clauses.push(`blocks some ${list(by.deny)}`)
  if (by.rewrite.length) clauses.push(`rewrites ${list(by.rewrite)} through rtk`)
  if (by.compress.length) clauses.push(`compresses ${list(by.compress)} output`)
  if (by.passthrough.length) clauses.push(`skips compression on some ${list(by.passthrough)}`)
  if (briefs) clauses.push('briefs your agent')
  const s = clauses.length > 1 ? `${clauses.slice(0, -1).join(', ')}, and ${clauses[clauses.length - 1]}` : clauses[0]
  return s.charAt(0).toUpperCase() + s.slice(1) + '.'
}

/** Second sentence for the detail page: what built-ins it builds on, if it has rules of its own. */
export function basedOn(p: any): string | null {
  const ext: string[] = p.extends ?? []
  if (!ext.length || !(p.rules ?? []).length) return null
  return `On top of ${list(ext.map(builtinName))}.`
}

function hostLabel(e: any): string {
  return e.host ? String(e.host) : 'a custom host'
}

/** Three trust facts, in the order a visitor asks them. */
export function facts(p: any): Fact[] {
  const egress: any[] = p.egress ?? []
  const remote = egress.filter((e) => !e.local)
  const local = egress.filter((e) => e.local)
  const custom = remote.filter((e) => e.custom)
  const localNote = local.length ? `a local service on ${list(local.map(hostLabel))}` : null

  let data: Fact
  if (egress.length === 0) {
    data = { key: 'data', label: 'Sends your content to', value: 'Nothing. It stays on your machine', tone: 'ok' }
  } else if (remote.length === 0) {
    data = { key: 'data', label: 'Sends your content to', value: `Only ${localNote}`, tone: 'ok', anchor: 'data' }
  } else if (custom.length > 0) {
    data = { key: 'data', label: 'Sends your content to', value: `${list(custom.map(hostLabel))}, a server the author chose`, detail: localNote ? `Plus ${localNote}` : undefined, tone: 'warn', anchor: 'data' }
  } else {
    const names = remote.map((e) => `${providerName(e)}${e.model ? ` (${e.model})` : ''}`)
    data = { key: 'data', label: 'Sends your content to', value: list(names), detail: localNote ? `Plus ${localNote}` : undefined, tone: 'note', anchor: 'data' }
  }

  const env: string[] = p.envVars ?? []
  const needs: Fact = env.length
    ? { key: 'needs', label: 'API keys it reads', value: env.join(', '), tone: 'note', anchor: 'data' }
    : { key: 'needs', label: 'API keys it reads', value: 'None', tone: 'ok' }

  const blocks: any[] = p.textBlocks ?? []
  const toAgent = blocks.filter((b) => isAgentFacing(b.kind)).length
  const toHelpers = blocks.length - toAgent
  let agent: Fact
  if (blocks.length === 0) agent = { key: 'agent', label: 'Talks to your agent', value: 'No', tone: 'ok' }
  else if (toAgent === 0) agent = { key: 'agent', label: 'Talks to your agent', value: `No. ${toHelpers} prompt${toHelpers === 1 ? '' : 's'} for helper models only`, tone: 'note', anchor: 'text' }
  else agent = { key: 'agent', label: 'Talks to your agent', value: `Yes, ${toAgent} text${toAgent === 1 ? '' : 's'} your agent will read`, detail: toHelpers ? `Plus ${toHelpers} prompt${toHelpers === 1 ? '' : 's'} for helper models` : undefined, tone: 'warn', anchor: 'text' }

  return [data, needs, agent]
}

/** Three short lines for a card, always present and in the same order. */
export function cardFacts(p: any): { text: string; tone: Tone }[] {
  const [data, needs, agent] = facts(p)
  const egress: any[] = p.egress ?? []
  const remote = egress.filter((e) => !e.local)
  const dataText = egress.length === 0 || remote.length === 0
    ? 'Stays on your machine'
    : remote.some((e) => e.custom) ? `Sends data to ${list(remote.map(hostLabel))}` : `Sends data to ${list(remote.map(providerName))}`
  return [
    { text: dataText, tone: data.tone },
    { text: needs.tone === 'ok' ? 'No API key' : 'Needs an API key', tone: needs.tone },
    { text: agent.tone === 'warn' ? 'Instructs your agent' : agent.tone === 'note' ? 'Prompts helper models only' : "Doesn't talk to your agent", tone: agent.tone },
  ]
}

export function isAgentFacing(kind: string | null): boolean {
  return kind === 'directive.text' || kind === 'rule.message' || (kind ?? '').startsWith('override.')
}

const BLOCK_LABEL: Record<string, string> = {
  'directive.text': 'Standing instruction to your agent',
  'rule.message': 'Message your agent sees when a call is redirected',
  'task.instructions': 'Instructions for a helper model',
  'task.prompt': 'Prompt for a helper model',
  'classifier.instructions': 'Question a decision step asks a model',
  'classifier.labels': 'Possible answers of a decision step',
  'classifier.rubric': 'Scoring guide of a decision step',
}
export function blockLabel(kind: string | null): string {
  if (!kind) return 'Text'
  if (BLOCK_LABEL[kind]) return BLOCK_LABEL[kind]
  if (kind.startsWith('override.')) return `Text set on a built-in rule (${kind.slice(9)})`
  return kind
}

export interface TextGroup { label: string; kind: string; owners: string[]; text: string }
/** Dedupe identical texts and split agent-facing from helper-model prompts. */
export function groupTextBlocks(p: any): { agent: TextGroup[]; helpers: TextGroup[] } {
  const seen = new Map<string, TextGroup>()
  const order: TextGroup[] = []
  for (const b of p.textBlocks ?? []) {
    const k = `${b.kind}\u0000${b.text}`
    const hit = seen.get(k)
    if (hit) { if (!hit.owners.includes(b.owner)) hit.owners.push(b.owner); continue }
    const g: TextGroup = { label: blockLabel(b.kind), kind: b.kind ?? '', owners: [b.owner], text: b.text }
    seen.set(k, g)
    order.push(g)
  }
  return { agent: order.filter((g) => isAgentFacing(g.kind)), helpers: order.filter((g) => !isAgentFacing(g.kind)) }
}

export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatBytes(n: number | null | undefined): string {
  if (n == null) return ''
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`
}

export function lineCount(s: string | null | undefined): number {
  return s ? s.split('\n').length : 0
}
