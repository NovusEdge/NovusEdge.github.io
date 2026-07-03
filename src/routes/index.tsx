import { useRef } from 'react'
import { Link } from 'react-router'
import { Meta } from '../lib/meta'
import { Rule, RegMarks, JPLabel, MonoTag } from '../components/motifs'
import { useReveal } from '../lib/motion'

export default function Landing() {
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)
  return (
    <>
      <Meta description="Security, systems, and writeups — personal site of NovusEdge." />
      <section ref={scope} className="relative flex min-h-screen flex-col justify-center px-6 md:px-20">
        <RegMarks />
        <JPLabel className="absolute right-8 top-1/2 hidden -translate-y-1/2 md:block">ようこそ</JPLabel>

        <div data-reveal>
          <MonoTag>novusedge — security · systems · writing</MonoTag>
        </div>

        <h1 data-reveal className="mt-6 font-display text-6xl font-black leading-[1.05] md:text-8xl">
          Novus<span className="text-gold">Edge</span>
        </h1>

        <div data-reveal>
          <Rule className="mt-10 max-w-md" />
        </div>

        <p data-reveal className="mt-8 max-w-xl text-lg leading-relaxed text-charcoal/70 dark:text-bone/70">
          Weekly notes on security and Linux, CTF writeups, projects, and the occasional research paper.
        </p>

        <nav data-reveal className="mt-10 flex gap-8">
          {[
            ['/blog', 'Read the blog'],
            ['/portfolio', 'See the work'],
            ['/research', 'Papers'],
          ].map(([to, label]) => (
            <Link key={to} to={to} className="link-draw font-mono text-xs uppercase tracking-[0.25em] text-paper-deep dark:text-paper">
              {label} →
            </Link>
          ))}
        </nav>

        {/* animated strip: /assets/cosmos.webp has loop-count 3 baked in — plays 3x, freezes on last frame, no JS */}
        <div data-reveal className="mt-12 max-w-3xl">
          <img src="/assets/cosmos.webp" alt="" className="w-full border border-charcoal/15 dark:border-bone/15" />
        </div>
      </section>
    </>
  )
}
