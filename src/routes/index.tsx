import { useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Dithering } from '@paper-design/shaders-react'
import { Meta } from '../lib/meta'
import { prefersReducedMotion } from '../lib/motion'
import { ArrowDown } from '../components/icons'

const NAME = 'Aliasgar Khimani'
const HANDLE = 'NovusEdge'
const TAGLINE = 'making computers have opinions.'

const NAV = [
  { to: '/blog', label: 'Blog' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/research', label: 'Research' },
  { to: '/stack', label: 'Stack' },
]

// keep the shaders off the retina-res treadmill; two layers run at once during the morph,
// so cap the pixel budget hard, dithering is blocky and barely shows the lower resolution
const PERF = { minPixelRatio: 1, maxPixelCount: 380_000 }

type Mount = { setSpeed?: (n?: number) => void; setUniforms?: (u: Record<string, number>) => void }
const mountOf = (el: unknown) => (el as { paperShaderMount?: Mount } | null)?.paperShaderMount
const setSpeed = (el: unknown, v: number) => mountOf(el)?.setSpeed?.(v)
const setScale = (el: unknown, v: number) => mountOf(el)?.setUniforms?.({ u_scale: v })

// swirl → speeds up → morphs into warp (crossfade + shared zoom) → back into swirl that slows → loops
function DitherMorphBg() {
  const wrap = useRef<HTMLDivElement>(null)
  const swirl = useRef<HTMLDivElement>(null)
  const warp = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const st = { v: 0.08, s: 1 }
      const push = () => {
        setSpeed(swirl.current, st.v)
        setSpeed(warp.current, st.v)
      }
      const zoom = () => {
        setScale(swirl.current, st.s)
        setScale(warp.current, st.s)
      }
      if (prefersReducedMotion()) {
        push()
        return
      }
      const tl = gsap.timeline({ repeat: -1 })
      tl.to(st, { v: 0.4, duration: 5, ease: 'power2.in', onUpdate: push })
        .to(warp.current, { opacity: 1, duration: 2.4, ease: 'power1.inOut' }, 3.2)
        .to(st, { s: 1.28, duration: 2.4, ease: 'power2.inOut', onUpdate: zoom }, 3.2)
        .to(warp.current, { opacity: 0, duration: 2.4, ease: 'power1.inOut' }, 7)
        .to(st, { s: 1, duration: 2.4, ease: 'power2.inOut', onUpdate: zoom }, 7)
        .to(st, { v: 0.08, duration: 5, ease: 'power2.out', onUpdate: push }, 7)
    },
    { scope: wrap },
  )

  return (
    <div ref={wrap} className="absolute inset-0">
      <Dithering
        ref={swirl as never}
        className="absolute inset-0"
        width="100%"
        height="100%"
        {...PERF}
        colorBack="#141414"
        colorFront="#d4a03c"
        shape="swirl"
        type="4x4"
        size={2}
        speed={0.08}
      />
      <Dithering
        ref={warp as never}
        className="absolute inset-0 opacity-0"
        width="100%"
        height="100%"
        {...PERF}
        colorBack="#141414"
        colorFront="#d4a03c"
        shape="warp"
        type="4x4"
        size={2}
        speed={0.08}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal/20 via-transparent to-charcoal" />
    </div>
  )
}

function StatusStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-bone/65">
      <span>LOC: FINLAND</span>
      <span className="font-semibold text-gold">STATUS: [REDACTED]</span>
      <span>OUTPUT: 51 REPOS</span>
    </div>
  )
}

export default function Landing() {
  return (
    <>
      <Meta description="Aliasgar Khimani (NovusEdge): epistemic memory, cognitive infrastructure for AI agents, and whatever I'm building next." />
      <div className="bg-charcoal text-bone">
        {/* hero */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
          <DitherMorphBg />
          {/* soft radial scrim so hero text reads against the pattern */}
          <div
            className="pointer-events-none absolute inset-0 z-[5]"
            style={{
              background:
                'radial-gradient(ellipse 55% 48% at 50% 42%, rgba(15,15,15,0.72) 0%, rgba(15,15,15,0.4) 45%, transparent 72%)',
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-8 [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">
            <div className="flex flex-col items-center">
              <h1 className="font-display text-6xl font-black tracking-tight text-bone md:text-8xl">{NAME}</h1>
              <span className="mt-2 font-mono text-xs font-medium uppercase tracking-[0.4em] text-bone/55">@{HANDLE}</span>
            </div>
            <p className="max-w-md font-mono text-sm font-medium text-bone/75">{TAGLINE}</p>
            <StatusStrip />
            <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {NAV.map((l, i) => (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                  className="nav-pill rounded-full border border-bone/25 px-5 py-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-bone/85 transition-[transform,background-color,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-charcoal hover:shadow-[0_8px_24px_rgba(212,160,60,0.25)]"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-bone/55">
            scroll
            <ArrowDown className="h-4 w-4 animate-bounce text-gold" />
          </div>
        </section>
      </div>
      {/* pill entrance runs on the compositor so shader load on the main thread can't stall it; `backwards` fill leaves hover transforms free */}
      <style>{`
        @keyframes navpill { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
        .nav-pill { animation: navpill 0.5s ease-out backwards }
        @media (prefers-reduced-motion: reduce) { .nav-pill { animation: none } }
      `}</style>
    </>
  )
}
