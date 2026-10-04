import { useEffect, useRef, useState } from 'react'
import stoat from '../../assets/sprites/stoat.json'
import { prefersReducedMotion } from '../../lib/motion'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import { stoatCoat } from '../../lib/pet/season'
import type { Sprite } from '../../lib/pet/sprite'
import { useStageClaim } from '../../lib/pet/stage'
import { PixelSprite } from './pixel-sprite'

const SPRITE = stoat as unknown as Sprite

export function StagePet({ clip, scale = 3, className }: { clip: string; scale?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [prefs] = usePetPrefs()
  useEffect(() => setMounted(true), [])
  const show = mounted && prefs.on
  useEffect(() => {
    const el = ref.current
    if (!el || !show || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [show])
  useStageClaim(show && visible)
  // the box is reserved only until mount, so turning the friends off leaves no gap
  if (mounted && !prefs.on) return null
  return (
    <div ref={ref} className={className} style={{ width: SPRITE.w * scale, height: SPRITE.h * scale }}>
      {show && <PixelSprite sprite={SPRITE} clip={clip} variant={stoatCoat(new Date())} scale={scale} playing={!prefersReducedMotion()} />}
    </div>
  )
}
