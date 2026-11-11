import {makeGraph, edgeOpacity, pulseAt, glowAt, T0} from '../lib/graph'

const PAUSE_KEY = 'graph-paused'
const FRAME_MS = 1000 / 30

export function initGraph() {
  const svg = document.getElementById('agent-graph') as SVGSVGElement | null
  const btn = document.querySelector<HTMLButtonElement>('[data-graph-toggle]')
  const label = btn?.querySelector('[data-graph-label]')
  if (!svg || !btn) return
  const g = makeGraph(Number(svg.dataset.seed))
  const edges = Array.from(svg.querySelectorAll<SVGPathElement>('.g-edges path'))
  const pulses = Array.from(svg.querySelectorAll<SVGCircleElement>('.g-pulses circle'))
  const glows = Array.from(svg.querySelectorAll<SVGCircleElement>('.g-glows circle'))
  const amber = g.nodes.filter((n) => n.amber)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

  let userPaused = false
  try { userPaused = localStorage.getItem(PAUSE_KEY) === '1' } catch {}
  let visible = true
  let raf = 0
  let t = T0 // animation clock in seconds; only advances while running
  let last = 0

  const draw = () => {
    g.edges.forEach((e, i) => {
      const o = edgeOpacity(e, t)
      edges[i].setAttribute('opacity', String(o))
      const p = pulseAt(g, e, t, o)
      const c = pulses[i]
      if (p) { c.setAttribute('cx', String(p[0])); c.setAttribute('cy', String(p[1])); c.setAttribute('opacity', String(p[2])) }
      else c.setAttribute('opacity', '0')
    })
    amber.forEach((n, i) => glows[i].setAttribute('opacity', String(glowAt(n, t))))
  }

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    if (!last) { last = now; return }
    const dt = now - last
    if (dt < FRAME_MS) return
    last = now
    t += Math.min(dt, 100) / 1000
    draw()
  }

  const shouldRun = () => !reduce.matches && !userPaused && visible && !document.hidden
  const update = () => {
    btn.hidden = reduce.matches
    btn.setAttribute('data-state', userPaused ? 'paused' : 'playing')
    if (label) label.textContent = userPaused ? 'Play' : 'Pause'
    if (shouldRun()) { if (!raf) { last = 0; raf = requestAnimationFrame(loop) } }
    else if (raf) { cancelAnimationFrame(raf); raf = 0 }
  }

  btn.addEventListener('click', () => {
    userPaused = !userPaused
    try { localStorage.setItem(PAUSE_KEY, userPaused ? '1' : '0') } catch {}
    update()
  })
  reduce.addEventListener('change', update)
  document.addEventListener('visibilitychange', update)
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; update() }, {threshold: 0}).observe(svg)
  update()
}
