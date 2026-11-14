import { useEffect, useRef } from 'react'
import { isMobile, prefersReducedMotion } from '../../lib/motion'

type Bird = { x: number; y: number; vx: number; vy: number }

const LANES = [0.2, 0.4, 0.6, 0.8]
const FREE_MS = 5000
const LANE_MS = 3000
const SPEED = 1.6
const NEIGHBOUR = 55
const POINTER_RADIUS = 90

export function Flock() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !host || !ctx) return

    let reduced = prefersReducedMotion()
    const count = isMobile() ? 70 : 150
    let w = 0
    let h = 0
    let ink = '#141414'
    let birds: Bird[] = []
    let raf = 0
    let last = 0
    let cycle = 0
    let onScreen = true
    const pointer = { x: -1e4, y: -1e4 }

    const readInk = () => {
      ink = getComputedStyle(canvas).getPropertyValue('--fl-ink').trim() || ink
    }
    let boxes: { x0: number; y0: number; x1: number; y1: number }[] = []
    let lanePx: number[] = []
    const laneY = (y: number) => lanePx.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a))

    const measure = () => {
      const o = canvas.getBoundingClientRect()
      boxes = [host.querySelector('h1'), host.querySelector('.fl-hero-bottom > p')].flatMap((el) => {
        if (!el) return []
        const r = el.getBoundingClientRect()
        return [{ x0: r.left - o.left, y0: r.top - o.top, x1: r.right - o.left, y1: r.bottom - o.top }]
      })
      const fractions = LANES.map((l) => l * h)
      if (!reduced) { lanePx = fractions; return }
      // Static frame only: lanes go in the vertical gaps between text boxes, not through the type.
      const cand: number[] = []
      for (let y = 10; y < h - 10; y += 14) {
        if (!boxes.some((b) => y > b.y0 - 10 && y < b.y1 + 10)) cand.push(y)
      }
      lanePx = cand.length >= LANES.length
        ? LANES.map((_, i) => cand[Math.round((i * (cand.length - 1)) / (LANES.length - 1))])
        : cand.length ? cand : fractions
    }

    const spawn = () => {
      birds = Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2
        const x = Math.random() * w
        const y = reduced ? laneY(Math.random() * h) + (Math.random() - 0.5) * 10 : Math.random() * h
        return reduced ? { x, y, vx: SPEED, vy: 0 } : { x, y, vx: Math.cos(a) * SPEED, vy: Math.sin(a) * SPEED }
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = ink
      for (const b of birds) {
        ctx.globalAlpha = boxes.some((r) => b.x > r.x0 && b.x < r.x1 && b.y > r.y0 && b.y < r.y1) ? 0.15 : 0.55
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(Math.atan2(b.vy, b.vx))
        ctx.beginPath()
        ctx.moveTo(6, 0)
        ctx.lineTo(-4, 3.5)
        ctx.lineTo(-2, 0)
        ctx.lineTo(-4, -3.5)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      ctx.globalAlpha = 1
    }

    const step = (lanes: boolean) => {
      for (const b of birds) {
        let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0
        for (const o of birds) {
          if (o === b) continue
          const dx = o.x - b.x
          const dy = o.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > NEIGHBOUR * NEIGHBOUR) continue
          n++
          ax += o.vx; ay += o.vy; cx += o.x; cy += o.y
          if (d2 < 18 * 18) { sx -= dx; sy -= dy }
        }
        if (n) {
          b.vx += (ax / n - b.vx) * 0.05 + (cx / n - b.x) * 0.0012 + sx * 0.004
          b.vy += (ay / n - b.vy) * 0.05 + (cy / n - b.y) * 0.0012 + sy * 0.004
        }
        if (lanes) {
          b.vy += (laneY(b.y) - b.y) * 0.004
          b.vx += (SPEED - b.vx) * 0.04
        }
        const px = b.x - pointer.x
        const py = b.y - pointer.y
        const pd = Math.hypot(px, py)
        if (pd < POINTER_RADIUS && pd > 0) {
          const f = (1 - pd / POINTER_RADIUS) * 0.35
          b.vx += (px / pd) * f
          b.vy += (py / pd) * f
        }
        const s = Math.hypot(b.vx, b.vy) || 1
        const target = Math.min(Math.max(s, SPEED * 0.7), SPEED * 1.25)
        b.vx = (b.vx / s) * target
        b.vy = (b.vy / s) * target
        b.x = (b.x + b.vx + w) % w
        b.y = (b.y + b.vy + h) % h
      }
    }

    const frame = (t: number) => {
      raf = 0
      if (!onScreen || document.hidden) return
      cycle = (cycle + (last ? t - last : 0)) % (FREE_MS + LANE_MS)
      last = t
      step(cycle > FREE_MS)
      draw()
      raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (reduced || raf || !onScreen || document.hidden) return
      last = 0
      raf = requestAnimationFrame(frame)
    }

    const resize = () => {
      const r = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      measure()
      spawn()
      draw()
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
    }
    const onLeave = () => { pointer.x = pointer.y = -1e4 }

    readInk()
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; start() })
    io.observe(canvas)
    const theme = new MutationObserver(() => {
      readInk()
      const now = prefersReducedMotion()
      if (now !== reduced) {
        reduced = now
        cancelAnimationFrame(raf)
        raf = 0
        measure()
        spawn()
        start()
      }
      draw()
    })
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    document.addEventListener('visibilitychange', start)
    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    start()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      theme.disconnect()
      document.removeEventListener('visibilitychange', start)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="fl-flock" aria-hidden="true" />
}
