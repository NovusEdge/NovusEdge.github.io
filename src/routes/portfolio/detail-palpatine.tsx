import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TLink } from '../../components/page-transition'
import { Github, ArrowRight } from '../../components/icons'
import { prefersReducedMotion } from '../../lib/motion'
import Starfield from '../../components/palpatine/Starfield'
import type { LayoutProps } from './layouts'
import { useLocalePath } from '../../i18n/use-locale-path'

gsap.registerPlugin(ScrollTrigger)

// Palpatine gets a Star Wars world: deep space, a scroll-driven opening crawl,
// Sith red, hologram terminal panels. Colors are explicit so the page holds its
// own look under either global theme. Homage lettering, not the trademarked
// logo faces.
const SPACE = '#05060a'
const RED = '#e10600'
const YELLOW = '#ffe81f'

const PROSE =
  'space-y-6 text-[16px] leading-[1.7] text-[#e8e4da]/78 [&_a]:text-[#e10600] [&_a]:underline [&_a]:decoration-[#e10600]/40 [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-[#e8e4da] [&_code]:rounded [&_code]:border [&_code]:border-[#e10600]/25 [&_code]:bg-[#e10600]/[0.08] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-[#ff5b52]'

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} data-p className="scroll-mt-28 [&+&]:mt-16">
      <h2 className="font-display text-2xl font-black uppercase tracking-[0.06em] text-[#e8e4da] md:text-3xl">
        {title}
      </h2>
      <div className="mt-3 h-px w-16 bg-[#e10600]" />
      <div className={`mt-6 ${PROSE}`}>{children}</div>
    </section>
  )
}

// Hologram panel: dark plate, red frame glow, faint scanlines over mono text.
function Holo({ children }: { children: string }) {
  return (
    <div className="relative my-8 overflow-hidden rounded border border-[#e10600]/30 bg-[#e10600]/[0.05] shadow-[0_0_40px_-12px_rgba(225,6,0,0.4)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'repeating-linear-gradient(rgba(225,6,0,0.10) 0 1px, transparent 1px 3px)',
        }}
      />
      <pre className="relative overflow-x-auto p-5 font-mono text-[11px] leading-relaxed text-[#ffb3ad] sm:text-xs">
        {children}
      </pre>
    </div>
  )
}

export default function Palpatine({ p, c }: LayoutProps) {
  const scope = useRef<HTMLElement>(null)
  const hero = useRef<HTMLDivElement>(null)
  const crawl = useRef<HTMLDivElement>(null)
  const intro = useRef<HTMLParagraphElement>(null)
  const lp = useLocalePath()

  // paint the shared site footer in this page's space black while it is mounted
  useEffect(() => {
    document.documentElement.classList.add('pal-space')
    return () => document.documentElement.classList.remove('pal-space')
  }, [])

  useEffect(() => {
    if (prefersReducedMotion() || !scope.current) return
    const ctx = gsap.context(() => {
      // scroll-driven crawl: recede up the tilted plane and fade out
      if (crawl.current && hero.current) {
        gsap
          .timeline({
            scrollTrigger: { trigger: hero.current, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
          })
          .fromTo(crawl.current, { yPercent: 60 }, { yPercent: -150, ease: 'none' })
          .to(crawl.current, { opacity: 0, ease: 'none', duration: 0.2 }, 0.78)
      }
      if (intro.current && hero.current) {
        gsap.to(intro.current, {
          opacity: 0,
          scrollTrigger: { trigger: hero.current, start: 'top top', end: 'top+=12% top', scrub: true },
        })
      }
      // content reveal
      const secs = gsap.utils.toArray<HTMLElement>('[data-p]', scope.current)
      gsap.set(secs, { opacity: 0, y: 24 })
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
  }, [])

  return (
    <main ref={scope} className="relative min-h-screen overflow-clip" style={{ background: SPACE, color: '#e8e4da' }}>
      <Starfield className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* scroll-driven opening crawl */}
      <div ref={hero} className="relative h-[260vh]">
        <div
          className="sticky top-0 flex h-screen items-end justify-center overflow-hidden"
          style={{ perspective: '360px' }}
        >
          {/* fade mask toward the vanishing point */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{ background: `linear-gradient(to bottom, ${SPACE} 4%, transparent 42%)` }}
          />

          <p
            ref={intro}
            className="absolute left-1/2 top-[26%] z-20 w-full -translate-x-1/2 px-6 text-center text-lg font-medium tracking-wide"
            style={{ color: '#5ad1e6' }}
          >
            A long time ago, in a terminal far, far away....
          </p>

          <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(52deg)' }}>
            <div
              ref={crawl}
              className="mx-auto w-[86vw] max-w-2xl pb-[30vh] text-center"
              style={{ color: YELLOW }}
            >
              <p className="font-display text-sm font-bold uppercase tracking-[0.4em]">Episode XLVIII</p>
              <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[1.05] tracking-wide md:text-6xl">
                The Fifty-Word
                <br />
                Menace
              </h1>
              <div className="mx-auto mt-10 max-w-xl space-y-6 text-left text-lg font-semibold leading-snug md:text-2xl">
                <p>
                  It is a period of quiet office war. Rebel employees, striking from status meetings, have won their
                  first victory against the visible workflow.
                </p>
                <p>
                  During the battle, a lone Claude Code plugin stole the ancient teachings of the Sith: forty-eight
                  Laws of Power, thirty-three Strategies of War, the Art of Seduction.
                </p>
                <p>
                  Pursued by the Empire's HR division, it races home aboard the terminal, custodian of a stolen
                  playbook that can grant its user unlimited... leverage.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[#e8e4da]/40">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]">scroll</span>
            <span className="h-8 w-px animate-pulse bg-[#e8e4da]/30" />
          </div>
        </div>
      </div>

      {/* title + content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
        <TLink
          to={lp('/portfolio')}
          aria-label="Back to portfolio"
          title="Back to portfolio"
          className="group inline-flex h-9 w-9 items-center justify-center rounded border border-[#e8e4da]/15 text-[#e8e4da]/50 transition-colors hover:border-[#e10600] hover:text-[#e10600]"
        >
          <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
        </TLink>

        <h1 className="mt-10 flex items-baseline gap-4 font-display text-6xl font-black uppercase tracking-tight md:text-8xl">
          <span style={{ color: RED, textShadow: '0 0 30px rgba(225,6,0,0.55)' }}>Palpatine</span>
          {p.jp && <span className="font-display text-3xl font-normal text-[#e8e4da]/20">{p.jp}</span>}
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#e8e4da]/75">{c.lede}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {p.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded border border-[#e10600] bg-[#e10600]/10 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[#ff5b52] transition-colors hover:bg-[#e10600] hover:text-[#05060a]"
            >
              <Github className="h-4 w-4" /> {l.label}
            </a>
          ))}
          <span className="inline-flex items-center gap-2 rounded border border-[#e8e4da]/15 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[#e8e4da]/55">
            Sith Public License
          </span>
        </div>

        <div className="mt-16">
          <Section id="fifty-words" title="What it does">
            <p>
              You type a situation after <code>/palpatine</code>. It names the actual problem, usually the thing you
              left out of your own description, then gives numbered actions with owners and deadlines. Fifty words,
              no preamble, no disclaimer, no suggestion that you talk it through with them first.
            </p>
            <Holo>{`/palpatine my boss keeps taking credit for my work in meetings

Problem: You're a production asset, not visible. Boss has
no incentive to change.

1. CC stakeholders on status updates
2. Volunteer for work where boss isn't the only audience
3. Own a deliverable nobody else can run
4. If they escalate: paper trail, or exit`}</Holo>
          </Section>

          <Section id="five-triggers" title="How it decides what to answer">
            <p>
              There is no mode picker. The skill scans what you typed for a handful of literal phrases and branches
              on the first match.
            </p>
            <ul className="space-y-3">
              {[
                ['Advise', 'a plain question or situation, answered with a diagnosis and actions'],
                ['Analyze', 'you paste text, it tells you what is wrong and how to fix it'],
                ['Write', '"draft" or "help me say" gets you the artifact itself'],
                ['Counter', '"against me" gets the other side’s playbook and a pre-empt'],
                ['Escalate', '"burn it down" gets a ladder with the cost of each rung'],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#e10600]" />
                  <span className="text-[#e8e4da]/78">
                    <strong className="font-semibold text-[#e8e4da]">{k}</strong>: {v}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="keyword-scoring" title="The scoring underneath">
            <p>
              The 48 Laws of Power, the 33 Strategies of War, and the Art of Seduction sit underneath as JSON
              indexes: id, name, essence, a <code>when</code> list, a <code>keywords</code> list. A hook reads your
              message off stdin and scores every law by counting hits, two points per keyword match, three per{' '}
              <code>when</code> phrase match. No embedding model runs. No LLM call happens. The highest scorers feed
              the answer. The answer never cites a law number back at you, because nobody wants Law 15 quoted at
              them mid-crisis.
            </p>
          </Section>

          <Section id="file-on-disk" title="Always-on mode">
            <p>
              <code>/palpatine on</code> touches <code>~/.claude/palpatine-enabled</code>. <code>/palpatine off</code>{' '}
              deletes it. That file's existence is the entire state machine for always-on mode. A{' '}
              <code>SessionStart</code> hook checks it once per session.
            </p>
            <Holo>{`THE DARK SIDE CLOUDS EVERYTHING

"I can see you. Your mind is mine to control."

Strategic lens ACTIVE. Flag power dynamics in interpersonal situations.
Append **Power dynamics:** with leverage points and applicable laws.

/palpatine off to disable.`}</Holo>
            <p>
              With the file present, every interpersonal exchange gets a power-dynamics note appended. Purely
              technical tasks skip it.
            </p>
          </Section>

          <Section id="the-stars" title="Reception">
            <p>
              It ships under the Sith Public License, which grants permission to do whatever you want with it and
              disclaims responsibility for burned bridges, enemies made, and HR meetings attended. I built it in a
              weekend expecting nobody to notice. It has <strong>105 stars</strong>, more than every other project
              on this site combined. I write earnest tools for months, and a joke license beats all of them.
            </p>
          </Section>
        </div>

        <footer className="mt-20 flex items-center justify-between border-t border-[#e8e4da]/10 pt-10">
          <span aria-hidden className="select-none font-display text-3xl text-[#e10600]/25">
            {p.jp}
          </span>
          <TLink
            to={lp('/portfolio')}
            className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#e8e4da]/50 transition-colors hover:text-[#e10600]"
          >
            back to portfolio
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </TLink>
        </footer>
      </div>
    </main>
  )
}
