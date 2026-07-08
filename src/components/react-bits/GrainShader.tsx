import { useEffect, useRef } from 'react'
import { isMobile, prefersReducedMotion } from '../../lib/motion'

export default function GrainShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const width = 128
    const height = 128

    const patternCanvas = document.createElement('canvas')
    patternCanvas.width = width
    patternCanvas.height = height
    const pCtx = patternCanvas.getContext('2d')
    if (!pCtx) return

    const imgData = pCtx.createImageData(width, height)
    const data = imgData.data

    const updatePattern = () => {
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255)
        data[i] = val
        data[i + 1] = val
        data[i + 2] = val
        data[i + 3] = 15
      }
      pCtx.putImageData(imgData, 0, 0)
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // pattern references patternCanvas which updates in place, so cache it across frames.
      pattern = ctx.createPattern(patternCanvas, 'repeat')
    }

    let pattern: CanvasPattern | null = null

    const paint = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      updatePattern()
      if (pattern) {
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    resize()
    window.addEventListener('resize', resize)

    // static grain looks identical at rest; skip the loop entirely for reduced-motion + phones.
    if (prefersReducedMotion() || isMobile()) {
      paint()
      return () => window.removeEventListener('resize', resize)
    }

    // ponytail: cap to ~12fps — animated grain at 0.07 opacity reads the same, ~5x less CPU.
    const FRAME_MS = 80
    let last = 0
    const draw = (t: number) => {
      animationId = requestAnimationFrame(draw)
      if (document.hidden || t - last < FRAME_MS) return
      last = t
      paint()
    }
    animationId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-30 opacity-[0.06] dark:opacity-[0.08]"
    />
  )
}
