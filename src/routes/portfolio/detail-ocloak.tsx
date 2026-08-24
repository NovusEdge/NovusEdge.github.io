import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TLink } from '../../components/page-transition'
import { Github, Globe, Package, FileText, ArrowRight } from '../../components/icons'
import { prefersReducedMotion } from '../../lib/motion'
import { techRef } from '../../lib/tech-icons'
import TrustCollapse from '../../components/ocloak/TrustCollapse'
import type { LayoutProps } from './layouts'

gsap.registerPlugin(ScrollTrigger)

const EvilEye = lazy(() => import('../../components/react-bits/bg/EvilEye.jsx'))
const Dither = lazy(() => import('../../components/react-bits/bg/Dither.jsx'))

const iconFor = (href: string) =>
  href.includes('github.com') ? Github : href.includes('npmjs.com') || href.includes('pypi.org') ? Package : Globe

const PROSE =
  'max-w-[65ch] text-[17px] leading-[1.75] text-bone/80 [&_p]:my-6 [&_strong]:text-bone [&_code]:rounded [&_code]:bg-bone/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-bone'

const GOLD = '#d4a03c'
const AMBER = '#FF6F37'
const EYE = { eyeColor: AMBER, backgroundColor: '#1a1a1a', pupilFollow: 2.5 } as const

// eyes fixed in the margins — surveillance watching from the first frame, more
// of them accumulating as you read; both sides, varied sizes; wide screens only.
// EYES_AT_START are shown on load; scroll ramps up to the full set.
type Slot = { left?: string; right?: string; top: string; size: number }
const EYES_AT_START = 6
const SLOTS: Slot[] = [
  { left: '4%', top: '11%', size: 58 },
  { right: '5%', top: '8%', size: 76 },
  { left: '7%', top: '24%', size: 104 },
  { right: '3%', top: '22%', size: 48 },
  { right: '8%', top: '36%', size: 120 },
  { left: '3%', top: '40%', size: 62 },
  { left: '6%', top: '55%', size: 128 },
  { right: '6%', top: '52%', size: 84 },
  { right: '3%', top: '68%', size: 54 },
  { left: '8%', top: '72%', size: 92 },
  { left: '3%', top: '86%', size: 70 },
  { right: '7%', top: '82%', size: 118 },
  { right: '4%', top: '94%', size: 66 },
]

function PopEye({ slot, scrambled }: { slot: Slot; scrambled: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const prev = useRef(scrambled)
  useEffect(() => {
    if (!ref.current) return
    // an eye that first appears while already scrambled stays hidden
    if (scrambled) {
      gsap.set(ref.current, { opacity: 0 })
      return
    }
    const tw = gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.55 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
    )
    return () => {
      tw.kill()
    }
  }, [])
  // scramble toggles both ways: judder and break up, or settle back in
  useEffect(() => {
    if (!ref.current || scrambled === prev.current) return
    prev.current = scrambled
    if (scrambled) {
      gsap
        .timeline()
        .to(ref.current, {
          x: '+=6',
          duration: 0.03,
          repeat: 9,
          yoyo: true,
          ease: 'none',
          modifiers: { x: (v) => `${(Math.sin(parseFloat(v) * 99) * 7).toFixed(2)}px` },
        })
        .to(ref.current, { opacity: 0, scaleY: 0.04, filter: 'blur(3px)', duration: 0.22, ease: 'power2.in' }, '>-0.02')
    } else {
      gsap.to(ref.current, { opacity: 1, scaleY: 1, x: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' })
    }
  }, [scrambled])
  // no clip: the shader already draws an eye, and its charcoal background blends
  // into the page, so a landscape box lets the real eye shape float free
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed hidden lg:block"
      style={{
        left: slot.left,
        right: slot.right,
        top: slot.top,
        width: Math.round(slot.size * 1.7),
        height: slot.size,
      }}
    >
      <Suspense fallback={null}>
        <EvilEye {...EYE} scale={0.85} intensity={1.7} />
      </Suspense>
    </div>
  )
}

// tech badge with its brand mark, linking to the tech's home when known
function TechBadge({ name }: { name: string }) {
  const t = techRef(name)
  const inner = (
    <>
      {t.icon && (
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="h-4 w-4 fill-current opacity-50 transition group-hover/tag:opacity-100 group-hover/tag:[fill:var(--brand)]"
          style={t.icon.hex ? ({ ['--brand' as string]: `#${t.icon.hex}` } as CSSProperties) : undefined}
        >
          <path d={t.icon.path} />
        </svg>
      )}
      {name}
    </>
  )
  const cls =
    'group/tag inline-flex items-center gap-2 rounded border border-bone/15 px-3 py-1.5 font-mono text-[13px] tracking-wide text-bone/70 transition-colors'
  if (!t.href) return <span className={cls}>{inner}</span>
  return (
    <a href={t.href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:border-bone/40 hover:text-bone`}>
      {inner}
    </a>
  )
}

export default function Ocloak({ p, c }: LayoutProps) {
  const scope = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(EYES_AT_START)
  const [scrambled, setScrambled] = useState(false)
  const [scenario, setScenario] = useState('building')
  const [muted, setMuted] = useState(false)
  // the eyes portal to document.body, which does not exist during the Node
  // prerender; gate it on a client mount so the build never touches it.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const eyesOn = !prefersReducedMotion()

  // reveal-on-scroll for body blocks
  useEffect(() => {
    if (prefersReducedMotion() || !scope.current) return
    const ctx = gsap.context(() => {
      const secs = gsap.utils.toArray<HTMLElement>('[data-sec]', scope.current)
      gsap.set(secs, { opacity: 0, y: 26 })
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue
            io.unobserve(e.target)
            gsap.to(e.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
      )
      secs.forEach((s) => io.observe(s))
      return () => io.disconnect()
    }, scope)
    return () => ctx.revert()
  }, [c])

  // accumulate eyes as the reader gets deeper into the page
  useEffect(() => {
    if (prefersReducedMotion() || !scope.current) return
    const st = ScrollTrigger.create({
      trigger: scope.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const ramp = SLOTS.length - EYES_AT_START
        const n = Math.min(SLOTS.length, EYES_AT_START + Math.floor(self.progress * (ramp + 0.5)))
        setRevealed((v) => (v === n ? v : n))
      },
    })
    return () => st.kill()
  }, [])

  return (
    <main className="bg-charcoal text-bone" ref={scope}>

      {mounted &&
        eyesOn &&
        createPortal(
          <>
            {SLOTS.slice(0, revealed).map((slot, i) => (
              <PopEye key={i} slot={slot} scrambled={scrambled} />
            ))}
          </>,
          document.body,
        )}

      {/* hero: stoat-style card — identity beside a monitor panel */}
      <section className="relative overflow-hidden">
        {eyesOn && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              maskImage:
                'radial-gradient(150% 135% at 80% 4%, black 40%, transparent 96%), linear-gradient(to bottom, black 68%, transparent 100%)',
              maskComposite: 'intersect',
              WebkitMaskImage:
                'radial-gradient(150% 135% at 80% 4%, black 40%, transparent 96%), linear-gradient(to bottom, black 68%, transparent 100%)',
              WebkitMaskComposite: 'source-in',
            }}
          >
            <Suspense fallback={null}>
              <Dither
                waveColor={[1, 0.435, 0.216]}
                waveFrequency={6.3}
                waveAmplitude={0.23}
                waveSpeed={0.03}
                colorNum={7.2}
                enableMouseInteraction={false}
                disableAnimation={false}
              />
            </Suspense>
          </div>
        )}
        <div className="relative mx-auto max-w-3xl px-6 pb-40 pt-36 lg:pb-52 lg:pt-44">
          <div>
            <TLink
              to="/portfolio"
              aria-label="Back to portfolio"
              title="Back to portfolio"
              className="group inline-flex h-9 w-9 items-center justify-center rounded border border-bone/15 text-bone/50 transition-colors hover:border-gold hover:text-gold"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            </TLink>

            <h1 className="mt-10 flex items-baseline gap-4 font-display text-6xl font-black md:text-8xl">
              <span style={{ color: GOLD }}>ØCLOAK</span>
              {p.jp && <span className="font-display text-3xl font-normal text-bone/20">{p.jp}</span>}
            </h1>

            <p className="mt-8 max-w-xl text-xl leading-relaxed text-bone/75">{c.lede}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <TechBadge key={t} name={t} />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {p.links.map((l) => {
                const Icon = iconFor(l.href)
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded border border-gold bg-gold/10 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-charcoal"
                  >
                    <Icon className="h-4 w-4" /> {l.label}
                  </a>
                )
              })}
              <a
                href="https://github.com/NovusEdge/ocloak/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                title="AGPL-3.0 · license"
                className="inline-flex items-center gap-2 rounded border border-bone/15 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:border-bone/40 hover:text-bone"
              >
                <FileText className="h-4 w-4" /> AGPL-3.0
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* the writeup */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-20">
        {c.sections.map((s) => (
          <section key={s.id} id={s.id} data-sec className="scroll-mt-32 [&+&]:mt-20">
            <h2 className="font-display text-3xl font-black leading-tight text-bone md:text-4xl">{s.title}</h2>
            <div className={`mt-8 ${PROSE}`}>{s.body}</div>
          </section>
        ))}
      </div>

      {/* interactive: the unprotected/scrambled toggle also disperses the eyes */}
      <div data-sec className="relative z-10 mx-auto mt-20 max-w-4xl px-6">
        <TrustCollapse
          mode={scrambled ? 'scrambled' : 'passive'}
          onMode={(m) => setScrambled(m === 'scrambled')}
          scenario={scenario}
          onScenario={setScenario}
          muted={muted}
          onMuted={setMuted}
        />
        <p className="mt-6 text-center text-[15px] leading-relaxed text-bone/55">
          {scrambled
            ? 'The detections still happen. The data leaving the room is garbage, and the eyes above lost the thread.'
            : 'Flip it to scrambled. ØCLOAK does not hide you; it floods the read with noise.'}
        </p>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
        <footer data-sec className="mt-16 flex items-center justify-between border-t border-bone/10 pt-10">
          <span aria-hidden className="select-none font-display text-3xl text-bone/10">
            {p.jp}
          </span>
          <TLink
            to="/portfolio"
            className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-bone/50 transition-colors hover:text-gold"
          >
            back to portfolio
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </TLink>
        </footer>
      </div>
    </main>
  )
}
