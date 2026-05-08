/**
 * copy.ts — Copy-to-clipboard handler for install code blocks.
 * Attaches click handlers to all [data-copy] buttons.
 */
export function initCopyButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy ?? ''
      try {
        await navigator.clipboard.writeText(text)
        const original = btn.innerHTML
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
        btn.style.color = 'var(--accent)'
        setTimeout(() => {
          btn.innerHTML = original
          btn.style.color = ''
        }, 1500)
      } catch {
        // Fallback for older browsers
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
    })
  })
}
