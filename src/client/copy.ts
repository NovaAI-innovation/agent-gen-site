export function initCopy() {
  const live = document.getElementById('live-region')
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    if (!navigator.clipboard) return
    btn.hidden = false
    btn.addEventListener('click', async () => {
      const code = btn.closest('figure')?.querySelector('pre')?.innerText ?? ''
      try {
        await navigator.clipboard.writeText(code)
        if (live) { live.textContent = ''; setTimeout(() => (live.textContent = 'Copied'), 50) }
        btn.dataset.copied = ''
        setTimeout(() => delete btn.dataset.copied, 1600)
      } catch {
        if (live) live.textContent = 'Copy failed'
      }
    })
  })
}
