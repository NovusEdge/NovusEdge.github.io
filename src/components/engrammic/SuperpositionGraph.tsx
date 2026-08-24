import { useMemo } from 'react'

// Left: a dense grid of faint cells, beliefs smeared across weights in
// superposition. Right: the same information resolved into a provenance graph.
// Sources (small filled dots) feed claims (outlined), claims that survive
// consensus promote into facts (gold); one claim is superseded (dashed, faded).
// Deterministic cell layout (seeded LCG) so it renders identically every mount
// and needs no Math.random.
const INK = '#1c1a17'
const GOLD = '#b8894a'
const CREAM = '#f4f0e6'

function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

type Kind = 'source' | 'claim' | 'fact' | 'stale'
type GNode = { x: number; y: number; kind: Kind }
const NODES: GNode[] = [
  { x: 432, y: 64, kind: 'source' }, // 0
  { x: 436, y: 120, kind: 'source' }, // 1
  { x: 430, y: 176, kind: 'source' }, // 2
  { x: 520, y: 50, kind: 'claim' }, // 3
  { x: 528, y: 112, kind: 'claim' }, // 4
  { x: 514, y: 170, kind: 'claim' }, // 5
  { x: 624, y: 76, kind: 'fact' }, // 6
  { x: 640, y: 142, kind: 'fact' }, // 7
  { x: 600, y: 200, kind: 'stale' }, // 8
]
type Edge = { a: number; b: number; dashed?: boolean }
const EDGES: Edge[] = [
  { a: 0, b: 3 },
  { a: 1, b: 4 },
  { a: 2, b: 5 },
  { a: 3, b: 4 },
  { a: 3, b: 6 },
  { a: 4, b: 6 },
  { a: 4, b: 7 },
  { a: 5, b: 7 },
  { a: 5, b: 8, dashed: true },
]

// pull an edge's endpoint back to the rim of its target node so the arrowhead
// lands on the circle rather than the center.
function endpoint(a: GNode, b: GNode, pad: number) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  return { x: b.x - (dx / len) * pad, y: b.y - (dy / len) * pad }
}

export default function SuperpositionGraph({ className = '' }: { className?: string }) {
  const cells = useMemo(() => {
    const rand = seeded(7)
    const out: { x: number; y: number; o: number; d: number }[] = []
    const cols = 15
    const rows = 10
    const step = 20
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        out.push({ x: 24 + i * step, y: 20 + j * step, o: 0.06 + rand() * 0.34, d: rand() * 4 })
      }
    }
    return out
  }, [])

  return (
    <svg
      viewBox="0 0 720 244"
      className={className}
      role="img"
      aria-label="A dense grid of superposed weights resolving into a provenance graph of sources, claims, and facts"
      fill="none"
    >
      <defs>
        <marker id="eg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill={INK} fillOpacity={0.45} />
        </marker>
      </defs>
      <style>{`
        @keyframes eg-twinkle { 0%,100% { opacity: var(--o); } 50% { opacity: calc(var(--o) * 0.25); } }
        @keyframes eg-flow { from { stroke-dashoffset: 44; } to { stroke-dashoffset: 0; } }
        @keyframes eg-pulse { 0%,100% { r: 6; opacity: 1; } 50% { r: 7; opacity: 0.9; } }
        @keyframes eg-halo { 0%,100% { r: 10; opacity: 0.28; } 50% { r: 13; opacity: 0; } }
        .eg-cell { animation: eg-twinkle 3.2s ease-in-out infinite; }
        .eg-strand { stroke-dasharray: 4 8; animation: eg-flow 2.4s linear infinite; }
        .eg-fact { animation: eg-pulse 3.6s ease-in-out infinite; }
        .eg-halo { animation: eg-halo 3.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .eg-cell, .eg-strand, .eg-fact, .eg-halo { animation: none; }
        }
      `}</style>

      {/* superposition: smeared cells */}
      {cells.map((c, i) => (
        <rect
          key={i}
          className="eg-cell"
          x={c.x}
          y={c.y}
          width={9}
          height={9}
          rx={1.5}
          fill={INK}
          style={{ ['--o' as string]: c.o, opacity: c.o, animationDelay: `${c.d}s` }}
        />
      ))}

      {/* strands: superposition feeding the sources */}
      {[70, 120, 172].map((y, i) => (
        <path
          key={i}
          className="eg-strand"
          d={`M 320 ${y} C 372 ${y}, 396 ${120 + (i - 1) * 30}, 418 ${64 + i * 56}`}
          stroke={INK}
          strokeOpacity={0.24}
          strokeWidth={1}
        />
      ))}

      {/* provenance edges */}
      {EDGES.map((e, i) => {
        const a = NODES[e.a]
        const b = NODES[e.b]
        const pad = b.kind === 'fact' ? 9 : b.kind === 'stale' ? 7 : 6
        const p = endpoint(a, b, pad)
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={p.x}
            y2={p.y}
            stroke={INK}
            strokeOpacity={e.dashed ? 0.22 : 0.4}
            strokeWidth={1}
            strokeDasharray={e.dashed ? '3 4' : undefined}
            markerEnd={e.dashed ? undefined : 'url(#eg-arrow)'}
          />
        )
      })}

      {/* nodes */}
      {NODES.map((n, i) => {
        if (n.kind === 'source') return <circle key={i} cx={n.x} cy={n.y} r={2.6} fill={INK} fillOpacity={0.55} />
        if (n.kind === 'claim')
          return <circle key={i} cx={n.x} cy={n.y} r={5} fill={CREAM} stroke={INK} strokeWidth={1.4} strokeOpacity={0.7} />
        if (n.kind === 'stale')
          return (
            <circle key={i} cx={n.x} cy={n.y} r={4.5} fill={CREAM} stroke={INK} strokeWidth={1.2} strokeOpacity={0.3} strokeDasharray="2 2" />
          )
        return (
          <g key={i}>
            <circle className="eg-halo" cx={n.x} cy={n.y} r={10} fill={GOLD} />
            <circle className="eg-fact" cx={n.x} cy={n.y} r={6} fill={GOLD} />
          </g>
        )
      })}

      {/* captions */}
      <text x={150} y={238} fill={INK} fillOpacity={0.5} fontSize={15} letterSpacing={1} fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
        weights
      </text>
      <text x={560} y={238} fill={INK} fillOpacity={0.5} fontSize={15} letterSpacing={1} fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
        provenance
      </text>
    </svg>
  )
}
