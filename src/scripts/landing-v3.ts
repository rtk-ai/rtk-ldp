
const reduced = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

const varMemo = new WeakMap<HTMLElement, Map<string, string>>()
function setText(el: HTMLElement | null | undefined, value: string) {
  if (el && el.textContent !== value) el.textContent = value
}
function setVar(el: HTMLElement | null | undefined, name: string, value: string) {
  if (!el) return
  let m = varMemo.get(el)
  if (!m) { m = new Map(); varMemo.set(el, m) }
  if (m.get(name) === value) return
  m.set(name, value)
  el.style.setProperty(name, value)
}

function onScroll(update: () => void) {
  let ticking = false
  const request = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      update()
    })
  }
  window.addEventListener('scroll', request, { passive: true })
  window.addEventListener('resize', request)
  update()
}

function animateCount(el: HTMLElement) {
  const final = el.dataset.count || el.textContent || ''
  const m = final.match(/^([\d.,]+)(.*)$/)
  if (!m) return
  const target = parseFloat(m[1].replace(/,/g, ''))
  const decimals = (m[1].split('.')[1] || '').length
  const suffix = m[2]
  const start = performance.now()
  const dur = 900
  const frame = (now: number) => {
    const t = easeOut(clamp01((now - start) / dur))
    el.textContent = `${(target * t).toFixed(decimals)}${suffix}`
    if (t < 1) requestAnimationFrame(frame)
    else el.textContent = final
  }
  requestAnimationFrame(frame)
}

export function initFooterGroups() {
  const cols = Array.from(document.querySelectorAll<HTMLDetailsElement>('.lp3-footer-col'))
  if (!cols.length) return
  const phone = window.matchMedia('(max-width: 700px)')
  const sync = () => cols.forEach(c => { c.open = !phone.matches })
  sync()
  phone.addEventListener('change', sync)
}

export function initHeroProofPlacement() {
  const hero = document.querySelector<HTMLElement>('[data-hero]')
  const proof = document.querySelector<HTMLElement>('[data-hero-proof]')
  const stage = hero?.querySelector<HTMLElement>('.lp3-hero-stage')
  if (!hero || !proof || !stage) return
  const phone = window.matchMedia('(max-width: 760px)')
  const place = () => {
    if (phone.matches) {
      if (proof.parentElement === stage) {
        hero.insertAdjacentElement('afterend', proof)
        proof.classList.add('is-band')
      }
    } else if (proof.parentElement !== stage) {
      stage.appendChild(proof)
      proof.classList.remove('is-band')
    }
  }
  place()
  phone.addEventListener('change', place)
}

export function initHeroIdle() {
  const hero = document.querySelector<HTMLElement>('.lp3-hero')
  if (!hero) return
  if (typeof IntersectionObserver !== 'function') return
  const io = new IntersectionObserver(
    entries => {
      for (const e of entries) hero.classList.toggle('hero-away', !e.isIntersecting)
    },
    { rootMargin: '10% 0px' }
  )
  io.observe(hero)
}

export function initHeroScroll() {
  const dropBoot = () => document.documentElement.classList.remove('lp3-boot')
  const hero = document.querySelector<HTMLElement>('[data-hero]')
  if (!hero || reduced()) return dropBoot()
  const fitsInOneViewport = () => {
    const grid = hero.querySelector<HTMLElement>('.lp3-hero-grid')
    const proof = hero.querySelector<HTMLElement>('.lp3-hero-proofwrap')
    const rawPanelEl = hero.querySelector<HTMLElement>('.lp3-panel-raw')
    if (!grid) return true
    const prev = rawPanelEl?.style.display ?? ''
    if (rawPanelEl) rawPanelEl.style.display = 'none'
    const navEl = document.querySelector<HTMLElement>('.lp3-nav')
    const need = grid.scrollHeight + (proof?.offsetHeight ?? 0) + (navEl?.offsetHeight ?? 64) + 48
    if (rawPanelEl) rawPanelEl.style.display = prev
    return need <= window.innerHeight
  }
  if (!fitsInOneViewport()) return dropBoot()
  const pin = hero.querySelector<HTMLElement>('[data-pin]')
  const visual = hero.querySelector<HTMLElement>('.lp3-hero-visual')
  if (!pin || !visual) return dropBoot()

  hero.classList.add('js-anim')
  dropBoot()

  const lines = Array.from(hero.querySelectorAll<HTMLElement>('[data-t]'))
  const gate = hero.querySelector<HTMLElement>('[data-gate]')
  const flowIns = Array.from(hero.querySelectorAll<SVGGElement>('[data-flow-in]'))
  const flowOuts = Array.from(hero.querySelectorAll<SVGGElement>('[data-flow-out]'))
  const rawPct = hero.querySelector<HTMLElement>('[data-raw-pct]')
  const rawMeter = hero.querySelector<HTMLElement>('[data-raw-meter]')
  const cleanPct = hero.querySelector<HTMLElement>('[data-clean-pct]')
  const cleanMeter = hero.querySelector<HTMLElement>('[data-clean-meter]')
  const statEls = Array.from(hero.querySelectorAll<HTMLElement>('[data-stat]'))
  const nav = document.querySelector<HTMLElement>('.lp3-nav')
  const intro = hero.querySelector<HTMLElement>('[data-intro]')

  const gateCore = hero.querySelector<HTMLElement>('.lp3-gate-core')
  const spacer = hero.querySelector<HTMLElement>('[data-intro-spacer]')
  let dx = 0
  let dy = 0
  let s0 = 1.3
  let gateOffX = 0 // gate-core center offset from the visual's center (natural)
  let gateOffY = 0
  let spacerOffX = 0 // title-card spacer center offset from the viewport center
  let spacerOffY = 0
  let gateW = 96 // rendered gate-mark size (differs on mobile)
  let logoSize = 180 // title-card logo size = the spacer's height
  let cleanBase = 0
  let groupOff = 0 // [gate+clean] group center offset from the visual's center
  let boxSize = 0 // visual box extent along the flow axis
  let isVertical = false // mobile stack vs desktop row
  const rawPanel = hero.querySelector<HTMLElement>('.lp3-panel-raw')
  const cleanPanel = hero.querySelector<HTMLElement>('.lp3-panel-clean')
  const measure = () => {
    const prev = visual.style.transform
    visual.style.transform = 'none'
    setVar(hero, '--gms', '1')
    setVar(hero, '--gmx', '0px')
    setVar(hero, '--gmy', '0px')
    const flowEl = hero.querySelector<HTMLElement>('.lp3-flow')
    if (flowEl) {
      setVar(flowEl, '--fx', '0px')
      setVar(flowEl, '--fy', '0px')
      setVar(flowEl, '--fs', '1')
      setVar(flowEl, '--rawfr', '1fr')
      setVar(flowEl, '--cleanw', '1fr')
    }
    const r = visual.getBoundingClientRect()
    dx = window.innerWidth / 2 - (r.left + r.width / 2)
    dy = window.innerHeight / 2 - (r.top + r.height / 2)
    s0 = Math.min(
      1.55,
      Math.max(1.0, Math.min((window.innerWidth * 0.92) / r.width, (window.innerHeight * 0.72) / r.height))
    )
    if (gateCore && spacer) {
      const gr = gateCore.getBoundingClientRect()
      const sr = spacer.getBoundingClientRect()
      gateOffX = gr.left + gr.width / 2 - (r.left + r.width / 2)
      gateOffY = gr.top + gr.height / 2 - (r.top + r.height / 2)
      spacerOffX = sr.left + sr.width / 2 - window.innerWidth / 2
      spacerOffY = sr.top + sr.height / 2 - window.innerHeight / 2
      gateW = gr.width || 96
      logoSize = sr.height || 180
      if (rawPanel && cleanPanel) {
        const rr = rawPanel.getBoundingClientRect()
        const cp = cleanPanel.getBoundingClientRect()
        isVertical = rr.bottom <= gr.top + 4
        groupOff = isVertical
          ? (gr.top + cp.bottom) / 2 - (r.top + r.height / 2)
          : (gr.left + cp.right) / 2 - (r.left + r.width / 2)
        boxSize = isVertical ? r.height : r.width
      }
    }
    cleanBase = cleanPanel && !isVertical ? Math.round(cleanPanel.offsetWidth) : 0
    if (flowEl) setVar(flowEl, '--cleanw', cleanBase > 0 ? `${cleanBase}px` : '1fr')
    visual.style.transform = prev
  }
  let lastW = 0
  let lastH = 0

  const flow = hero.querySelector<HTMLElement>('.lp3-flow')
  const stage = hero.querySelector<HTMLElement>('.lp3-hero-stage')
  let dockD = 0
  stage?.addEventListener('pointermove', e => {
    if (!flow) return
    const k = 1 - dockD
    const px = (e.clientX / window.innerWidth - 0.5) * 5 * k
    const py = (0.5 - e.clientY / window.innerHeight) * 4 * k
    setVar(flow, '--px', `${px.toFixed(2)}deg`)
    setVar(flow, '--py', `${py.toFixed(2)}deg`)
  })
  stage?.addEventListener('pointerleave', () => {
    setVar(flow, '--px', '0deg')
    setVar(flow, '--py', '0deg')
  })

  onScroll(() => {
    if (window.innerWidth !== lastW || window.innerHeight !== lastH) {
      lastW = window.innerWidth
      lastH = window.innerHeight
      measure()
    }

    const total = pin.offsetHeight - window.innerHeight
    const p = total > 0 ? clamp01(-pin.getBoundingClientRect().top / total) : 1


    const vs0 = isVertical ? 1 : s0
    const vdx = isVertical ? 0 : dx
    const vdy = isVertical ? 0 : dy

    const ip = seg(p, 0.03, 0.15)
    const ipe = easeOut(ip)
    setVar(hero, '--introp', ipe.toFixed(3))
    setVar(hero, '--introo', (1 - seg(p, 0.07, 0.145)).toFixed(3))
    setVar(hero, '--reveal', (0.06 + 0.94 * easeOut(seg(p, 0.02, 0.16))).toFixed(3))
    const gs0 = logoSize / (gateW * vs0)
    setVar(hero, '--gms', (gs0 + (1 - gs0) * ipe).toFixed(3))
    setVar(hero, '--gmx', `${(((dx + spacerOffX - vdx) / vs0 - gateOffX) * (1 - ipe)).toFixed(1)}px`)
    setVar(hero, '--gmy', `${(((dy + spacerOffY - vdy) / vs0 - gateOffY) * (1 - ipe)).toFixed(1)}px`)
    hero.classList.toggle('intro-live', p < 0.15)
    intro?.classList.toggle('gone', p >= 0.16)

    const q = seg(p, 0.14, 0.64)

    const atmo = (0.45 + 0.55 * seg(q, 0.15, 0.9)) * (1 - 0.25 * seg(p, 0.62, 0.76))
    setVar(hero, '--atmo', atmo.toFixed(3))

    for (const el of lines) {
      el.classList.toggle('on', q >= parseFloat(el.dataset.t || '0'))
      const ct = el.dataset.ct
      if (ct) el.classList.toggle('cut', q >= parseFloat(ct))
    }

    const d = easeOut(seg(p, 0.62, 0.76))
    dockD = d

    const endScale = 1
    const endX = 0
    const endY = 0
    if (d >= 1 && flow) {
      setVar(flow, '--px', '0deg')
      setVar(flow, '--py', '0deg')
    }
    const vs = vs0 + (endScale - vs0) * d
    setVar(hero, '--vs', String(vs))
    setVar(hero, '--vx', `${(vdx * (1 - d) + endX * d).toFixed(1)}px`)
    setVar(hero, '--vy', `${(vdy * (1 - d) + endY * d).toFixed(1)}px`)
    setVar(hero, '--glowx', `${50 + 16 * d}%`)

    const rawFade = easeOut(seg(p, 0.54, 0.6))
    setVar(hero, '--rawout', rawFade.toFixed(3))
    setVar(flow, '--rawfr', `${(1 - rawFade).toFixed(3)}fr`)
    setVar(flow, '--rawopen', (1 - rawFade).toFixed(3))

    setVar(flow, '--fs', '1')
    setVar(flow, '--fx', '0px')
    setVar(flow, '--fy', '0px')

    gate?.classList.toggle('lit', q >= 0.32)
    const pIn = String(seg(q, 0.26, 0.5))
    const pOut = String(seg(q, 0.44, 0.64))
    const alive = String(1 - rawFade)
    flowIns.forEach(g => {
      setVar(g, '--pflow', pIn)
      setVar(g, '--alive', alive)
    })
    flowOuts.forEach(g => setVar(g, '--pflow', pOut))

    const raw = Math.round(32 + 54 * easeOut(seg(q, 0, 0.2)))
    if (rawPct) setText(rawPct, `${raw}% used`)
    if (rawMeter) setVar(rawMeter, 'width', `${raw}%`)

    const cq = seg(q, 0.5, 0.74)
    if (cleanPct && cleanMeter) {
      if (cq === 0) {
        setText(cleanPct, '—')
        setVar(cleanMeter, 'width', '0%')
      } else {
        const c = Math.round(86 - 13 * easeOut(cq))
        setText(cleanPct, `${c}% used`)
        setVar(cleanMeter, 'width', `${c}%`)
      }
    }

    const copyOn = p >= 0.7
    if (copyOn && !hero.classList.contains('show-copy')) {
      const btn = hero.querySelector<HTMLElement>('.lp3-hero-cta .lp3-btn-primary')
      if (btn) setTimeout(() => sweep(btn), 500)
    }
    hero.classList.toggle('show-copy', copyOn)
    statEls.forEach((el, i) => {
      const on = p >= 0.78 + i * 0.025
      el.classList.toggle('on', on)
      if (on && !el.dataset.counted) {
        el.dataset.counted = '1'
        const num = el.querySelector<HTMLElement>('[data-count]')
        if (num) animateCount(num)
      }
    })

    hero.classList.toggle('pro-on', p >= 0.93)
    hero.classList.toggle('settled', p >= 0.96)
  })
}

export function initContextViz() {
  const root = document.querySelector<HTMLElement>('[data-ctxviz]')
  if (!root || reduced()) return

  root.classList.add('js-anim')
  const cliPct = root.querySelector<HTMLElement>('[data-cli-pct]')
  const usedPct = root.querySelector<HTMLElement>('[data-used-pct]')
  const msg = root.querySelector<HTMLElement>('[data-ctx-msg]')

  onScroll(() => {
    const rect = root.getBoundingClientRect()
    const vh = window.innerHeight
    const q = clamp01((vh * 0.85 - rect.top) / (vh * 0.6))
    const cli = Math.round(18 - 13 * easeOut(q))
    const used = Math.round(67.5 + cli)
    setVar(root, '--cli', `${cli}%`)
    setVar(root, '--used', `${used}%`)
    if (cliPct) cliPct.textContent = String(cli)
    if (usedPct) usedPct.textContent = String(used)
    root.classList.toggle('is-full', used >= 80)
    msg?.classList.toggle('on', q > 0.85)
  })
}

export function initDemoTabs() {
  const frame = document.querySelector<HTMLElement>('[data-demo]')
  if (!frame) return
  const tabs = Array.from(frame.querySelectorAll<HTMLButtonElement>('[data-demo-tab]'))
  const panes = Array.from(frame.querySelectorAll<HTMLElement>('[data-demo-pane]'))

  function select(index: number) {
    tabs.forEach((tab, i) => {
      const active = i === index
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
    })
    panes.forEach((pane, i) => pane.classList.toggle('active', i === index))
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i))
    tab.addEventListener('keydown', e => {
      let next = -1
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
      if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
      if (next >= 0) {
        e.preventDefault()
        select(next)
        tabs[next].focus()
      }
    })
  })
}

function sweep(el: HTMLElement) {
  el.classList.add('sheen')
  el.addEventListener('animationend', () => el.classList.remove('sheen'), { once: true })
}

export function initButtonSheen() {
  if (reduced() || typeof IntersectionObserver === 'undefined') return
  const els = Array.from(
    document.querySelectorAll<HTMLElement>('.lp3-btn-primary')
  ).filter(el => !el.closest('.lp3-footer'))
  if (!els.length) return
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        if (el.checkVisibility && !el.checkVisibility()) return
        io.unobserve(el)
        sweep(el)
      })
    },
    { threshold: 0.9 }
  )
  els.forEach(el => io.observe(el))
}

export function initMarquee() {
  const view = document.querySelector<HTMLElement>('.lp3-marquee')
  const track = view?.querySelector<HTMLElement>('.lp3-marquee-track')
  const pass = track?.firstElementChild as HTMLElement | null
  if (!view || !track || !pass || reduced()) return

  track.classList.add('js-marquee')

  let passW = pass.getBoundingClientRect().width
  let pxPerSec = 0
  let x = 0
  let last = 0
  let raf = 0
  let paused = false
  let onScreen = true

  const measure = () => {
    passW = pass.getBoundingClientRect().width
    const dur = parseFloat(getComputedStyle(track).getPropertyValue('--lp3-marquee-dur')) || 60
    pxPerSec = passW / dur
    if (x <= -passW) x = 0
  }

  const frame = (t: number) => {
    if (!last) last = t
    const dt = Math.min(0.05, (t - last) / 1000)
    last = t
    x -= pxPerSec * dt
    if (x <= -passW) x += passW
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`
    raf = requestAnimationFrame(frame)
  }

  const start = () => {
    if (raf || paused || !onScreen) return
    last = 0
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    if (!raf) return
    cancelAnimationFrame(raf)
    raf = 0
  }

  measure()
  track.style.transform = 'translate3d(0, 0, 0)'

  view.addEventListener('pointerenter', () => { paused = true; stop() })
  view.addEventListener('pointerleave', () => { paused = false; start() })
  window.addEventListener('resize', () => { measure() })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else start()
  })

  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(
      entries => {
        onScreen = entries[0].isIntersecting
        if (onScreen) start()
        else stop()
      },
      { rootMargin: '200px 0px' }
    ).observe(view)
  } else {
    start()
  }
}

export function initHookTabs() {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-hook-tab]'))
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-hook-panel]'))
  if (!tabs.length || !panels.length) return

  const select = (id: string) => {
    tabs.forEach(t => {
      const on = t.dataset.hookTab === id
      t.classList.toggle('active', on)
      t.setAttribute('aria-selected', String(on))
      t.tabIndex = on ? 0 : -1
    })
    panels.forEach(p => { p.hidden = p.dataset.hookPanel !== id })
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.hookTab ?? ''))
    tab.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      e.preventDefault()
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]
      select(next.dataset.hookTab ?? '')
      next.focus()
    })
  })
}

export function initEcoMore() {
  const row = document.querySelector<HTMLElement>('.lp3-eco-row')
  const btn = document.querySelector<HTMLButtonElement>('.lp3-eco-more')
  const label = btn?.querySelector<HTMLElement>('.txt')
  const section = row?.closest('.lp3-eco')
  if (!row || !btn || !label || !section) return

  const extras = row.querySelectorAll('.lp3-eco-item.is-extra').length
  if (!extras) return

  section.classList.add('js-collapsible')
  btn.hidden = false
  const moreTpl = btn.dataset.moreLabel ?? '+{n} more'
  const lessTpl = btn.dataset.lessLabel ?? 'Show less'
  label.textContent = moreTpl.replace('{n}', String(extras))

  btn.addEventListener('click', () => {
    const open = row.classList.toggle('expanded')
    btn.setAttribute('aria-expanded', String(open))
    label.textContent = open ? lessTpl : moreTpl.replace('{n}', String(extras))
  })
}

export function initProofCrop() {
  const card = document.querySelector<HTMLElement>('[data-proof-crop]')
  const btn = card?.querySelector<HTMLButtonElement>('.lp3-proof-expand')
  const label = btn?.querySelector<HTMLElement>('.txt')
  if (!card || !btn || !label) return

  const moreTpl = btn.dataset.moreLabel ?? 'Show full screenshot'
  const lessTpl = btn.dataset.lessLabel ?? 'Show less'

  card.classList.add('is-cropped')
  btn.hidden = false
  label.textContent = moreTpl

  btn.addEventListener('click', () => {
    const cropped = card.classList.toggle('is-cropped')
    btn.setAttribute('aria-expanded', String(!cropped))
    label.textContent = cropped ? moreTpl : lessTpl
    if (cropped) {
      card.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' })
    }
  })
}

export function initCountUp() {
  if (reduced() || typeof IntersectionObserver === 'undefined') return
  const animatedHero = document.querySelector('[data-hero].js-anim')
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'))
    .filter(el => !animatedHero?.contains(el))
  if (!els.length) return

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target as HTMLElement)
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.4 }
  )
  els.forEach(el => io.observe(el))
}
