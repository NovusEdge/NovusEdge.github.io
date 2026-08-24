import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TLink } from '../../components/page-transition'
import { Github, Globe, Package, FileText, ArrowRight } from '../../components/icons'
import { prefersReducedMotion } from '../../lib/motion'
import { techRef } from '../../lib/tech-icons'
import type { LayoutProps } from './layouts'

gsap.registerPlugin(ScrollTrigger)

const EvilEye = lazy(() => import('../../components/react-bits/bg/EvilEye.jsx'))

const iconFor = (href: string) =>
  href.includes('github.com') ? Github : href.includes('npmjs.com') || href.includes('pypi.org') ? Package : Globe

const PROSE =
  'max-w-[65ch] text-[17px] leading-[1.75] text-bone/80 [&_p]:my-6 [&_strong]:text-bone [&_code]:rounded [&_code]:bg-bone/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-bone'

const GOLD = '#d4a03c'
const AMBER = '#FF6F37'
const EYE = { eyeColor: AMBER, backgroundColor: '#1a1a1a', pupilFollow: 2.5 } as const

// eyes that fade into the margins as you read — surveillance accumulating from
// the top down, both sides, varied sizes; wide screens only.
type Slot = { left?: string; right?: string; top: string; size: number }
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
]

function PopEye({ slot, scrambled }: { slot: Slot; scrambled: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const tw = gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.55 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
    )
    return () => {
      tw.kill()
    }
  }, [])
  // scramble: the eye judders like corrupted signal, then breaks up
  useEffect(() => {
    if (!scrambled || !ref.current) return
    const tl = gsap.timeline()
    tl.to(ref.current, {
      x: '+=6',
      duration: 0.03,
      repeat: 9,
      yoyo: true,
      ease: 'none',
      modifiers: { x: (v) => `${(Math.sin(parseFloat(v) * 99) * 7).toFixed(2)}px` },
    }).to(ref.current, { opacity: 0, scaleY: 0.04, filter: 'blur(3px)', duration: 0.22, ease: 'power2.in' }, '>-0.02')
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
  const [revealed, setRevealed] = useState(0)
  const [scrambled, setScrambled] = useState(false)
  const [dispersed, setDispersed] = useState(false)
  const eyesOn = !prefersReducedMotion()

  const scramble = () => {
    if (scrambled) return
    setScrambled(true)
    gsap.delayedCall(0.7, () => setDispersed(true))
  }

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
        const n = Math.min(SLOTS.length, Math.floor(self.progress * (SLOTS.length + 0.5)))
        setRevealed((v) => (v === n ? v : n))
      },
    })
    return () => st.kill()
  }, [])

  return (
    <main className="bg-charcoal text-bone" ref={scope}>

      {eyesOn &&
        !dispersed &&
        createPortal(
          <>
            {SLOTS.slice(0, revealed).map((slot, i) => (
              <PopEye key={i} slot={slot} scrambled={scrambled} />
            ))}
          </>,
          document.body,
        )}

      {/* hero: stoat-style card — identity beside a monitor panel */}
      <section className="relative overflow-hidden border-b border-bone/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,111,55,0.10) 1px, transparent 1.4px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(120% 80% at 70% 0%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(120% 80% at 70% 0%, black 20%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-32 lg:pt-36">
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

      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
        {eyesOn && (
          <div data-sec className="mt-24 overflow-hidden rounded-lg border border-gold/25 bg-gold/[0.04] px-8 py-12 text-center md:px-14 md:py-14">
            <p className="mx-auto max-w-lg font-display text-2xl font-black leading-tight text-bone md:text-3xl">
              {scrambled ? 'Now they just see noise.' : "By now you've been watched the whole way down."}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-bone/55">
              {scrambled
                ? 'The detections still happen. The data going out is garbage.'
                : "ØCLOAK doesn't hide you. It floods the read with noise."}
            </p>
            <button
              type="button"
              onClick={scramble}
              disabled={scrambled}
              className="group mt-8 inline-flex items-center gap-2.5 rounded border border-gold bg-gold/10 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.25em] text-gold transition-colors hover:bg-gold hover:text-charcoal disabled:cursor-default disabled:opacity-40"
            >
              {scrambled ? 'scrambled' : 'scramble the signal'}
              {!scrambled && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </div>
        )}

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
