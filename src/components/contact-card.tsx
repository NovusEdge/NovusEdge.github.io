import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import UseAnimations from 'react-useanimations'
import mail from 'react-useanimations/lib/mail'
import twitter from 'react-useanimations/lib/twitter'
import github from 'react-useanimations/lib/github'
import linkedin from 'react-useanimations/lib/linkedin'
import { siHuggingface, siKofi } from 'simple-icons'
import { X } from './icons'

// animated contact orbit. lazy-loaded from the footer so lottie-web only ships
// once someone actually opens it.

const EMAIL = 'khimanialiasgar@gmail.com'
const ICON = '#e8e4da' // bone-tint, resting

// static icons (no lottie glyph available)
function StaticIcon({ path, size = 32 }: { path: string; size?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const play = () => {
    if (ref.current)
      animate(ref.current, { rotate: [0, -12, 10, -6, 0], scale: [1, 1.15, 1], duration: 700, ease: 'outElastic(1,.6)' })
  }
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={ICON}
      aria-hidden
      className="block origin-center"
      onMouseEnter={play}
    >
      <path d={path} />
    </svg>
  )
}

const ALL_SOCIALS = [
  { name: 'Email', href: `mailto:${EMAIL}`, anim: mail },
  { name: 'Twitter', href: 'https://twitter.com/0kaliasgar', anim: twitter },
  { name: 'GitHub', href: 'https://github.com/NovusEdge', anim: github },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/aliasgarkhimani/', anim: linkedin },
  { name: 'Hugging Face', href: 'https://huggingface.co/NovusEdge', icon: siHuggingface.path },
  { name: 'Ko-fi', href: 'https://ko-fi.com/aliasgarkhimani', icon: siKofi.path },
]

function ContactOrbit({ onClose }: { onClose: () => void }) {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const items = container.current?.querySelectorAll('[data-orbit]')
    if (!items) return
    animate(items, {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 500,
      delay: stagger(80),
      ease: 'outBack',
    })
  }, [])

  const n = ALL_SOCIALS.length
  const radius = 100
  const center = 144 // half of 288px container
  const itemSize = 56 // h-14 = 56px

  return (
    <div ref={container} className="relative h-72 w-72">
      {/* center */}
      <button
        onClick={onClose}
        className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/20 bg-charcoal text-bone/60 transition-colors hover:border-gold hover:text-gold"
      >
        <X className="h-6 w-6" />
      </button>
      {/* orbiting items */}
      {ALL_SOCIALS.map((s, i) => {
        const angle = ((i / n) * 2 * Math.PI) - Math.PI / 2
        const x = center + radius * Math.cos(angle) - itemSize / 2
        const y = center + radius * Math.sin(angle) - itemSize / 2
        return (
          <a
            key={s.href}
            href={s.href}
            target={s.name === 'Email' ? undefined : '_blank'}
            rel="noopener noreferrer"
            data-orbit
            className="group absolute flex h-14 w-14 items-center justify-center rounded-full border border-bone/15 bg-charcoal/90 transition-all hover:scale-110 hover:border-gold"
            style={{ left: x, top: y }}
            title={s.name}
          >
            {s.anim ? (
              <UseAnimations animation={s.anim as never} size={28} strokeColor={ICON} autoplay={false} />
            ) : s.icon ? (
              <StaticIcon path={s.icon} size={28} />
            ) : null}
          </a>
        )
      })}
    </div>
  )
}

export default function ContactCard({ onClose }: { onClose: () => void }) {
  const backdrop = useRef<HTMLDivElement>(null)

  useEffect(() => {
    animate(backdrop.current!, { opacity: [0, 1], duration: 250, ease: 'out(2)' })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
      <div ref={backdrop} className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative">
        <ContactOrbit onClose={onClose} />
      </div>
    </div>
  )
}
