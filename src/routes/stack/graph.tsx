import { useEffect, useRef } from 'react'
import { STACK, type Tech } from './data'

type Node = {
  id: string
  label: string
  group: string
  hub: boolean
  tech?: Tech
  text?: boolean // a people/work node with no logo (founder, chaos)
  x: number
  y: number
  vx: number
  vy: number
}

const GOLD = '#d4a03c'

// hubs are focus areas; tools cluster under them, `text` items are logo-less work nodes
const NAME2TECH = new Map(STACK.flatMap((g) => g.items.map((t) => [t.name, t] as const)))
const CLUSTERS: { hub: string; tools: string[]; text: string[] }[] = [
  { hub: 'AI', tools: ['Claude', 'Gemini', 'PyTorch', 'HuggingFace', 'Ollama', 'LangChain', 'Qdrant', 'Neo4j', 'Redis', 'Python'], text: [] },
  { hub: 'the craft', tools: ['Rust', 'Go', 'TypeScript', 'JavaScript', 'Lua', 'C#', 'Linux', 'Docker', 'Neovim', 'Git', 'Postgres'], text: [] },
  { hub: 'web & motion', tools: ['React', 'Tailwind', 'Vite', 'GSAP', 'WebGL', 'WASM'], text: [] },
  { hub: 'hardware', tools: ['ESP32', 'Raspberry Pi', 'Arduino', 'C'], text: [] },
  { hub: 'founder / cto', tools: [], text: ['fundraising', 'strategy', 'hiring', 'roadmap', 'investors'] },
  { hub: 'chaos', tools: [], text: ['palpatine', 'ricing', 'joke repos'] },
]

// concept icons (filled 24x24) for the founder/cto nodes, each with a distinct color
const CONCEPT_TECH = new Map<string, Tech>(
  Object.entries({
    fundraising: { path: 'M11.5 2v2.05A6.5 6.5 0 0 0 6 10.5h2a4.5 4.5 0 0 1 3.5-4.4V12c-3.1.5-5 2.2-5 4.5 0 2.6 2.2 4.5 5 4.95V22h2v-2.05A6.5 6.5 0 0 0 19 13.5h-2a4.5 4.5 0 0 1-3.5 4.4V12c3.1-.5 5-2.2 5-4.5 0-2.6-2.2-4.5-5-4.95V2h-2z', hex: '22C55E' },
    strategy: { path: 'M5 3h1.6v18H5z M7 4h11l-3 3.5 3 3.5H7z', hex: '3B82F6' },
    hiring: { path: 'M12 4.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z M12 12.5c-3.3 0-6 1.9-6 4.7V19h12v-1.8c0-2.8-2.7-4.7-6-4.7z M18.25 3h1.5v5h-1.5z M17 4.75h4v1.5h-4z', hex: 'A855F7' },
    roadmap: { path: 'M3 5h4v4H3z M3 11h4v4H3z M3 17h4v4H3z M9 6h11v2H9z M9 12h11v2H9z M9 18h11v2H9z', hex: '06B6D4' },
    investors: { path: 'M12 3L2 8h20z M4 10h2.5v8H4z M8.5 10h2.5v8H8.5z M13 10h2.5v8H13z M17.5 10h2.5v8h-2.5z M2 19h20v2.5H2z', hex: 'F59E0B' },
  }).map(([name, { path, hex }]): [string, Tech] => [
    name,
    { name, mono: false, icon: { title: name, hex, path } },
  ]),
)

// force constants: bumped for a wider, airier layout
const REPULSION = 3200
const REST_HUB = 300
const REST_SAT = 150
const CENTER_PULL = 0.0007

function build(w: number, h: number) {
  const nodes: Node[] = []
  const edges: [string, string][] = []
  const cx = w / 2
  const cy = h / 2
  CLUSTERS.forEach((c, gi) => {
    const a = (gi / CLUSTERS.length) * Math.PI * 2
    const hx = cx + Math.cos(a) * Math.min(w, h) * 0.26
    const hy = cy + Math.sin(a) * Math.min(w, h) * 0.26
    nodes.push({ id: c.hub, label: c.hub, group: c.hub, hub: true, x: hx, y: hy, vx: 0, vy: 0 })
    const sats = [
      ...c.tools.map((n) => ({ name: n, tech: NAME2TECH.get(n) })),
      ...c.text.map((n) => ({ name: n, tech: CONCEPT_TECH.get(n) })),
    ]
    sats.forEach((s, ti) => {
      const b = a + (ti - sats.length / 2) * 0.3
      nodes.push({
        id: `${c.hub}:${s.name}`,
        label: s.name,
        group: c.hub,
        hub: false,
        tech: s.tech,
        text: !s.tech,
        x: hx + Math.cos(b) * 90,
        y: hy + Math.sin(b) * 90,
        vx: 0,
        vy: 0,
      })
      edges.push([c.hub, `${c.hub}:${s.name}`])
    })
  })
  for (let i = 0; i < CLUSTERS.length; i++) edges.push([CLUSTERS[i].hub, CLUSTERS[(i + 1) % CLUSTERS.length].hub])
  return { nodes, edges }
}

export default function StackGraph() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let W = 0
    let H = 0
    let g = build(1, 1)
    let index = new Map(g.nodes.map((n) => [n.id, n]))
    const paths = new Map<string, Path2D>() // cached icon glyphs (24x24 viewBox)
    const iconOf = (n: Node) => {
      if (!n.tech) return null
      let p = paths.get(n.id)
      if (!p) {
        p = new Path2D(n.tech.icon.path)
        paths.set(n.id, p)
      }
      return p
    }

    const resize = () => {
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      g = build(W, H)
      index = new Map(g.nodes.map((n) => [n.id, n]))
      paths.clear()
    }
    resize()
    window.addEventListener('resize', resize)

    let hover: Node | null = null
    let drag: Node | null = null
    let locked: string | null = null // group locked in focus by a click
    const down = { x: 0, y: 0, moved: false }

    const nearest = (x: number, y: number) => {
      let best: Node | null = null
      let bd = Infinity
      for (const n of g.nodes) {
        const d = (n.x - x) ** 2 + (n.y - y) ** 2
        const r = n.hub ? 40 * 40 : 34 * 34
        if (d < r && d < bd) {
          bd = d
          best = n
        }
      }
      return best
    }
    const rel = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onMove = (e: MouseEvent) => {
      const p = rel(e)
      if (drag) {
        drag.x = p.x
        drag.y = p.y
        drag.vx = drag.vy = 0
        if (Math.hypot(p.x - down.x, p.y - down.y) > 4) down.moved = true
      } else {
        hover = nearest(p.x, p.y)
        canvas.style.cursor = hover ? 'pointer' : 'default'
      }
    }
    const onDown = (e: MouseEvent) => {
      const p = rel(e)
      down.x = p.x
      down.y = p.y
      down.moved = false
      drag = nearest(p.x, p.y)
      if (drag) canvas.style.cursor = 'grabbing'
    }
    const onUp = () => {
      // a click (no meaningful drag) toggles focus lock on the cluster, or clears it
      if (!down.moved) {
        const hit = hover
        locked = hit && locked !== hit.group ? hit.group : null
      }
      drag = null
      canvas.style.cursor = hover ? 'pointer' : 'default'
    }
    const onLeave = () => {
      hover = null
      drag = null
    }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    canvas.addEventListener('mouseleave', onLeave)

    const step = () => {
      const nodes = g.nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          let dx = a.x - b.x
          let dy = a.y - b.y
          const d2 = dx * dx + dy * dy || 0.01
          const rep = REPULSION / d2
          const d = Math.sqrt(d2)
          dx /= d
          dy /= d
          a.vx += dx * rep
          a.vy += dy * rep
          b.vx -= dx * rep
          b.vy -= dy * rep
        }
      }
      for (const [ai, bi] of g.edges) {
        const a = index.get(ai)!
        const b = index.get(bi)!
        const rest = a.hub && b.hub ? REST_HUB : REST_SAT
        let dx = b.x - a.x
        let dy = b.y - a.y
        const d = Math.hypot(dx, dy) || 0.01
        const f = (d - rest) * 0.01
        dx /= d
        dy /= d
        a.vx += dx * f
        a.vy += dy * f
        b.vx -= dx * f
        b.vy -= dy * f
      }
      for (const n of nodes) {
        n.vx += (W / 2 - n.x) * CENTER_PULL
        n.vy += (H / 2 - n.y) * CENTER_PULL
        n.vx *= 0.86
        n.vy *= 0.86
        if (n !== drag) {
          n.x += n.vx
          n.y += n.vy
        }
        n.x = Math.max(24, Math.min(W - 24, n.x))
        n.y = Math.max(24, Math.min(H - 24, n.y))
      }
    }

    const drawIcon = (n: Node, size: number, alpha: number) => {
      const p = iconOf(n)
      if (!p) return
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(n.x - size / 2, n.y - size / 2)
      ctx.scale(size / 24, size / 24)
      ctx.fillStyle = n.tech!.mono ? GOLD : `#${n.tech!.icon.hex}`
      ctx.fill(p)
      ctx.restore()
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H)

      const cx = W / 2
      const cy = H / 2

      // rings emanating outward from the knowledge core (frozen if reduced-motion)
      const maxR = Math.hypot(W, H) / 2
      const spacing = 96
      const born = reduce ? spacing / 2 : (t * 0.02) % spacing
      ctx.lineWidth = 1
      for (let r = born; r < maxR; r += spacing) {
        if (r < 6) continue
        const a = 0.16 * (1 - r / maxR)
        if (a <= 0.003) continue
        ctx.strokeStyle = `rgba(212,160,60,${a})`
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // 知 ("knowledge") floating at the center, tethered to each hub by dotted lines.
      // Purely decorative: not in g.nodes, so no hover/drag/physics.
      ctx.save()
      ctx.setLineDash([2, 7])
      ctx.strokeStyle = 'rgba(212,160,60,0.16)'
      ctx.lineWidth = 1
      for (const n of g.nodes) {
        if (!n.hub) continue
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(n.x, n.y)
        ctx.stroke()
      }
      ctx.setLineDash([])
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `700 ${Math.min(W, H) * 0.26}px "Noto Serif JP", "Hiragino Mincho ProN", serif`
      ctx.fillStyle = 'rgba(212,160,60,0.12)'
      ctx.fillText('知', cx, cy)
      ctx.restore()

      const act = hover?.group ?? locked // focused cluster, if any
      for (const [ai, bi] of g.edges) {
        const a = index.get(ai)!
        const b = index.get(bi)!
        const on = act && (a.group === act || b.group === act) && !(a.hub && b.hub)
        ctx.strokeStyle = on ? 'rgba(212,160,60,0.55)' : `rgba(150,150,150,${act ? 0.05 : 0.14})`
        ctx.lineWidth = on ? 1.5 : 1
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
      for (const n of g.nodes) {
        if (n.hub) continue
        const live = !act || n.group === act
        const isHover = hover === n
        if (live) {
          const focusHere = act === n.group
          if (isHover) {
            ctx.beginPath()
            ctx.arc(n.x, n.y, n.text ? 22 : 36, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(212,160,60,0.12)'
            ctx.fill()
          }
          let off: number
          if (n.text) {
            const r = isHover ? 7 : 5
            ctx.beginPath()
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(212,160,60,0.9)'
            ctx.fill()
            off = r + 15
          } else {
            const size = isHover ? 52 : focusHere ? 34 : 24
            drawIcon(n, size, isHover ? 1 : focusHere ? 0.92 : 0.62)
            off = size / 2 + 14
          }
          if (n.text || isHover || focusHere) {
            ctx.font = '700 11px ui-monospace, monospace'
            ctx.textAlign = 'center'
            ctx.fillStyle = n.text
              ? isHover
                ? 'rgba(212,160,60,1)'
                : 'rgba(212,160,60,0.68)'
              : 'rgba(212,160,60,0.95)'
            ctx.fillText(n.label, n.x, n.y + off)
          }
        } else {
          ctx.fillStyle = 'rgba(150,150,150,0.22)'
          ctx.beginPath()
          ctx.arc(n.x, n.y, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      for (const n of g.nodes) {
        if (!n.hub) continue
        const on = !act || n.group === act
        const isFocus = act === n.group
        ctx.fillStyle = on ? 'rgba(212,160,60,0.95)' : 'rgba(150,150,150,0.25)'
        ctx.beginPath()
        ctx.arc(n.x, n.y, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = on ? 'rgba(212,160,60,0.5)' : 'rgba(150,150,150,0.2)'
        ctx.lineWidth = isFocus ? 2.5 : 1.5
        ctx.beginPath()
        ctx.arc(n.x, n.y, isFocus ? 19 : 16, 0, Math.PI * 2)
        ctx.stroke()
        ctx.font = '700 13px ui-monospace, monospace'
        ctx.fillStyle = on ? 'rgba(212,160,60,0.9)' : 'rgba(150,150,150,0.35)'
        ctx.textAlign = 'center'
        ctx.fillText(n.label + (isFocus && locked === n.group ? ' ·' : ''), n.x, n.y - 24)
      }
    }

    let raf = 0
    const loop = (t: number) => {
      step()
      draw(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-charcoal/[0.07] dark:text-bone/[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:34px_34px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            // soft core glow behind the 知 (the rings themselves are drawn on the canvas)
            'radial-gradient(circle at 50% 50%, rgba(212,160,60,0.10), transparent 58%)',
            // gentle vignette so the edges settle back
            'radial-gradient(circle at 50% 50%, transparent 60%, rgba(20,18,15,0.18) 100%)',
          ].join(', '),
        }}
      />
      <canvas ref={ref} className="relative h-full w-full" />
      <div className="pointer-events-none absolute bottom-6 left-6">
        <h1 className="font-display text-2xl font-black text-charcoal dark:text-bone">技 Stack</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-charcoal/50 dark:text-bone/50">
          hover a node for its logo · click a hub to lock focus · drag to explore
        </p>
      </div>
    </div>
  )
}
