import { useRef, useEffect, useCallback, type ReactNode } from 'react'
import { isMobile, prefersReducedMotion } from '../../lib/motion'

type Spark = { x: number; y: number; angle: number; startTime: number }

type Props = {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  easing?: 'linear' | 'ease-in' | 'ease-in-out' | 'ease-out'
  extraScale?: number
  children?: ReactNode
}

// Adapted from React Bits (reactbits.dev). Desktop only: coarse-pointer/phones and
// reduced-motion skip the canvas and click handler entirely.
export default function ClickSpark({
  sparkColor = '#d4a03c',
  sparkSize = 11,
  sparkRadius = 18,
  sparkCount = 8,
  duration = 500,
  easing = 'ease-out',
  extraScale = 1,
  children,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const enabled = !isMobile() && !prefersReducedMotion()

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [enabled])

  const ease = useCallback(
    (t: number) => {
      switch (easing) {
        case 'linear':
          return t
        case 'ease-in':
          return t * t
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        default:
          return t * (2 - t)
      }
    },
    [easing],
  )

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let raf: number
    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      sparksRef.current = sparksRef.current.filter((s) => {
        const elapsed = now - s.startTime
        if (elapsed >= duration) return false
        const eased = ease(elapsed / duration)
        const distance = eased * sparkRadius * extraScale
        const len = sparkSize * (1 - eased)
        const x1 = s.x + distance * Math.cos(s.angle)
        const y1 = s.y + distance * Math.sin(s.angle)
        const x2 = s.x + (distance + len) * Math.cos(s.angle)
        const y2 = s.y + (distance + len) * Math.sin(s.angle)
        ctx.strokeStyle = sparkColor
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        return true
      })
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [enabled, sparkColor, sparkSize, sparkRadius, duration, ease, extraScale])

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    const x = e.clientX
    const y = e.clientY
    const now = performance.now()
    for (let i = 0; i < sparkCount; i++) {
      sparksRef.current.push({ x, y, angle: (2 * Math.PI * i) / sparkCount, startTime: now })
    }
  }

  return (
    <div onClick={onClick} style={{ display: 'contents' }}>
      {enabled && (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[70] h-screen w-screen select-none"
        />
      )}
      {children}
    </div>
  )
}
