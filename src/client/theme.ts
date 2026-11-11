const KEY = 'theme'
const mq = () => window.matchMedia('(prefers-color-scheme: dark)')

function current(): 'light' | 'dark' {
  const t = document.documentElement.dataset.theme
  if (t === 'light' || t === 'dark') return t
  return mq().matches ? 'dark' : 'light'
}

export function initTheme() {
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]')
  if (!btn) return
  const sync = () => btn.setAttribute('aria-pressed', String(current() === 'dark'))
  sync()
  mq().addEventListener('change', sync)
  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem(KEY, next) } catch {}
    sync()
  })
}
