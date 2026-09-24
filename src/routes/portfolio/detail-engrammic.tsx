import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import gsap from 'gsap'
import { TLink } from '../../components/page-transition'
import { Globe, Github, Package, FileText, ArrowRight } from '../../components/icons'
import { prefersReducedMotion } from '../../lib/motion'
import { techRef } from '../../lib/tech-icons'
import SuperpositionGraph from '../../components/engrammic/SuperpositionGraph'
import type { LayoutProps } from './layouts'
import { useLocalePath } from '../../i18n/use-locale-path'

// Engrammic runs its own world: the sepia editorial look of engrammic.ai
// (cream ground, Libre Baskerville serif, gold accents), forced regardless of
// the site's dark/light setting. Colors are explicit, never the charcoal/bone
// theme tokens, so the page reads the same under either global theme. Where the
// blog tells the origin story, this page is the system as built.
const GROUND = '#f4f0e6'
const INK = '#1c1a17'

const SERIF = "font-['Libre_Baskerville',Georgia,serif]"
const PROSE =
  'space-y-6 text-[17px] leading-[1.75] text-[#1c1a17]/80 [&_a]:text-[#9a6f33] [&_a]:underline [&_a]:decoration-[#9a6f33]/30 [&_a]:underline-offset-2 hover:[&_a]:decoration-[#9a6f33] [&_strong]:font-semibold [&_strong]:text-[#1c1a17] [&_em]:italic [&_code]:rounded [&_code]:bg-[#1c1a17]/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-[#1c1a17]'

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} data-eg className="scroll-mt-28 [&+&]:mt-16">
      <h2 className={`${SERIF} text-2xl font-bold leading-snug text-[#1c1a17] md:text-[2rem]`}>{title}</h2>
      <div className={`mt-6 ${PROSE}`}>{children}</div>
    </section>
  )
}

// The one sentence a stretch is built around: serif, large, quiet.
function Manifesto({ children }: { children: ReactNode }) {
  return (
    <p className={`${SERIF} my-12 text-2xl font-normal leading-[1.4] text-[#1c1a17] md:text-[1.9rem]`}>{children}</p>
  )
}

function Figures({ items }: { items: { value: string; label: string; note?: string }[] }) {
  return (
    <dl className="my-10 grid gap-px overflow-hidden rounded border border-[#1c1a17]/12 bg-[#1c1a17]/12 sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
      {items.map((f) => (
        <div key={f.label} className="bg-[#f4f0e6] px-5 py-6">
          <dd className={`${SERIF} text-3xl font-bold leading-none text-[#1c1a17]`}>{f.value}</dd>
          <dt className="mt-3 font-mono text-[10px] uppercase leading-snug tracking-[0.18em] text-[#1c1a17]/55">
            {f.label}
          </dt>
          {f.note && <p className="mt-1.5 text-[13px] leading-snug text-[#1c1a17]/50">{f.note}</p>}
        </div>
      ))}
    </dl>
  )
}

function Term({ children }: { children: string }) {
  return (
    <pre className="my-8 overflow-x-auto rounded border border-[#1c1a17]/12 bg-[#1c1a17]/[0.04] p-5 font-mono text-[11px] leading-relaxed text-[#1c1a17]/80 sm:text-xs">
      {children}
    </pre>
  )
}

// Logo-only stack mark; the tech name lives in the tooltip. Brand color on
// hover, ink otherwise. A tech with no mark falls back to a mono monogram.
function LogoBadge({ name }: { name: string }) {
  const t = techRef(name)
  const cls =
    'group/l flex h-11 w-11 items-center justify-center rounded border border-[#1c1a17]/12 bg-[#1c1a17]/[0.02] transition-colors hover:border-[#1c1a17]/30'
  const inner = t.icon ? (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-[22px] w-[22px] fill-[#1c1a17]/65 transition-colors group-hover/l:fill-[var(--brand)]"
      style={t.icon.hex ? ({ ['--brand' as string]: `#${t.icon.hex}` } as CSSProperties) : undefined}
    >
      <path d={t.icon.path} />
    </svg>
  ) : (
    <span className="font-mono text-[11px] font-semibold text-[#1c1a17]/65">{name.slice(0, 2).toUpperCase()}</span>
  )
  return t.href ? (
    <a href={t.href} target="_blank" rel="noopener noreferrer" title={name} aria-label={name} className={cls}>
      {inner}
    </a>
  ) : (
    <span title={name} aria-label={name} className={cls}>
      {inner}
    </span>
  )
}

export default function Engrammic({ p }: LayoutProps) {
  const scope = useRef<HTMLElement>(null)
  const lp = useLocalePath()

  // paint the shared site footer in this page's cream ground while it is mounted
  useEffect(() => {
    document.documentElement.classList.add('eg-sepia')
    return () => document.documentElement.classList.remove('eg-sepia')
  }, [])

  useEffect(() => {
    if (prefersReducedMotion() || !scope.current) return
    const ctx = gsap.context(() => {
      const secs = gsap.utils.toArray<HTMLElement>('[data-eg]', scope.current)
      gsap.set(secs, { opacity: 0, y: 22 })
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

  const iconFor = (href: string) =>
    href.includes('github.com')
      ? Github
      : href.includes('npmjs.com')
        ? Package
        : href.includes('/research')
          ? FileText
          : Globe

  return (
    <main ref={scope} className="min-h-screen" style={{ background: GROUND, color: INK }}>
      {/* hero */}
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-32 lg:pt-36">
        <TLink
          to={lp('/portfolio')}
          aria-label="Back to portfolio"
          title="Back to portfolio"
          className="group inline-flex h-9 w-9 items-center justify-center rounded border border-[#1c1a17]/20 text-[#1c1a17]/50 transition-colors hover:border-[#9a6f33] hover:text-[#9a6f33]"
        >
          <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
        </TLink>

        <div className="mt-10 flex flex-col gap-10 md:flex-row md:items-stretch md:gap-12">
          <div className="min-w-0 flex-1">
            <h1 className={`${SERIF} flex items-baseline gap-4 text-5xl font-bold md:text-7xl`}>
              Engrammic
              {p.jp && <span className="text-2xl font-normal text-[#1c1a17]/25">{p.jp}</span>}
            </h1>

            <p className={`${SERIF} mt-8 max-w-2xl text-2xl leading-[1.4] md:text-[1.9rem]`}>
              Agent memory with <em className="italic text-[#9a6f33]">sources</em> and a record of{' '}
              <em className="italic text-[#9a6f33]">revisions</em>.
            </p>

            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#1c1a17]/70">
              Engrammic stores observations separately from claims and records the evidence used to promote or
              revise them. The{' '}
              <TLink to={lp('/blog/on-building-something-engrammic')} className="underline decoration-[#9a6f33]/40 underline-offset-2 hover:decoration-[#9a6f33]">
                origin story is on the blog
              </TLink>
              .
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {p.links.map((l) => {
                const Icon = iconFor(l.href)
                const primary = l.href === 'https://engrammic.ai'
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      primary
                        ? 'inline-flex items-center gap-2 rounded border border-[#1c1a17] bg-[#1c1a17] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[#f4f0e6] transition-colors hover:bg-[#9a6f33] hover:border-[#9a6f33]'
                        : 'inline-flex items-center gap-2 rounded border border-[#1c1a17]/20 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[#1c1a17]/70 transition-colors hover:border-[#1c1a17]/50 hover:text-[#1c1a17]'
                    }
                  >
                    <Icon className="h-4 w-4" /> {l.label}
                  </a>
                )
              })}
            </div>
          </div>

          <div
            className="grid shrink-0 grid-cols-2 content-between gap-x-2 gap-y-3 md:pt-2"
            aria-label="Built with"
          >
            {p.tech.map((t) => (
              <LogoBadge key={t} name={t} />
            ))}
          </div>
        </div>

        <div className="mt-14 border-y border-[#1c1a17]/10 py-8">
          <SuperpositionGraph className="mx-auto w-full max-w-2xl" />
        </div>
      </section>

      {/* the architecture */}
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-8">
        <Section id="the-shape" title="The shape of the problem">
          <p>
            Suppose an agent records "the API uses OAuth" on Monday and "the API uses API keys" on Tuesday.
            Retrieving the closest text match doesn't tell it which statement applies. The API might have changed,
            the claims might refer to different endpoints, or one might simply be wrong.
          </p>
          <Manifesto>The memory record needs the source, the relevant time, and the reason for a revision.</Manifesto>
          <p>
            Engrammic represents those relationships explicitly. An agent can inspect the supporting records and
            follow revisions instead of relying on the wording of a retrieved sentence.
          </p>
        </Section>

        <Section id="the-model" title="The model: observations, claims, facts">
          <p>
            An <strong>observation</strong> records an event. A <strong>claim</strong> adds a statement and its
            evidence. Promotion rules use confidence and corroboration to decide when a claim becomes a
            <strong> fact</strong>; synthesis draws on facts to form <strong>beliefs</strong>. These are record
            types and rules for handling evidence, not a guarantee that an accepted statement is true.
          </p>
          <p>
            The records live as nodes and typed edges in a graph store. A claim
            points at its source. A fact points at the claims that promoted it. A superseding fact points at the one
            it replaced. The schema, the edge types, and the scoring functions that decide promotion ship as{' '}
            <code>engrammic-primitives</code>.
          </p>
        </Section>

        <Section id="the-gate" title="The write gate">
          <p>
            The <code>learn</code> operation accepts a claim, its evidence, and its source. Evidence enforcement can
            reject a claim without evidence or store it with a warning, depending on configuration. A revision can
            name the record it supersedes. Contradiction checks and later validation help identify claims that need
            review.
          </p>
          <p>Illustrative records for an API migration:</p>
          <Term>{`Earlier claim: "The API uses API keys"
Evidence:      API documentation, version 1

Revised claim: "Version 2 uses OAuth2"
Evidence:      API documentation, version 2
Relationship: supersedes the earlier claim for version 2`}</Term>
          <p>
            Recording a source makes a claim inspectable. Deciding whether the source supports it, and whether two
            claims actually conflict, still requires validation.
          </p>
        </Section>

        <Section id="provenance" title="Provenance and time">
          <p>
            Every write carries two timestamps: one for when the thing happened, one for when the system learned it.
            These fields distinguish when a statement applied from when it entered the store.
          </p>
          <p>
            Supersession keeps the earlier record and links it to its replacement. That history lets an agent trace
            a stored conclusion back to the observations and revisions it depends on. It can only trace what was
            actually recorded.
          </p>
        </Section>

        <Section id="why-external" title="Why a graph, and why outside the model">
          <p>
            I want to inspect and update an individual record without retraining a model. An external store gives
            each claim an identifier, evidence links, and revision history that an application can query directly.
          </p>
          <Figures
            items={[
              { value: 'Source', label: 'evidence links', note: 'what supports the claim' },
              { value: 'History', label: 'revision links', note: 'what changed and what it replaced' },
            ]}
          />
          <p>
            Several agents can use the same store. They still need rules for resolving disagreement; sharing a
            graph alone doesn't make their conclusions consistent.
          </p>
        </Section>

        <Section id="packages" title="How it's packaged">
          <p>
            <code>engrammic-primitives</code> is the schema, Apache 2.0: the layers, the edge types, the promotion
            scoring. The engine sits over a graph store and exposes an MCP server, so any agent that already speaks
            MCP can use its tools without a bespoke SDK. Manifold explores a version for latent embeddings.
          </p>
        </Section>

        <Section id="benchmarks" title="What the gate buys">
          <p>
            An internal evaluation note reports the following results from 500 annotated coding-agent sessions,
            comparing the CITE write gate with a RAG baseline. The dataset and run configuration are not included
            on this page, so these figures should be read as reported results for that evaluation.
          </p>
          <Figures
            items={[
              { value: '95%', label: 'contradictions caught', note: 'baseline catches 66%' },
              { value: '87%', label: 'corrections propagated', note: 'baseline reaches 12%' },
              { value: '73%', label: 'contamination blocked', note: 'baseline lets it through' },
              { value: '180ms', label: 'median write latency', note: 'baseline 15ms; increase 165ms' },
            ]}
          />
          <Manifesto>The useful test is whether a correction reaches the next task that depends on it.</Manifesto>
          <p>
            The research is at <a href="https://engrammic.ai/research">engrammic.ai/research</a>.
            If you work on agent memory, belief revision, or multi-agent coordination, I would like to compare
            approaches and evaluation methods.
          </p>
        </Section>

        <footer className="mt-20 flex items-center justify-between border-t border-[#1c1a17]/12 pt-10">
          <span aria-hidden className={`${SERIF} select-none text-3xl text-[#1c1a17]/15`}>
            {p.jp}
          </span>
          <TLink
            to={lp('/portfolio')}
            className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#1c1a17]/50 transition-colors hover:text-[#9a6f33]"
          >
            back to portfolio
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </TLink>
        </footer>
      </div>
    </main>
  )
}
