import {makeGraph, edgePath, edgeOpacity, pulseAt, glowAt, W, H, T0, r1} from '../lib/graph'
import {site} from '../site.config'

/** Prerendered static frame (t = T0). The client island animates these same elements. */
export function AgentGraph() {
  const g = makeGraph(site.graphSeed)
  return (
    <svg
      id="agent-graph"
      className="graph"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      data-seed={site.graphSeed}
    >
      <defs>
        <pattern id="g-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" className="g-dot" />
        </pattern>
        <radialGradient id="g-glow">
          <stop offset="0" stopColor="var(--color-highlight)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--color-highlight)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#g-dots)" className="g-grid" />
      <g className="g-edges" fill="none">
        {g.edges.map((e, i) => (
          <path key={i} d={edgePath(g, e)} opacity={edgeOpacity(e, T0)} className={g.nodes[e.a].amber || g.nodes[e.b].amber ? 'g-edge g-edge--warm' : 'g-edge'} />
        ))}
      </g>
      <g className="g-pulses">
        {g.edges.map((e, i) => {
          const p = pulseAt(g, e, T0, edgeOpacity(e, T0))
          return <circle key={i} r="2.6" cx={p ? p[0] : -10} cy={p ? p[1] : -10} opacity={p ? p[2] : 0} className="g-pulse" />
        })}
      </g>
      <g className="g-glows">
        {g.nodes.filter((n) => n.amber).map((n, i) => (
          <circle key={i} cx={r1(n.x)} cy={r1(n.y)} r={n.r * 5} fill="url(#g-glow)" opacity={glowAt(n, T0)} />
        ))}
      </g>
      <g className="g-nodes">
        {g.nodes.map((n, i) => (
          <circle key={i} cx={r1(n.x)} cy={r1(n.y)} r={r1(n.r)} className={n.amber ? 'g-node g-node--amber' : 'g-node'} />
        ))}
      </g>
    </svg>
  )
}
