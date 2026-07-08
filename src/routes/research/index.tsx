import { useEffect, useRef } from 'react'
import { Meta } from '../../lib/meta'
import { papers, type Paper } from '../../content/papers'
import { Rule, SectionNumber, JPLabel } from '../../components/motifs'
import { Github, Globe, FileText } from '../../components/icons'
import { revealCards } from '../../lib/reveals'
import DecryptedText from '../../components/react-bits/DecryptedText'
import { MarginQuote } from '../../components/side-flourish'

// right-margin quote for the research page, from Dune (Frank Herbert):
const RESEARCH_QUOTE = ['人生の神秘は', '解くべき問題ではなく', '経験すべき現実だ']
const RESEARCH_QUOTE_EN = "The mystery of life isn't a problem to solve, but a reality to experience."

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

// two-letter monogram from the title, for the generated cover when there's no image
function initials(title: string) {
  return title
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function Thumb({ paper }: { paper: Paper }) {
  const cls = 'h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:h-full sm:w-56'
  if (paper.thumb?.endsWith('.mp4')) {
    return <video src={paper.thumb} className={cls} autoPlay loop muted playsInline />
  }
  if (paper.thumb) {
    return <img src={paper.thumb} alt="" loading="lazy" className={cls} />
  }
  return (
    <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-bone-tint/40 to-charcoal/[0.03] sm:h-full sm:w-56 dark:from-charcoal-tint/40 dark:to-bone/[0.03]">
      <span className="font-display text-5xl font-black text-gold/70">{initials(paper.title)}</span>
    </div>
  )
}

function PaperCard({ paper }: { paper: Paper }) {
  const forthcoming = paper.venue.toLowerCase().includes('forthcoming')
  return (
    <div
      data-card
      className="group flex flex-col overflow-hidden rounded border border-charcoal/10 bg-bone-tint/10 transition-colors hover:border-gold/30 sm:flex-row dark:border-bone/10 dark:bg-charcoal-tint/10"
    >
      <a href={paper.url} target="_blank" rel="noopener noreferrer" className="block shrink-0 overflow-hidden sm:w-56" aria-hidden tabIndex={-1}>
        <Thumb paper={paper} />
      </a>
      <div className="min-w-0 p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.25em] text-charcoal/50 dark:text-bone/50">
          <span>{paper.date}</span>
          <span className="text-charcoal/25 dark:text-bone/25">·</span>
          <span className={forthcoming ? 'text-gold' : ''}>{paper.venue}</span>
        </div>
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block font-display text-2xl font-black leading-snug text-charcoal transition-colors hover:text-gold dark:text-bone md:text-3xl"
        >
          {paper.title}
        </a>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/70 dark:text-bone/70 md:text-base">
          {paper.abstract}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {paper.links.map((l) => (
            <LinkChip key={l.href} l={l} />
          ))}
        </div>
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
        description="Papers I've published on agent memory, epistemics, and cognitive infrastructure."
      />

      <MarginQuote lines={RESEARCH_QUOTE} translation={RESEARCH_QUOTE_EN} cite="『デューン』" />

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
