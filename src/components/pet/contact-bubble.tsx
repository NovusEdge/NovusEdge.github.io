import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { bubbleQueue, type BubbleMode } from '../../lib/pet/footer-machine'
import type { Sprite } from '../../lib/pet/sprite'
import { PixelSprite } from './pixel-sprite'

type Props = {
  ref: Ref<HTMLLIElement>
  sprite: Sprite
  scale: number
  logo: number
  href: string
  newTab: boolean
  label: string
  icon: ReactNode
  mode: BubbleMode
  ready: boolean
  focused: boolean
  onEnter: () => void
  onLeave: () => void
  onFocus: () => void
  onBlur: () => void
}

export function ContactBubble({ ref, sprite, scale, logo, href, newTab, label, icon, mode, ready, focused, onEnter, onLeave, onFocus, onBlur }: Props) {
  const [queue, setQueue] = useState(['grow', 'idle'])
  const shown = useRef<BubbleMode>('normal')
  useEffect(() => {
    // size changes wait until the bubble has finished flying out
    if (!ready || shown.current === mode) return
    setQueue(bubbleQueue(shown.current, mode))
    shown.current = mode
  }, [mode, ready])

  return (
    <li ref={ref} className="footer-bubble absolute left-0 top-0" data-ready={ready} data-focus={focused} style={{ visibility: 'hidden' }}>
      <a
        href={href}
        target={newTab ? '_blank' : undefined}
        rel="noopener noreferrer"
        className="relative block outline-none"
        onPointerEnter={(e) => e.pointerType === 'mouse' && onEnter()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && onLeave()}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <PixelSprite sprite={sprite} clip={queue[0]} scale={scale} className="block" onEnd={() => setQueue((q) => (q.length > 1 ? q.slice(1) : q))} />
        <span className="footer-logo" style={{ width: logo, height: logo }}>
          {icon}
        </span>
        <span className="footer-label">{label}</span>
      </a>
    </li>
  )
}
