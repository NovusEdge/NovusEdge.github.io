import { lazy, Suspense, useState, type CSSProperties } from 'react'
import { ImageDithering } from '@paper-design/shaders-react'
import { Mail } from './icons'

// reusable site footer: Creation-of-Adam hands reaching toward a contact spark,
// with a giant, dimmed, cut-off word behind. Drop it at the bottom of any page.

// the contact card pulls in lottie-backed animated icons; load it only when opened.
const ContactCard = lazy(() => import('./contact-card'))

const HAND_PERF = { minPixelRatio: 1, maxPixelCount: 400_000 }

// a hand, dithered, clipped to its own alpha so the background stays transparent.
// box aspect matches the source so mask 100% fills it and the arm reaches the edge.
function DitherHand({ src, className = '' }: { src: string; className?: string }) {
  const mask: CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  }
  return (
    <div className={className} style={mask} aria-hidden>
      <ImageDithering
        className="h-full w-full"
        width="100%"
        height="100%"
        {...HAND_PERF}
        image={src}
        colorBack="#141414"
        colorFront="#d4a03c"
      />
    </div>
  )
}

export function SiteFooter({ word = 'Creation' }: { word?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <footer className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-charcoal text-bone">
      {/* hands pinned to the screen edges, reaching toward the contact spark */}
      <div className="relative z-10 h-[28vw] w-full">
        <DitherHand
          src="/assets/hand-left.png"
          className="absolute left-0 top-1/2 w-[47vw] -translate-y-1/2 aspect-[422/257]"
        />
        <DitherHand
          src="/assets/hand-right.png"
          className="absolute right-0 top-1/2 w-[47vw] -translate-y-1/2 aspect-[436/237]"
        />
        <button
          onClick={() => setOpen(true)}
          aria-label="Get in touch"
          className="group absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/50 bg-gold/10 text-gold transition-all duration-300 hover:scale-110 hover:bg-gold/20 hover:shadow-[0_0_40px_-6px_rgba(212,160,60,0.7)]"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/20" />
          <Mail className="relative h-5 w-5" />
        </button>
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
