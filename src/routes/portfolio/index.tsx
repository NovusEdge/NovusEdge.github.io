import { useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Meta } from '../../lib/meta'
import { projects } from '../../content/projects'
import { SectionNumber, JPLabel, MonoTag, RegMarks } from '../../components/motifs'
import { prefersReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

export default function PortfolioIndex() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // below md the container doesn't scroll (window does); pointing scroller at it
      // there means triggers never fire and content stays at opacity 0
      const snapContainerScrolls = matchMedia('(min-width: 768px)').matches
      gsap.utils.toArray<HTMLElement>('[data-project]', container.current).forEach((section) => {
        gsap.from(section.querySelectorAll('[data-item]'), {
          opacity: 0,
          y: 32,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: section,
            scroller: snapContainerScrolls ? container.current : undefined,
            start: 'top 55%',
          },
        })
      })
    },
    { scope: container },
  )

  return (
    <>
      <Meta title="Portfolio" description="Projects and builds." />
      {/* ponytail: snap only on md+ — spec's mobile fallback is plain stacked sections */}
      <div ref={container} className="md:h-screen md:snap-y md:snap-mandatory md:overflow-y-auto">
        {projects.map((p, i) => (
          <section
            key={p.slug}
            data-project
            className="relative flex min-h-screen items-center px-6 py-24 md:snap-start md:px-20 odd:bg-bone-tint/50 dark:odd:bg-charcoal-tint/60"
          >
            <RegMarks />
            <div className="grid w-full items-center gap-10 md:grid-cols-[1fr_1px_1fr] md:gap-16">
              {/* text left */}
              <div className="max-w-lg md:justify-self-end">
                <div data-item>
                  <SectionNumber n={String(i + 1).padStart(2, '0')} label="portfolio" />
                </div>
                <h2 data-item className="mt-4 font-display text-5xl font-black md:text-6xl">
                  <Link to={`/portfolio/${p.slug}`} className="transition-colors hover:text-paper-deep dark:hover:text-paper">
                    {p.title}
                  </Link>
                </h2>
                <p data-item className="mt-5 text-charcoal/70 dark:text-bone/70">
                  {p.description}
                </p>
                <div data-item className="mt-5 flex flex-wrap gap-3">
                  {p.tech.map((t) => (
                    <MonoTag key={t}>{t}</MonoTag>
                  ))}
                </div>
                <div data-item className="mt-8">
                  <Link
                    to={`/portfolio/${p.slug}`}
                    className="link-draw font-mono text-xs uppercase tracking-[0.25em] text-paper-deep dark:text-paper"
                  >
                    details →
                  </Link>
                </div>
              </div>

              {/* vertical line */}
              <div className="relative hidden h-64 w-px self-center bg-charcoal/20 md:block dark:bg-bone/20">
                <span className="absolute -left-[2px] top-0 size-[5px] bg-gold" />
              </div>

              {/* image right */}
              <div data-item className="relative md:max-w-md">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="w-full rounded-sm" />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center border border-charcoal/15 dark:border-bone/15">
                    {p.jp && <JPLabel className="text-2xl">{p.jp}</JPLabel>}
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
