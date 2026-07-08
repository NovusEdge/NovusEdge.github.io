import { useEffect, useRef } from 'react'
import { Meta } from '../../lib/meta'
import { papers, type Paper } from '../../content/papers'
import { Rule, SectionNumber, JPLabel } from '../../components/motifs'
import { Github, Globe, FileText } from '../../components/icons'
import { revealCards } from '../../lib/reveals'
import DecryptedText from '../../components/react-bits/DecryptedText'
import Magnetic from '../../components/react-bits/Magnetic'

function iconFor(href: string) {
  if (href.includes('github.com')) return Github
  if (href.includes('zenodo.org')) return FileText
  return Globe
}

function LinkChip({ l }: { l: { label: string; href: string } }) {
  const Icon = iconFor(l.href)
  return (
    <a
      href={l.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded border border-charcoal/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-charcoal/70 transition-colors hover:border-gold hover:text-gold dark:border-bone/15 dark:text-bone/70"
    >
      <Icon className="h-3.5 w-3.5" /> {l.label}
    </a>
  )
}

function PaperCard({ paper }: { paper: Paper }) {
  const primary = paper.links[0]
  const forthcoming = paper.venue.toLowerCase().includes('forthcoming')
  return (
    <div
      data-card
      className="rounded border border-charcoal/10 bg-bone-tint/10 p-8 transition-colors hover:border-gold/30 dark:border-bone/10 dark:bg-charcoal-tint/10"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.25em] text-charcoal/50 dark:text-bone/50">
        <span>{paper.date}</span>
        <span className="text-charcoal/25 dark:text-bone/25">·</span>
        <span className={forthcoming ? 'text-gold' : ''}>{paper.venue}</span>
      </div>
      <Magnetic range={20}>
        <a
          href={primary.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block font-display text-2xl font-black leading-snug text-charcoal transition-colors hover:text-paper-deep dark:text-bone dark:hover:text-paper md:text-3xl"
        >
          {paper.title}
        </a>
      </Magnetic>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal/70 dark:text-bone/70 md:text-base">
        {paper.abstract}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {paper.links.map((l) => (
          <LinkChip key={l.href} l={l} />
        ))}
      </div>
    </div>
  )
}

export default function ResearchIndex() {
  const scope = useRef<HTMLElement>(null)
  useEffect(() => revealCards(scope.current), [])

  return (
    <>
      <Meta
        title="Research"
        description="Papers from Engrammic on externalized epistemics and Epistemic Augmented Generation."
      />
      <section ref={scope} className="relative mx-auto max-w-4xl px-6 pb-24 pt-36">
        <div data-card className="relative">
          <SectionNumber n="03" label="research" />
          <div className="relative mt-3 w-fit">
            <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex">
              <JPLabel>研究</JPLabel>
              <span aria-hidden className="h-4 w-px bg-gold/50" />
            </div>
            <h1 className="font-display text-5xl font-black text-charcoal dark:text-bone">
              <DecryptedText text="Research" speed={50} delay={100} />
            </h1>
          </div>
        </div>

        <div data-card>
          <Rule className="mt-8" />
        </div>

        <div className="mt-12 space-y-8">
          {papers.map((paper) => (
            <PaperCard key={paper.slug} paper={paper} />
          ))}
        </div>
      </section>
    </>
  )
}
