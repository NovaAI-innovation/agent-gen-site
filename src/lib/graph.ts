// Seeded "live agent graph". Pure functions shared by the prerender (static SVG)
// and the client animation, so the first painted frame and the animation match.

export const W = 800
export const H = 640
/** Time (s) of the prerendered frame; the animation starts from here. */
export const T0 = 6

export interface GNode { x: number; y: number; r: number; amber: boolean; ph: number }
export interface GEdge {
  a: number; b: number
  /** quadratic control point */
  cx: number; cy: number
  /** form/fade cycle */
  period: number; off: number
  /** pulse travel */
  speed: number; poff: number
}
export interface Graph { nodes: GNode[]; edges: GEdge[] }

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeGraph(seed: number, count = 30): Graph {
  const rnd = mulberry32(seed)
  const nodes: GNode[] = []
  let guard = 0
  while (nodes.length < count && guard++ < 5000) {
    // points inside a soft ellipse, min spacing
    const ang = rnd() * Math.PI * 2
    const rad = Math.sqrt(rnd())
    const x = W / 2 + Math.cos(ang) * rad * (W * 0.46)
    const y = H / 2 + Math.sin(ang) * rad * (H * 0.44)
    if (nodes.some((n) => (n.x - x) ** 2 + (n.y - y) ** 2 < 78 ** 2)) continue
    nodes.push({x, y, r: 3 + rnd() * 4.5, amber: false, ph: rnd()})
  }
  // a few "working" amber nodes
  const amberCount = 4
  for (let i = 0; i < amberCount; i++) nodes[Math.floor((i + 0.5) * (nodes.length / amberCount))].amber = true

  const edges: GEdge[] = []
  const seen = new Set<string>()
  nodes.forEach((n, i) => {
    const near = nodes
      .map((m, j) => ({j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2}))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 3)
    for (const {j} of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (seen.has(key)) continue
      seen.add(key)
      const m = nodes[j]
      const mx = (n.x + m.x) / 2, my = (n.y + m.y) / 2
      const dx = m.x - n.x, dy = m.y - n.y
      const bend = (rnd() - 0.5) * 0.5
      edges.push({
        a: i, b: j,
        cx: mx - dy * bend, cy: my + dx * bend,
        period: 16 + rnd() * 18, off: rnd(),
        speed: 0.12 + rnd() * 0.1, poff: rnd() * 10,
      })
    }
  })
  return {nodes, edges}
}

export const r1 = (n: number) => Math.round(n * 10) / 10
const r2 = (n: number) => Math.round(n * 100) / 100

export function edgePath(g: Graph, e: GEdge) {
  const a = g.nodes[e.a], b = g.nodes[e.b]
  return `M${r1(a.x)} ${r1(a.y)}Q${r1(e.cx)} ${r1(e.cy)} ${r1(b.x)} ${r1(b.y)}`
}

/** Edge visibility 0..1 at time t: slow form / hold / dissolve. */
export function edgeOpacity(e: GEdge, t: number) {
  const s = Math.sin(2 * Math.PI * (t / e.period + e.off))
  const v = Math.min(1, Math.max(0, 0.35 + s))
  return r2(v * v * (3 - 2 * v))
}

/** Pulse position along an edge, or null when resting. Returns [x, y, opacity]. */
export function pulseAt(g: Graph, e: GEdge, t: number, edgeO: number): [number, number, number] | null {
  if (edgeO < 0.6) return null
  const cycle = 1 / e.speed + 3 // travel + rest seconds
  const u = (((t + e.poff) % cycle) * e.speed)
  if (u > 1) return null
  const a = g.nodes[e.a], b = g.nodes[e.b]
  const k = 1 - u
  const x = k * k * a.x + 2 * k * u * e.cx + u * u * b.x
  const y = k * k * a.y + 2 * k * u * e.cy + u * u * b.y
  return [r1(x), r1(y), r2(Math.sin(Math.PI * u) * edgeO)]
}

/** Amber "working" glow 0..1, slow (period ~4 s) so it never flashes. */
export function glowAt(n: GNode, t: number) {
  return r2(0.5 + 0.5 * Math.sin(2 * Math.PI * (t / 4 + n.ph)))
}
