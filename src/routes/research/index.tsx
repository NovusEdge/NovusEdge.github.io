import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Meta } from '../../lib/meta'
import { papers } from '../../content/papers'
import { Rule, SectionNumber, JPLabel, MonoTag } from '../../components/motifs'
import { useReveal } from '../../lib/motion'

export default function ResearchIndex() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)

  return (
    <>
      <Meta title="Research" description="Published papers and preprints." />
      <section ref={scope} className="relative mx-auto max-w-4xl px-6 pb-24 pt-36">
        <JPLabel className="absolute -left-2 top-40 hidden lg:block">研究</JPLabel>

        <div data-reveal className="flex items-baseline justify-between">
          <div>
            <SectionNumber n="03" label="research" />
            <h1 className="mt-3 font-display text-5xl font-black">Research</h1>
          </div>
          <div className="flex gap-4">
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`cursor-pointer font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  view === v ? 'text-gold' : 'text-charcoal/50 hover:text-charcoal dark:text-bone/50 dark:hover:text-bone'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div data-reveal>
          <Rule className="mt-8" />
        </div>

        <div data-reveal className={view === 'grid' ? 'mt-12 grid gap-6 sm:grid-cols-2' : 'mt-12 space-y-6'}>
          {papers.map((paper) => (
            <Link
              key={paper.slug}
              to={`/research/${paper.slug}`}
              className={`group block border border-charcoal/10 p-6 transition-colors hover:border-gold/60 dark:border-bone/10 ${
                view === 'list' ? 'flex items-baseline justify-between gap-6' : ''
              }`}
            >
              <div>
                <div className="flex gap-4">
                  <MonoTag>{paper.date.slice(0, 4)}</MonoTag>
                  <MonoTag>{paper.venue}</MonoTag>
                </div>
                <h2 className="mt-3 font-display text-xl font-bold group-hover:text-paper-deep dark:group-hover:text-paper">
                  {paper.title}
                </h2>
                {view === 'grid' && (
                  <p className="mt-3 line-clamp-3 text-sm text-charcoal/60 dark:text-bone/60">{paper.abstract}</p>
                )}
              </div>
              {paper.doi && view === 'list' && <MonoTag>doi</MonoTag>}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
