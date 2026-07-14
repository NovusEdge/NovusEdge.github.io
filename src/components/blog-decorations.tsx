import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ImageDithering } from '@paper-design/shaders-react'
import { isMobile } from '../lib/motion'

type Decoration = {
  id: string
  src: string
  side: 'left' | 'right'
  triggerId: string // heading ID to trigger appearance
  offset?: { top?: string; right?: string; bottom?: string; left?: string }
  size?: string // width, e.g. '120px'
}

const PERF = { minPixelRatio: 1, maxPixelCount: 200_000 }

function DitheredDecor({
  src,
  active,
  className = '',
  style = {},
}: {
  src: string
  active: boolean
  className?: string
  style?: CSSProperties
}) {
  const mask: CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  }

  // ponytail: fallback to simple masked gold on mobile/inactive
  if (!active) {
    return <div className={className} style={{ ...mask, background: '#d4a03c', ...style }} aria-hidden />
  }

  return (
    <div className={className} style={{ ...mask, ...style }} aria-hidden>
      <ImageDithering
        className="h-full w-full"
        width="100%"
        height="100%"
        {...PERF}
        image={src}
        colorBack="transparent"
        colorFront="#d4a03c"
      />
    </div>
  )
}

export function BlogDecorations({ decorations }: { decorations: Decoration[] }) {
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const [active, setActive] = useState(false)
  const mobile = useRef(isMobile()).current

  // activate dither when any decoration is visible (lazy load WebGL)
  useEffect(() => {
    if (mobile) return
    const timer = setTimeout(() => setActive(true), 500)
    return () => clearTimeout(timer)
  }, [mobile])

  // track which decorations should be visible based on scroll past their trigger
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    for (const d of decorations) {
      const trigger = document.getElementById(d.triggerId)
      if (!trigger) continue

      const io = new IntersectionObserver(
        ([entry]) => {
          // show when trigger scrolls past top of viewport
          if (entry.boundingClientRect.top < 100) {
            setVisible((prev) => new Set(prev).add(d.id))
          }
        },
        { threshold: 0, rootMargin: '-100px 0px 0px 0px' },
      )
      io.observe(trigger)
      observers.push(io)
    }

    return () => observers.forEach((io) => io.disconnect())
  }, [decorations])

  if (mobile) return null // no decorations on mobile

  return (
    <>
      {decorations.map((d) => {
        const show = visible.has(d.id)
        const posStyle: CSSProperties = {
          position: 'fixed',
          width: d.size || '100px',
          aspectRatio: '1',
          zIndex: 5,
          opacity: show ? 0.7 : 0,
          transition: 'opacity 0.6s ease-out',
          pointerEvents: 'none',
          ...(d.side === 'right'
            ? { right: d.offset?.right || '2rem', left: 'auto' }
            : { left: d.offset?.left || '2rem', right: 'auto' }),
          top: d.offset?.top || '40%',
        }

        return <DitheredDecor key={d.id} src={d.src} active={active && show} style={posStyle} />
      })}
    </>
  )
}
