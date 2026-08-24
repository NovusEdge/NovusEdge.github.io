import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/motion'

// Fixed field of stars behind the Palpatine page. Cheap: each star is a dot
// with a slow twinkle; density scales to the viewport. Reduced motion draws a
// single static frame.
export default function Starfield({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = prefersReducedMotion()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf = 0
    let stars: { x: number; y: number; r: number; base: number; tw: number; sp: number }[] = []

    const build = () => {
      const n = Math.min(420, Math.round((w * h) / 5200))
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.2,
        base: Math.random() * 0.5 + 0.25,
        tw: Math.random() * Math.PI * 2,
        sp: Math.random() * 1.4 + 0.4,
      }))
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      const time = t * 0.001
      for (const s of stars) {
        const a = reduce ? s.base : s.base + 0.35 * Math.sin(time * s.sp + s.tw)
        if (a <= 0.02) continue
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245,242,235,${Math.min(1, a).toFixed(3)})`
        ctx.fill()
      }
      if (!reduce) raf = requestAnimationFrame(draw)
    }

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
      if (reduce) draw(0)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    if (!reduce) raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden />
}
