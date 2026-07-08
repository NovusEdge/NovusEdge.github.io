import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import UseAnimations from 'react-useanimations'
import mail from 'react-useanimations/lib/mail'
import twitter from 'react-useanimations/lib/twitter'
import github from 'react-useanimations/lib/github'
import linkedin from 'react-useanimations/lib/linkedin'
import { siHuggingface } from 'simple-icons'
import { ArrowRight, X } from './icons'

// animated contact card. lazy-loaded from the footer so lottie-web only ships
// once someone actually opens it. each logo plays its own motion on hover;
// hugging face has no useAnimations glyph, so it gets a hand-rolled wiggle.

const EMAIL = 'khimanialiasgar@gmail.com'
const ICON = '#e8e4da' // bone-tint, resting

const SOCIALS = [
  { name: 'Twitter', href: 'https://twitter.com/0kaliasgar', anim: twitter },
  { name: 'GitHub', href: 'https://github.com/NovusEdge', anim: github },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/aliasgarkhimani/', anim: linkedin },
]

const tileClass =
  'group flex flex-col items-center gap-2 rounded-xl border border-bone/10 bg-bone/[0.03] px-2 py-3 transition-colors hover:border-gold/40 hover:bg-bone/[0.06]'
const labelClass =
  'font-mono text-[10px] uppercase tracking-wider text-bone/45 transition-colors group-hover:text-gold'

function SocialTile({ name, href, anim }: { name: string; href: string; anim: unknown }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={name} className={tileClass}>
      <UseAnimations animation={anim as never} size={32} strokeColor={ICON} />
      <span className={labelClass}>{name}</span>
    </a>
  )
}

// hugging face: no lottie glyph in the set, so animate the 🤗 mark ourselves on hover
function HuggingTile() {
  const ref = useRef<SVGSVGElement>(null)
  const play = () => {
    if (ref.current)
      animate(ref.current, { rotate: [0, -12, 10, -6, 0], scale: [1, 1.15, 1], duration: 700, ease: 'outElastic(1,.6)' })
  }
  return (
    <a
      href="https://huggingface.co/NovusEdge"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hugging Face"
      onMouseEnter={play}
      className={tileClass}
    >
      <svg ref={ref} viewBox="0 0 24 24" width="32" height="32" fill={ICON} aria-hidden className="block origin-center">
        <path d={siHuggingface.path} />
      </svg>
      <span className={labelClass}>Hugging Face</span>
    </a>
  )
}

export default function ContactCard({ onClose }: { onClose: () => void }) {
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
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-bone/15 bg-charcoal/95 shadow-[0_30px_80px_rgb(0,0,0,0.5)]"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-bone/10 px-7 py-5">
          <h2 className="font-display text-xl font-black text-bone">let's talk.</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-bone/50 transition-colors hover:text-gold"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* primary: email */}
        <div className="px-7 pt-6">
          <a
            href={`mailto:${EMAIL}`}
            className="group flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/[0.08] py-2.5 pl-2 pr-4 transition-colors hover:bg-gold/15"
          >
            <UseAnimations animation={mail as never} size={34} strokeColor="#d4a03c" />
            <span className="flex min-w-0 flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold/70">email</span>
              <span className="truncate font-mono text-xs text-bone">{EMAIL}</span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-gold transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* socials */}
        <div className="px-7 pb-7 pt-5">
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/35">elsewhere</p>
          <div className="grid grid-cols-4 gap-2">
            {SOCIALS.map((s) => (
              <SocialTile key={s.href} {...s} />
            ))}
            <HuggingTile />
          </div>
        </div>
      </div>
    </div>
  )
}
