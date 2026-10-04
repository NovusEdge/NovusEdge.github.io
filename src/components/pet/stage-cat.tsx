import { useEffect, useRef, useState } from 'react'
import cat from '../../assets/sprites/cat.json'
import { prefersReducedMotion } from '../../lib/motion'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import type { Sprite } from '../../lib/pet/sprite'
import { useStageClaim } from '../../lib/pet/stage'
import { PixelSprite } from './pixel-sprite'

const SPRITE = cat as Sprite

export function StageCat({ clip, scale = 3, className }: { clip: string; scale?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [prefs] = usePetPrefs()
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const show = mounted && prefs.on
  useStageClaim(show && visible)
  return (
    <div ref={ref} className={className} style={{ width: SPRITE.w * scale, height: SPRITE.h * scale }}>
      {show && <PixelSprite sprite={SPRITE} clip={clip} variant={undefined} scale={scale} playing={!prefersReducedMotion()} />}
    </div>
  )
}
