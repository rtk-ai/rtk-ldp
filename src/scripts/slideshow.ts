/**
 * slideshow.ts — Slideshow logic for DemoSlideshow component.
 * Tabs, dots, prev/next arrows, 7s autoplay, keyboard arrows.
 */
export function initSlideshow() {
  const slides = document.querySelectorAll<HTMLElement>('.slide')
  const tabs = document.querySelectorAll<HTMLButtonElement>('.slide-tab')
  const dots = document.querySelectorAll<HTMLElement>('.dot')
  if (!slides.length) return

  let current = 0
  let autoTimer: ReturnType<typeof setInterval>

  function goTo(idx: number) {
    slides[current].classList.remove('active')
    tabs[current]?.classList.remove('active')
    dots[current]?.classList.remove('active')
    current = idx
    slides[current].classList.add('active')
    tabs[current]?.classList.add('active')
    dots[current]?.classList.add('active')
    resetAuto()
  }

  function next() { goTo((current + 1) % slides.length) }
  function prev() { goTo((current - 1 + slides.length) % slides.length) }

  function resetAuto() {
    clearInterval(autoTimer)
    autoTimer = setInterval(next, 7000)
  }

  tabs.forEach(t => t.addEventListener('click', () => goTo(+(t.dataset.slide ?? '0'))))
  dots.forEach(d => d.addEventListener('click', () => goTo(+(d.dataset.slide ?? '0'))))
  document.querySelector('.slide-next')?.addEventListener('click', next)
  document.querySelector('.slide-prev')?.addEventListener('click', prev)

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  })

  resetAuto()
}
