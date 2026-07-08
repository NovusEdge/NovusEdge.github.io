import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { animate } from 'animejs'
import { ImageDithering } from '@paper-design/shaders-react'
import { ArrowRight, Mail, X } from './icons'

// reusable site footer: Creation-of-Adam hands reaching toward a contact spark,
// with a giant, dimmed, cut-off word behind. Drop it at the bottom of any page.

const CONTACT = [
  { label: 'engrammic.ai', href: 'https://engrammic.ai' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/aliasgarkhimani/' },
  { label: 'github', href: 'https://github.com/NovusEdge' },
  { label: 'aliasgar.khimani@engrammic.ai', href: 'mailto:aliasgar.khimani@engrammic.ai' },
]

const HAND_PERF = { minPixelRatio: 1, maxPixelCount: 400_000 }

function ContactCard({ onClose }: { onClose: () => void }) {
  const backdrop = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  useEffect(() => {
    animate(backdrop.current!, { opacity: [0, 1], duration: 250, ease: 'out(2)' })
    animate(card.current!, { opacity: [0, 1], scale: [0.9, 1], translateY: [16, 0], duration: 420, ease: 'outBack' })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
      <div ref={backdrop} className="absolute inset-0 bg-charcoal/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl border border-bone/15 bg-charcoal/95 p-8 shadow-[0_30px_80px_rgb(0,0,0,0.5)]"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl font-black text-bone">let's talk.</h2>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
              aliasgar khimani · finland
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-bone/50 transition-colors hover:text-gold"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-2.5">
          {CONTACT.map((c) => (
            <a
              key={c.href}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3 rounded-lg border border-bone/10 bg-bone/[0.02] px-4 py-3 font-mono text-xs uppercase tracking-wider text-bone/70 transition-colors hover:border-gold hover:text-gold"
            >
              <span className="truncate">{c.label}</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

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

      {open && <ContactCard onClose={() => setOpen(false)} />}
    </footer>
  )
}
