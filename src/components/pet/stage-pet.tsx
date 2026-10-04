import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../lib/motion'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import { stoatCoat } from '../../lib/pet/season'
import { useStageClaim } from '../../lib/pet/stage'
import { loadStoat, STOAT_SIZE, stoatIfLoaded } from '../../lib/pet/stoat-sprite'
import { PixelSprite } from './pixel-sprite'

// start the fetch with the entry chunk so the sprite is usually there by first paint
if (typeof window !== 'undefined') void loadStoat()

export function StagePet({ clip, scale = 3, className }: { clip: string; scale?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [sprite, setSprite] = useState(stoatIfLoaded)
  const [prefs] = usePetPrefs()
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    void loadStoat().then(setSprite)
  }, [])
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
    <div ref={ref} className={className} style={{ width: STOAT_SIZE.w * scale, height: STOAT_SIZE.h * scale }}>
      {show && sprite && <PixelSprite sprite={sprite} clip={clip} variant={stoatCoat(new Date())} scale={scale} playing={!prefersReducedMotion()} />}
    </div>
  )
}
