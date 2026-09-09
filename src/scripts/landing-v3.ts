/**
 * landing-v3.ts — V3 landing interactions.
 * Everything is opt-in: without JS (or with prefers-reduced-motion, or on small
 * screens for the hero) the page renders its final assembled state. JS adds
 * `.js-anim` and drives animation.
 */

const reduced = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

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

/* ── Count-up helper (shared by hero choreography + static fallback) ── */
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

/* ── Hero: the landing choreography ─────────────────────────────────
   p 0–0.15   title card: big logo + hook dissolve, logo shrinks into the gate
   p 0.14–.64 the transformation plays BIG-SCREEN, centered
   p 0.66–.88 the visual shrinks + docks into its grid slot
   p 0.72+    title/CTAs slide in on the left
   p 0.81+    proof numbers are dealt along the bottom and count up
*/
export function initHeroScroll() {
  // whatever happens below, the pre-paint boot state must not outlive init
  const dropBoot = () => document.documentElement.classList.remove('lp3-boot')
  const hero = document.querySelector<HTMLElement>('[data-hero]')
  if (!hero || reduced()) return dropBoot()
  // Only very short viewports (landscape phones) fall back to the static
  // assembled state — portrait mobile runs the full choreography.
  if (window.matchMedia('(max-height: 560px)').matches) return dropBoot()
  const pin = hero.querySelector<HTMLElement>('[data-pin]')
  const visual = hero.querySelector<HTMLElement>('.lp3-hero-visual')
  if (!pin || !visual) return dropBoot()

  hero.classList.add('js-anim')
  // hand over from the pre-paint boot state (set by the inline <head> script)
  dropBoot()

  // Refresh-replays-the-intro lives in an inline <head> script on the page
  // (LandingPageV3) — it must run before the browser applies scroll
  // restoration; this module runs too late for that.

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

  // Big-screen start: measure the visual's docked slot so the transform can
  // center + enlarge it, then interpolate back to identity while docking.
  // Also measures the gate mark vs. the title-card spacer so the SAME mark
  // can sit at logo size in the card and travel into its slot (one element).
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
  let groupOff = 0 // [gate+clean] group center offset from the visual's center
  let boxSize = 0 // visual box extent along the flow axis
  let isVertical = false // mobile stack vs desktop row
  const rawPanel = hero.querySelector<HTMLElement>('.lp3-panel-raw')
  const cleanPanel = hero.querySelector<HTMLElement>('.lp3-panel-clean')
  const measure = () => {
    const prev = visual.style.transform
    visual.style.transform = 'none'
    hero.style.setProperty('--gms', '1')
    hero.style.setProperty('--gmx', '0px')
    hero.style.setProperty('--gmy', '0px')
    // the glide transform must not pollute the measurements either
    // (resizing after the departure used to corrupt the centering math)
    const flowEl = hero.querySelector<HTMLElement>('.lp3-flow')
    if (flowEl) {
      flowEl.style.setProperty('--fx', '0px')
      flowEl.style.setProperty('--fy', '0px')
      flowEl.style.setProperty('--fs', '1')
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
    visual.style.transform = prev
  }
  // re-measure on viewport changes, inside the frame update (keeps ordering safe)
  let lastW = 0
  let lastH = 0

  // Pointer parallax: the scene tilts a couple of degrees toward the cursor
  // during the big-screen act, damped to zero as the visual docks.
  const flow = hero.querySelector<HTMLElement>('.lp3-flow')
  const stage = hero.querySelector<HTMLElement>('.lp3-hero-stage')
  let dockD = 0
  stage?.addEventListener('pointermove', e => {
    if (!flow) return
    const k = 1 - dockD
    const px = (e.clientX / window.innerWidth - 0.5) * 5 * k
    const py = (0.5 - e.clientY / window.innerHeight) * 4 * k
    flow.style.setProperty('--px', `${px.toFixed(2)}deg`)
    flow.style.setProperty('--py', `${py.toFixed(2)}deg`)
  })
  stage?.addEventListener('pointerleave', () => {
    flow?.style.setProperty('--px', '0deg')
    flow?.style.setProperty('--py', '0deg')
  })

  onScroll(() => {
    if (window.innerWidth !== lastW || window.innerHeight !== lastH) {
      lastW = window.innerWidth
      lastH = window.innerHeight
      measure()
    }

    const total = pin.offsetHeight - window.innerHeight
    const p = total > 0 ? clamp01(-pin.getBoundingClientRect().top / total) : 1

    // cinematic opening: nav recedes while the big-screen act holds the frame
    nav?.classList.toggle('is-hidden', p < 0.02)

    /* ── Act 0: title card dissolves; the gate mark — scaled up to logo size
       at the card's spot — travels into its slot while the machine reveals
       from its dim silhouette. One element, it moves. ── */
    const ip = seg(p, 0.03, 0.15)
    const ipe = easeOut(ip)
    hero.style.setProperty('--introp', ipe.toFixed(3))
    hero.style.setProperty('--introo', (1 - seg(p, 0.07, 0.145)).toFixed(3))
    hero.style.setProperty('--reveal', (0.06 + 0.94 * easeOut(seg(p, 0.02, 0.16))).toFixed(3))
    const gs0 = logoSize / (gateW * s0)
    hero.style.setProperty('--gms', (gs0 + (1 - gs0) * ipe).toFixed(3))
    hero.style.setProperty('--gmx', `${((spacerOffX / s0 - gateOffX) * (1 - ipe)).toFixed(1)}px`)
    hero.style.setProperty('--gmy', `${((spacerOffY / s0 - gateOffY) * (1 - ipe)).toFixed(1)}px`)
    hero.classList.toggle('intro-live', p < 0.15)
    intro?.classList.toggle('gone', p >= 0.16)

    /* ── Act 1: the transformation, full size (q remaps p 0.14–0.64 → 0–1) ── */
    const q = seg(p, 0.14, 0.64)

    // atmosphere brightens with the transformation, settles once docked
    const atmo = (0.45 + 0.55 * seg(q, 0.15, 0.9)) * (1 - 0.25 * seg(p, 0.62, 0.76))
    hero.style.setProperty('--atmo', atmo.toFixed(3))

    for (const el of lines) {
      el.classList.toggle('on', q >= parseFloat(el.dataset.t || '0'))
      const ct = el.dataset.ct
      if (ct) el.classList.toggle('cut', q >= parseFloat(ct))
    }

    // AFTER the dock has seated (two clean beats, never overlapping the
    // dezoom): the raw window dissolves in place, the rest (gate, links,
    // clean window) glides into the freed space, the payoff writes in.
    const rawFade = easeOut(seg(p, 0.8, 0.9))
    hero.style.setProperty('--rawout', rawFade.toFixed(3))
    // the remaining group grows ~15% (desktop) and lands slightly LEFT of the
    // box center (7% bias toward the copy) — a dead-center landing leaves a
    // void between the text and the group on wide screens
    const k = isVertical ? 1 : 1.15
    const fs = 1 + (k - 1) * rawFade
    const bias = isVertical ? 0 : boxSize * 0.07
    const shift = -(groupOff + bias) * fs * rawFade
    flow?.style.setProperty('--fs', fs.toFixed(3))
    flow?.style.setProperty('--fx', isVertical ? '0px' : `${shift.toFixed(1)}px`)
    flow?.style.setProperty('--fy', isVertical ? `${shift.toFixed(1)}px` : '0px')

    gate?.classList.toggle('lit', q >= 0.32)
    const pIn = String(seg(q, 0.26, 0.5))
    const pOut = String(seg(q, 0.44, 0.64))
    const alive = String(1 - rawFade)
    flowIns.forEach(g => {
      g.style.setProperty('--pflow', pIn)
      g.style.setProperty('--alive', alive)
    })
    flowOuts.forEach(g => g.style.setProperty('--pflow', pOut))

    // usage climbs in step with the text-like grid fill
    const raw = Math.round(32 + 54 * easeOut(seg(q, 0, 0.2)))
    if (rawPct) rawPct.textContent = `${raw}% used`
    if (rawMeter) rawMeter.style.width = `${raw}%`

    const cq = seg(q, 0.5, 0.74)
    if (cleanPct && cleanMeter) {
      if (cq === 0) {
        cleanPct.textContent = '—'
        cleanMeter.style.width = '0%'
      } else {
        /* 86% -> 73%. RTK compresses CLI output, which is one slice of the
           window (18% in the 01 chart), not the whole window. Sweeping the
           meter down to 24% would claim RTK empties the context it does not
           touch. Keep in step with initContextViz and v3.hero.visual_sr. */
        const c = Math.round(86 - 13 * easeOut(cq))
        cleanPct.textContent = `${c}% used`
        cleanMeter.style.width = `${c}%`
      }
    }

    /* ── Act 2: the illustration docks into its slot (completes BEFORE the
       raw-dissolve beat so the two motions never compose) ── */
    const d = easeOut(seg(p, 0.62, 0.76))
    dockD = d
    if (d >= 1 && flow) {
      flow.style.setProperty('--px', '0deg')
      flow.style.setProperty('--py', '0deg')
    }
    hero.style.setProperty('--vs', String(s0 + (1 - s0) * d))
    hero.style.setProperty('--vx', `${dx * (1 - d)}px`)
    hero.style.setProperty('--vy', `${dy * (1 - d)}px`)
    hero.style.setProperty('--glowx', `${50 + 16 * d}%`)

    /* ── Act 3: title slides in; the proof is dealt out along the bottom —
       hairline draws, eyebrow appears, then each stat lands at its own
       scroll threshold and counts up. ── */
    const copyOn = p >= 0.7
    if (copyOn && !hero.classList.contains('show-copy')) {
      // sheen the hero CTA once, as it slides in
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

    // the story's epilogue: the Pro chip appears last, above the title
    hero.classList.toggle('pro-on', p >= 0.93)
    hero.classList.toggle('settled', p >= 0.96)
  })
}

/* ── 01 / Problem: CLI-noise bar compresses as you scroll ───────────── */
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
    // 18% → 5% of the window: what RTK removes from CLI output on a bash-heavy
    // session. Fixed rows total 67.5 (3 + 1 + 1 + 0.5 + 62), so the window goes
    // 86% → 73% — out of autocompact territory, which is the actual sell.
    const cli = Math.round(18 - 13 * easeOut(q))
    const used = Math.round(67.5 + cli)
    root.style.setProperty('--cli', `${cli}%`)
    root.style.setProperty('--used', `${used}%`)
    if (cliPct) cliPct.textContent = String(cli)
    if (usedPct) usedPct.textContent = String(used)
    // ≥80% is where Claude Code starts warning about autocompact
    root.classList.toggle('is-full', used >= 80)
    msg?.classList.toggle('on', q > 0.85)
  })
}

/* ── Demo: accessible tabs, content cross-fades ─────────────────────── */
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

/* ── Buttons: the RTK wipe plays once when a primary button reveals ── */
function sweep(el: HTMLElement) {
  el.classList.add('sheen')
  el.addEventListener('animationend', () => el.classList.remove('sheen'), { once: true })
}

export function initButtonSheen() {
  if (reduced() || typeof IntersectionObserver === 'undefined') return
  /* The footer's primary button is excluded. The footer is on every page, so its
     sweep fires on every page, and a highlight that plays everywhere stops
     reading as emphasis. The sweep is for the CTAs that close a story. */
  const els = Array.from(
    document.querySelectorAll<HTMLElement>('.lp3-btn-primary')
  ).filter(el => !el.closest('.lp3-footer'))
  if (!els.length) return
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        // skip buttons hidden by the hero choreography — it sweeps its own
        if (el.checkVisibility && !el.checkVisibility()) return
        io.unobserve(el)
        sweep(el)
      })
    },
    { threshold: 0.9 }
  )
  els.forEach(el => io.observe(el))
}

/* ── Companies marquee.
   The CSS keyframes are the no-JS path. When JS is available we take the drift
   over on the main thread instead: a compositor-run CSS animation and the main
   thread keep separate clocks, so `animation-play-state: paused` on hover snaps
   the row to the main thread's frame — visible as a jump right before it stops.
   Writing the transform ourselves means the rendered position is always the one
   we last wrote, so hovering freezes exactly where the eye last saw it. ── */
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

  // speed stays authored in CSS: one pass per --lp3-marquee-dur
  const measure = () => {
    passW = pass.getBoundingClientRect().width
    const dur = parseFloat(getComputedStyle(track).getPropertyValue('--lp3-marquee-dur')) || 60
    pxPerSec = passW / dur
    if (x <= -passW) x = 0
  }

  const frame = (t: number) => {
    if (!last) last = t
    // a long frame (tab wake, scroll stall) must not teleport the row
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

/* ── Install hook tabs — one panel per agent, arrow-key navigable. ── */
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

/* ── Ecosystem "+N more".
   Progressive enhancement: the markup ships all eight tools, and only once this
   runs does the section become collapsible (`js-collapsible`), so a JS failure
   leaves the full list readable rather than permanently truncated. The collapse
   itself is a CSS concern — it applies on phones only. ── */
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
  /* Labels come from data attributes so they stay translated — the script must
     never author user-visible copy. */
  const moreTpl = btn.dataset.moreLabel ?? '+{n} more'
  const lessTpl = btn.dataset.lessLabel ?? 'Show less'
  label.textContent = moreTpl.replace('{n}', String(extras))

  btn.addEventListener('click', () => {
    const open = row.classList.toggle('expanded')
    btn.setAttribute('aria-expanded', String(open))
    label.textContent = open ? lessTpl : moreTpl.replace('{n}', String(extras))
  })
}

/* ── Proof: crop the portrait screenshot to its neighbour's height, with a
   button to reveal the rest. The crop class is added here, never in the markup,
   so a JS-less reader gets the whole image instead of a truncated one they
   cannot open. ── */
export function initProofCrop() {
  const card = document.querySelector<HTMLElement>('[data-proof-crop]')
  const btn = card?.querySelector<HTMLButtonElement>('.lp3-proof-expand')
  const label = btn?.querySelector<HTMLElement>('.txt')
  if (!card || !btn || !label) return

  /* Labels come from data attributes so they stay translated. */
  const moreTpl = btn.dataset.moreLabel ?? 'Show full screenshot'
  const lessTpl = btn.dataset.lessLabel ?? 'Show less'

  card.classList.add('is-cropped')
  btn.hidden = false
  label.textContent = moreTpl

  btn.addEventListener('click', () => {
    const cropped = card.classList.toggle('is-cropped')
    btn.setAttribute('aria-expanded', String(!cropped))
    label.textContent = cropped ? moreTpl : lessTpl
    /* Collapsing removes several hundred pixels above the fold; keep the card
       in view so the reader is not dropped further down the page. */
    if (cropped) {
      card.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' })
    }
  })
}

/* ── Count up on viewport entry — static fallback only.
   Counters inside the animated hero are triggered by its choreography. ── */
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
