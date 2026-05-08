/**
 * search.ts — Client-side Cmd+K search engine for RTK landing.
 * No external deps, pure TypeScript, fuzzy scoring.
 */

export interface SearchEntry {
  id: string
  title: string
  keywords: string
  category: string
  url: string
  source: 'landing' | 'docs'
}

function score(entry: SearchEntry, query: string): number {
  const q = query.toLowerCase().trim()
  if (!q) return 0

  const title = entry.title.toLowerCase()
  const keywords = entry.keywords.toLowerCase()
  const category = entry.category.toLowerCase()

  if (title === q) return 100
  if (title.startsWith(q)) return 90

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  try {
    if (new RegExp(`\\b${escaped}`).test(title)) return 80
  } catch (_) {}

  if (title.includes(q)) return 70

  const words = q.split(/\s+/).filter(Boolean)
  if (words.length > 1) {
    if (words.every(w => title.includes(w))) return 65
    if (words.every(w => keywords.includes(w))) return 55
  }

  if (keywords.includes(q)) return 50
  if (category.includes(q)) return 40
  if (words.some(w => w.length > 2 && title.includes(w))) return 30
  if (words.some(w => w.length > 2 && keywords.includes(w))) return 20

  return 0
}

function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  if (!query.trim()) return []
  return entries
    .map(entry => ({ entry, s: score(entry, query) }))
    .filter(r => r.s > 0)
    .sort((a, b) => b.s - a.s || a.entry.title.localeCompare(b.entry.title))
    .slice(0, 15)
    .map(r => r.entry)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const EXT_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" aria-hidden="true" style="flex-shrink:0;margin-left:3px;opacity:0.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline stroke-linecap="round" stroke-linejoin="round" points="15 3 21 3 21 9"/><line stroke-linecap="round" stroke-linejoin="round" x1="10" y1="14" x2="21" y2="3"/></svg>`

function renderEmpty(el: HTMLElement): void {
  el.innerHTML = '<li class="search-no-results">Start typing to search…</li>'
}

function renderNoResults(el: HTMLElement, query: string): void {
  el.innerHTML = `<li class="search-no-results">No results for "<strong>${escapeHtml(query)}</strong>"</li>`
}

function renderResults(el: HTMLElement, entries: SearchEntry[]): void {
  el.innerHTML = entries
    .map((entry, i) => {
      const isDocs = entry.source === 'docs'
      const isExternal = entry.url.startsWith('http')
      const CATEGORY_BADGES: Record<string, string> = {
        'Landing': 'HOME',
        'Products': 'PRODUCT',
        'Commands': 'CMD',
        'Docs': 'DOCS',
        'Links': 'LINK',
      }
      const badge = isDocs ? 'DOCS' : (CATEGORY_BADGES[entry.category] ?? entry.category.toUpperCase())
      const badgeStyle = isDocs
        ? 'background:rgba(0,229,153,0.12);color:#00e599;'
        : 'background:rgba(255,255,255,0.06);color:#94a3b8;'
      const icon = isExternal ? EXT_ICON : ''
      return `<li class="search-result-item"
        role="option" aria-selected="false"
        data-index="${i}" data-url="${escapeHtml(entry.url)}"
        data-external="${isExternal}" tabindex="-1">
        <span class="search-result-type">
          <span style="font-size:0.6rem;font-weight:700;padding:0.15rem 0.35rem;border-radius:3px;letter-spacing:0.06em;${badgeStyle}">${badge}</span>
        </span>
        <span class="search-result-title">${escapeHtml(entry.title)}${icon}</span>
        <span class="search-result-category">${escapeHtml(entry.category)}</span>
      </li>`
    })
    .join('')
}

export function initSearch(entries: SearchEntry[]): void {
  const modal = document.getElementById('search-modal')
  const input = document.getElementById('search-input') as HTMLInputElement | null
  const resultsList = document.getElementById('search-results')
  const trigger = document.getElementById('search-trigger')
  const backdrop = document.getElementById('search-backdrop')

  if (!modal || !input || !resultsList) return

  let activeIndex = -1
  let debounceTimer: ReturnType<typeof setTimeout>

  function openModal(): void {
    modal.removeAttribute('hidden')
    modal.setAttribute('aria-hidden', 'false')
    input.value = ''
    input.focus()
    activeIndex = -1
    renderEmpty(resultsList!)
    document.body.style.overflow = 'hidden'
  }

  function closeModal(): void {
    modal.setAttribute('hidden', '')
    modal.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    activeIndex = -1
  }

  function setActive(index: number): void {
    const items = resultsList!.querySelectorAll<HTMLLIElement>('.search-result-item')
    if (!items.length) return
    const idx = Math.max(-1, Math.min(index, items.length - 1))
    items.forEach((item, i) => {
      const active = i === idx
      item.setAttribute('aria-selected', String(active))
      if (active) item.scrollIntoView({ block: 'nearest' })
    })
    activeIndex = idx
  }

  function navigate(item: HTMLElement): void {
    const url = item.dataset.url
    const external = item.dataset.external === 'true'
    if (!url) return
    closeModal()
    if (external) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = url
    }
  }

  function attachHandlers(): void {
    resultsList!.querySelectorAll<HTMLLIElement>('.search-result-item').forEach(item => {
      item.addEventListener('click', () => navigate(item))
      item.addEventListener('mouseenter', () => {
        const idx = parseInt(item.dataset.index ?? '-1', 10)
        if (idx >= 0) setActive(idx)
      })
    })
  }

  function runSearch(query: string): void {
    activeIndex = -1
    if (!query.trim()) { renderEmpty(resultsList!); return }
    const found = searchEntries(entries, query)
    if (!found.length) {
      renderNoResults(resultsList!, query)
    } else {
      renderResults(resultsList!, found)
      attachHandlers()
    }
  }

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => runSearch(input.value.trim()), 50)
  })

  input.addEventListener('keydown', (e: KeyboardEvent) => {
    const items = resultsList!.querySelectorAll<HTMLLIElement>('.search-result-item')
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActive(activeIndex + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (activeIndex <= 0) {
          items.forEach(item => item.setAttribute('aria-selected', 'false'))
          activeIndex = -1
        } else {
          setActive(activeIndex - 1)
        }
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && items[activeIndex]) {
          navigate(items[activeIndex])
        } else if (items.length > 0) {
          navigate(items[0])
        }
        break
      case 'Escape':
        e.preventDefault()
        closeModal()
        break
    }
  })

  backdrop?.addEventListener('click', closeModal)

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      modal.hasAttribute('hidden') ? openModal() : closeModal()
    }
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
      closeModal()
    }
  })

  trigger?.addEventListener('click', () => openModal())
  renderEmpty(resultsList!)
}
