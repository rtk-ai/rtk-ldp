/**
 * reveal.ts — Scroll-triggered fade-in for .reveal elements.
 * Uses IntersectionObserver for performance.
 * Adds stagger delay when multiple .reveal siblings share the same parent.
 */
export function initReveal() {
  if (typeof IntersectionObserver === 'undefined') return

  const all = document.querySelectorAll<HTMLElement>('.reveal')

  // Group by direct parent to detect siblings
  const groups = new Map<Element, HTMLElement[]>()
  all.forEach(el => {
    const parent = el.parentElement
    if (!parent) return
    if (!groups.has(parent)) groups.set(parent, [])
    groups.get(parent)!.push(el)
  })

  // Assign stagger delays when 2+ siblings share the same parent
  groups.forEach(siblings => {
    if (siblings.length >= 2) {
      siblings.forEach((el, i) => {
        el.style.transitionDelay = `${i * 80}ms`
      })
    }
  })

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
  )

  all.forEach(el => observer.observe(el))
}
