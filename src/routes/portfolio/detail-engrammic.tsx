import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import gsap from 'gsap'
import { TLink } from '../../components/page-transition'
import { Globe, Github, Package, FileText, ArrowRight } from '../../components/icons'
import { prefersReducedMotion } from '../../lib/motion'
import { techRef } from '../../lib/tech-icons'
import SuperpositionGraph from '../../components/engrammic/SuperpositionGraph'
import type { LayoutProps } from './layouts'

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
          to="/portfolio"
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
              Before intelligence can be <em className="italic text-[#9a6f33]">trusted</em>, it must learn to{' '}
              <em className="italic text-[#9a6f33]">doubt</em>.
            </p>

            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#1c1a17]/70">
              Epistemic memory for agents. Every observation enters as a sourced claim, and a claim has to survive
              consensus before it counts as a fact an agent can act on. This page is the architecture; the{' '}
              <TLink to="/blog/on-building-something-engrammic" className="underline decoration-[#9a6f33]/40 underline-offset-2 hover:decoration-[#9a6f33]">
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
            Agent memory gets treated as retrieval. Find the nearest chunk, put it in the window, hope it's true.
            The failure has a shape: an agent records "the API uses OAuth" on Monday and "the API uses API keys" on
            Tuesday, keeps both, and later serves whichever one embeds closer to the query. Nothing in the store ever
            asked which is true, or when it stopped being true.
          </p>
          <Manifesto>Engrammic treats memory as epistemics: what an agent holds, why it holds it, and whether it still holds.</Manifesto>
          <p>
            The rest of this page is the machinery that makes that concrete. A data model that separates claims from
            facts, a gate that runs at write time, and a provenance graph you can walk to answer "why does it believe
            this?"
          </p>
        </Section>

        <Section id="the-model" title="The model: observations, claims, facts">
          <p>
            Four layers stack on top of each other. An <strong>observation</strong> is a raw event bound to the
            source that produced it. It enters the store as a <strong>claim</strong>, a statement the system holds
            provisionally, never as ground truth. Claims that corroborate each other accumulate weight, and a claim
            that survives consensus crystallizes into a <strong>fact</strong>. A fact placed in the context of other
            facts is a <strong>belief</strong>, which is what an agent actually reasons from.
          </p>
          <p>
            All of it lives as nodes and typed edges in a graph store, because provenance <em>is</em> edges. A claim
            points at its source. A fact points at the claims that promoted it. A superseding fact points at the one
            it replaced. The schema, the edge types, and the scoring functions that decide promotion ship as{' '}
            <code>engrammic-primitives</code>.
          </p>
        </Section>

        <Section id="the-gate" title="The write gate">
          <p>
            Most memory systems resolve conflicts at read time, if at all. Engrammic resolves them on write. When a
            new claim contradicts an existing fact, the write does not append another row. It stops and forces a
            decision: supersede the fact, corroborate the claim, or hold both in suspension pending a human.
          </p>
          <Term>{`$ engrammic write --claim "the API uses API keys" --source session:4f21
✗ rejected: contradiction
  existing fact: "the API uses OAuth2" (crystallized 2026-04-02, 3 sources)
  resolve: supersede the existing fact, or add corroboration to this claim`}</Term>
          <p>
            The cost lands where it belongs, at write time, on the writes that actually conflict. A quiet pile of
            contradictions never accumulates to resurface mid-task three weeks later.
          </p>
        </Section>

        <Section id="provenance" title="Provenance and time">
          <p>
            Every write carries two timestamps: one for when the thing happened, one for when the system learned it.
            That bi-temporal record makes "what did the agent believe last Tuesday?" a query with a real answer,
            rather than a reconstruction.
          </p>
          <p>
            A stronger claim supersedes a fact instead of overwriting it. A typed edge links the old fact to the one
            that replaced it, and the old fact stays in the graph marked no longer current. When an enterprise asks
            why an agent told a customer something, the answer is a walk over the graph from the statement back to
            the observations it rests on, not a shrug.
          </p>
        </Section>

        <Section id="why-external" title="Why a graph, and why outside the model">
          <p>
            The obvious question is why not keep beliefs in the model. Weights are a poor store. They hold roughly
            3.6 bits per parameter, split between generalizing and memorizing, which caps a 70-billion parameter
            model near 31GB before it reasons at all, and correcting one belief means retraining.
          </p>
          <Figures
            items={[
              { value: '3.6', label: 'bits per parameter', note: 'split between generalizing and memorizing' },
              { value: '31 GB', label: 'memorization ceiling', note: 'a 70B model, before it reasons at all' },
            ]}
          />
          <p>
            Auditing fails too: superposition means one neuron encodes pieces of many features, so "what does the
            model believe about X" asks about a mixture. A separate graph gives the opposite properties, explicit,
            queryable, revisable, and shared, so agents writing to it reach consensus rather than diverging the way
            partitioned distributed systems do.
          </p>
        </Section>

        <Section id="packages" title="How it's packaged">
          <p>
            <code>engrammic-primitives</code> is the schema, Apache 2.0: the layers, the edge types, the promotion
            scoring. The engine sits over a graph store and exposes an MCP server, so any agent that already speaks
            MCP reads and writes against it with no bespoke SDK. Manifold, a version of the same engine for latent
            embeddings instead of text, exists as a design document and waits on a customer who needs multimodal
            memory.
          </p>
        </Section>

        <Section id="benchmarks" title="What the gate buys">
          <p>
            Measured over 500 annotated coding-agent sessions, each comparing the write gate against an
            embedding-only, append-only baseline.
          </p>
          <Figures
            items={[
              { value: '95%', label: 'contradictions caught', note: 'baseline catches 66%' },
              { value: '87%', label: 'corrections propagated', note: 'baseline reaches 12%' },
              { value: '73%', label: 'contamination blocked', note: 'baseline lets it through' },
              { value: '165ms', label: 'median gate latency', note: 'and it runs only on writes that need it' },
            ]}
          />
          <Manifesto>A belief needs a source. Everything else is output with confidence attached.</Manifesto>
          <p>
            An agent running on this answers, on demand, what it knows, what it only generated, and which of the two
            a given conclusion rests on. An agent without the split answers none of them and still sounds equally
            sure. I think the next decade of AI turns on trust, not capability, and the research is open at{' '}
            <a href="https://engrammic.ai/research">engrammic.ai/research</a> because the problem is bigger than one
            company. If you work on agent memory, belief revision, or multi-agent coordination, I want to hear from
            you.
          </p>
        </Section>

        <footer className="mt-20 flex items-center justify-between border-t border-[#1c1a17]/12 pt-10">
          <span aria-hidden className={`${SERIF} select-none text-3xl text-[#1c1a17]/15`}>
            {p.jp}
          </span>
          <TLink
            to="/portfolio"
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
