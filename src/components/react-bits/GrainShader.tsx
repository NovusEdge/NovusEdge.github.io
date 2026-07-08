import { useEffect, useRef } from 'react'

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
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      updatePattern()

      const pattern = ctx.createPattern(patternCanvas, 'repeat')
      if (pattern) {
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      animationId = requestAnimationFrame(draw)
    }

    draw()

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
