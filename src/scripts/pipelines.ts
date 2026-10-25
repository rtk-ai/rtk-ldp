/**
 * pipelines.ts — client-side filter/sort for /pipelines/.
 * Works only from data-* attributes Astro escaped at build time; it never
 * builds markup from strings. Without JS the full list is already rendered,
 * and the toolbar itself only exists once the list is long enough.
 */
const PAGE = 24

export function initPipelinesList() {
  const how = document.getElementById('how') as HTMLDetailsElement | null
  const openHow = () => { if (how && location.hash === '#how') how.open = true }
  openHow()
  window.addEventListener('hashchange', openHow)

  const list = document.getElementById('pl-list')
  if (!list) return
  const rows = Array.from(list.querySelectorAll<HTMLElement>('.pl-row'))
  const q = document.getElementById('pl-q') as HTMLInputElement | null
  const sort = document.getElementById('pl-sort') as HTMLSelectElement | null
  const nothing = document.getElementById('pl-nothing') as HTMLInputElement | null
  const bench = document.getElementById('pl-bench') as HTMLInputElement | null
  const aims = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="pl-aim"]'))
  const count = document.getElementById('pl-count')
  const more = document.getElementById('pl-more') as HTMLButtonElement | null
  const moreNote = document.getElementById('pl-more-note')
  const hasControls = Boolean(q || sort || nothing || bench || aims.length)
  if (!hasControls && rows.length <= PAGE) return
  let limit = PAGE

  // The URL carries the view, so a filtered list can be linked: ?q=laya&aim=cost&needs=none&bench=1&sort=stars
  const params = new URLSearchParams(location.search)
  if (q && params.get('q')) q.value = params.get('q') ?? ''
  const aimParam = params.get('aim')
  if (aimParam) aims.forEach((r) => { r.checked = r.value === aimParam })
  if (nothing) nothing.checked = params.get('needs') === 'none'
  if (bench) bench.checked = params.get('bench') === '1'
  if (sort && params.get('sort')) sort.value = params.get('sort') ?? 'score'

  const syncUrl = () => {
    const p = new URLSearchParams()
    const needle = (q?.value ?? '').trim()
    if (needle) p.set('q', needle)
    const aim = aims.find((r) => r.checked)?.value ?? 'all'
    if (aim !== 'all') p.set('aim', aim)
    if (nothing?.checked) p.set('needs', 'none')
    if (bench?.checked) p.set('bench', '1')
    if (sort && sort.value !== 'score') p.set('sort', sort.value)
    const qs = p.toString()
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`)
  }

  const apply = () => {
    const needle = (q?.value ?? '').trim().toLowerCase()
    const aim = aims.find((r) => r.checked)?.value ?? 'all'
    const matches = (r: HTMLElement) => {
      const d = r.dataset
      if (aim === 'cost' && !(d.aim === 'cost' || d.aim === 'both')) return false
      if (aim === 'quality' && !(d.aim === 'quality' || d.aim === 'both')) return false
      if (nothing?.checked && d.nothing !== '1') return false
      if (bench?.checked && !(d.evidence === 'benchmark' || d.evidence === 'measured')) return false
      if (needle && !`${d.id ?? ''} ${d.name ?? ''} ${d.owner ?? ''} ${d.summary ?? ''}`.toLowerCase().includes(needle)) return false
      return true
    }
    const key = sort?.value ?? 'score'
    const val = (r: HTMLElement) =>
      key === 'stars' ? Number(r.dataset.stars ?? 0)
      : key === 'approved' ? (Date.parse(r.dataset.approved ?? '') || 0)
      : Number(r.dataset.score ?? 0)
    const ordered = rows
      .slice()
      .sort((a, b) => val(b) - val(a) || Number(b.dataset.stars ?? 0) - Number(a.dataset.stars ?? 0) || (a.dataset.name ?? '').localeCompare(b.dataset.name ?? ''))
    let total = 0
    for (const r of ordered) {
      list.appendChild(r)
      if (!matches(r)) { r.hidden = true; continue }
      total++
      r.hidden = total > limit
    }
    const visible = Math.min(total, limit)
    const remaining = total - visible
    if (more) { more.hidden = remaining <= 0; more.textContent = `Show ${Math.min(PAGE, remaining)} more` }
    if (moreNote) { moreNote.hidden = total <= PAGE; moreNote.textContent = `Showing ${visible} of ${total}` }
    if (count) count.textContent = `${total} of ${rows.length}`
  }
  for (const el of [q, sort, nothing, bench, ...aims]) {
    el?.addEventListener(el === q ? 'input' : 'change', () => { limit = PAGE; apply(); syncUrl() })
  }
  more?.addEventListener('click', () => { limit += PAGE; apply() })
  apply()
}

/**
 * Detail page: a link to #data, #text, #bench or #file must open the
 * collapsed section it points into, on load and on later hash changes.
 */
export function initPipelineDetail() {
  const reveal = () => {
    const id = location.hash.slice(1)
    if (!id) return
    const target = document.getElementById(id)
    const box = target?.closest('details') as HTMLDetailsElement | null
    if (box && !box.open) box.open = true
    if (target && box) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }))
  }
  reveal()
  window.addEventListener('hashchange', reveal)
}
