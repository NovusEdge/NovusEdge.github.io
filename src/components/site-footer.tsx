import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import { ImageDithering } from '@paper-design/shaders-react'
import { isMobile } from '../lib/motion'

// reusable site footer: Creation-of-Adam hands reaching toward a contact spark,
// with a giant, dimmed, cut-off word behind. Drop it at the bottom of any page.

// the contact card pulls in lottie-backed animated icons; load it only when opened.
const ContactCard = lazy(() => import('./contact-card'))

const HAND_PERF = { minPixelRatio: 1, maxPixelCount: 400_000 }

// a hand, dithered, clipped to its own alpha so the background stays transparent.
// box aspect matches the source so mask 100% fills it and the arm reaches the edge.
// active=false renders a cheap flat-gold silhouette (mask does the shape); the WebGL
// dither only mounts when the footer is near the viewport, and never on phones.
function DitherHand({ src, className = '', active, style = {} }: { src: string; className?: string; active: boolean; style?: CSSProperties }) {
  const mask: CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  }
  return (
    <div className={className} style={active ? { ...mask, ...style } : { ...mask, background: '#d4a03c', ...style }} aria-hidden>
      {active && (
        <ImageDithering
          className="h-full w-full"
          width="100%"
          height="100%"
          {...HAND_PERF}
          image={src}
          colorBack="#141414"
          colorFront="#d4a03c"
        />
      )}
    </div>
  )
}

export function SiteFooter({ word = 'Creation' }: { word?: string }) {
  const [open, setOpen] = useState(false)
  const [near, setNear] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const mobile = useRef(isMobile()).current

  const [handOffset, setHandOffset] = useState(0)

  useEffect(() => {
    if (mobile) return // phones stick with the flat-gold fallback
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [mobile])

  // scroll-driven hand pointing animation
  useEffect(() => {
    if (mobile) return
    const onScroll = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const viewH = window.innerHeight
      // only animate when footer is in view
      if (rect.top < viewH && rect.bottom > 0) {
        const progress = 1 - rect.top / viewH // 0 at top of viewport, 1+ when scrolled past
        const wave = Math.sin(progress * Math.PI * 2) * 12 // oscillate +/- 12px
        setHandOffset(wave)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [mobile])

  const active = near && !mobile
  return (
    <footer
      ref={ref}
      className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-charcoal text-bone"
    >
      {/* hands: stacked vertically on mobile, side-by-side on md+ */}
      <div className="relative z-10 flex h-auto w-full flex-col items-center gap-4 px-6 py-8 md:h-[28vw] md:flex-row md:gap-0 md:p-0">
        <DitherHand
          active={active}
          src="/assets/hand-left.png"
          className="w-[70vw] aspect-[422/257] transition-transform duration-150 md:absolute md:left-0 md:top-1/2 md:w-[47vw] md:-translate-y-1/2"
          style={{ transform: `translateX(${handOffset}px)` }}
        />
        <button
          onClick={() => setOpen(true)}
          aria-label="Get in touch"
          className="group relative z-10 shrink-0 font-body text-6xl font-bold md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
        >
          <span className="animate-neon text-rose-400 group-hover:animate-none group-hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]">
            @
          </span>
          <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-rose-400/30 bg-charcoal-deep px-3 py-1 font-mono text-xs tracking-wider text-rose-400 opacity-0 transition-opacity group-hover:opacity-100">
            get in touch
          </span>
        </button>
        <DitherHand
          active={active}
          src="/assets/hand-right.png"
          className="w-[70vw] aspect-[436/237] transition-transform duration-150 md:absolute md:right-0 md:top-1/2 md:w-[47vw] md:-translate-y-1/2"
          style={{ transform: `translateX(${-handOffset}px)` }}
        />
      </div>

      {/* giant cut-off italic word */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-[5vw] select-none whitespace-nowrap text-center font-display text-[17vw] font-black italic leading-none tracking-[0.06em] text-bone/[0.07]"
      >
        {word}
      </span>

      {open && (
        <Suspense fallback={null}>
          <ContactCard onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </footer>
  )
}
