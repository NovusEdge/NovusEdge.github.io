import { useEffect, useRef, type CSSProperties } from 'react'
import { advance, startPlayhead } from '../../lib/pet/player'
import { clipSize, paletteFor, resolveClip, type Frame, type Sprite } from '../../lib/pet/sprite'
import { subscribe } from '../../lib/pet/ticker'

type Props = {
  sprite: Sprite
  clip: string
  variant?: string
  scale?: number
  flip?: boolean
  playing?: boolean
  frame?: number
  onEnd?: () => void
  onStep?: (frames: number, frame: Frame) => void
  className?: string
  style?: CSSProperties
}

const cache = new WeakMap<Sprite, Map<string, HTMLCanvasElement[]>>()

// Each frame is painted once per palette at 1x, then blitted scaled with smoothing off.
function framesFor(sprite: Sprite, clipName: string, variant?: string) {
  let bySprite = cache.get(sprite)
  if (!bySprite) cache.set(sprite, (bySprite = new Map()))
  const key = `${clipName}:${variant ?? ''}`
  const hit = bySprite.get(key)
  if (hit) return hit
  const { clip } = resolveClip(sprite, clipName)
  const { w, h } = clipSize(sprite, clip)
  const pal = paletteFor(sprite, variant)
  const out = clip.frames.map((f) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')!
    f.px.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const col = pal[row[x]]
        if (row[x] === '.' || !col) continue
        ctx.fillStyle = col
        ctx.fillRect(x, y, 1, 1)
      }
    })
    return c
  })
  bySprite.set(key, out)
  return out
}

export function PixelSprite({ sprite, clip, variant, scale = 2, flip, playing = true, frame, onEnd, onStep, className, style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const resolved = resolveClip(sprite, clip)
  const { w, h } = clipSize(sprite, resolved.clip)
  const cb = useRef({ onEnd, onStep })
  cb.current = { onEnd, onStep }

  useEffect(() => {
    const canvas = ref.current!
    const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1))
    canvas.width = w * scale * dpr
    canvas.height = h * scale * dpr
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    const frames = framesFor(sprite, clip, variant)
    const draw = (i: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(frames[i], 0, 0, canvas.width, canvas.height)
    }
    // A clip that is not drawn yet resolves to idle; a one-shot must still end.
    if (resolved.fallback && !sprite.animations[clip]?.loop) queueMicrotask(() => cb.current.onEnd?.())
    let head = startPlayhead()
    if (frame !== undefined || !playing) {
      draw(frame ?? 0)
      return
    }
    draw(0)
    return subscribe((dt) => {
      const next = advance(resolved.clip, head, dt)
      if (next.stepped) {
        draw(next.head.frame)
        cb.current.onStep?.(next.stepped, resolved.clip.frames[next.head.frame])
      }
      if (next.head.done && !head.done) cb.current.onEnd?.()
      head = next.head
    })
  }, [sprite, clip, variant, scale, playing, frame, w, h, resolved.clip, resolved.fallback])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ width: w * scale, height: h * scale, imageRendering: 'pixelated', transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    />
  )
}
