export function initSlideshow() {
  const slides = document.querySelectorAll<HTMLElement>('.slide')
  const tabs = document.querySelectorAll<HTMLButtonElement>('.slide-tab')
  const dots = document.querySelectorAll<HTMLElement>('.dot')
  const pauseBtn = document.querySelector<HTMLButtonElement>('.slide-pause')
  if (!slides.length) return

  let current = 0
  let autoTimer: ReturnType<typeof setInterval> | null = null
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let isPaused = reducedMotion

  const iconPause = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="6" y1="4" x2="6" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/></svg>'
  const iconPlay = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'

  function updatePauseBtn() {
    if (!pauseBtn) return
    pauseBtn.setAttribute('aria-label', isPaused ? 'Play slideshow' : 'Pause slideshow')
    pauseBtn.innerHTML = isPaused ? iconPlay : iconPause
  }

  function goTo(idx: number) {
    slides[current].classList.remove('active')
    tabs[current]?.classList.remove('active')
    dots[current]?.classList.remove('active')
    current = idx
    slides[current].classList.add('active')
    tabs[current]?.classList.add('active')
    dots[current]?.classList.add('active')
    if (!isPaused) resetAuto()
  }

  function next() { goTo((current + 1) % slides.length) }
  function prev() { goTo((current - 1 + slides.length) % slides.length) }

  function startAuto() {
    if (autoTimer) clearInterval(autoTimer)
    autoTimer = setInterval(next, 7000)
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
  }

  function resetAuto() { stopAuto(); startAuto() }

  tabs.forEach(t => t.addEventListener('click', () => goTo(+(t.dataset.slide ?? '0'))))
  dots.forEach(d => d.addEventListener('click', () => goTo(+(d.dataset.slide ?? '0'))))
  document.querySelector('.slide-next')?.addEventListener('click', next)
  document.querySelector('.slide-prev')?.addEventListener('click', prev)

  pauseBtn?.addEventListener('click', () => {
    isPaused = !isPaused
    isPaused ? stopAuto() : startAuto()
    updatePauseBtn()
  })

  document.addEventListener('keydown', e => {
    const target = e.target as HTMLElement
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable) return
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  })

  updatePauseBtn()
  if (!reducedMotion) startAuto()
}
