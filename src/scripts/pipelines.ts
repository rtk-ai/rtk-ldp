/**
 * pipelines.ts — client-side filter/sort for /pipelines/.
 * Works only from data-* attributes Astro escaped at build time; it never
 * builds markup from strings. Without JS the full list is already rendered,
 * and the toolbar itself only exists once the list is long enough.
 */
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
  if (!q && !sort && !nothing && !bench && aims.length === 0) return

  const apply = () => {
    const needle = (q?.value ?? '').trim().toLowerCase()
    const aim = aims.find((r) => r.checked)?.value ?? 'all'
    let shown = 0
    for (const r of rows) {
      const d = r.dataset
      let ok = true
      if (aim === 'cost' && !(d.aim === 'cost' || d.aim === 'both')) ok = false
      if (ok && aim === 'quality' && !(d.aim === 'quality' || d.aim === 'both')) ok = false
      if (ok && nothing?.checked && d.nothing !== '1') ok = false
      if (ok && bench?.checked && !(d.evidence === 'benchmark' || d.evidence === 'measured')) ok = false
      if (ok && needle && !`${d.id ?? ''} ${d.name ?? ''} ${d.owner ?? ''} ${d.summary ?? ''}`.toLowerCase().includes(needle)) ok = false
      r.hidden = !ok
      if (ok) shown++
    }
    const key = sort?.value ?? 'score'
    const val = (r: HTMLElement) =>
      key === 'stars' ? Number(r.dataset.stars ?? 0)
      : key === 'approved' ? (Date.parse(r.dataset.approved ?? '') || 0)
      : Number(r.dataset.score ?? 0)
    rows
      .slice()
      .sort((a, b) => val(b) - val(a) || Number(b.dataset.stars ?? 0) - Number(a.dataset.stars ?? 0) || (a.dataset.name ?? '').localeCompare(b.dataset.name ?? ''))
      .forEach((r) => list.appendChild(r))
    if (count) count.textContent = `${shown} of ${rows.length}`
  }
  for (const el of [q, sort, nothing, bench, ...aims]) el?.addEventListener(el === q ? 'input' : 'change', apply)
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
