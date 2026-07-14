import { useEffect, useRef, useState } from 'react'
import { TLink } from '../../components/page-transition'
import { Meta } from '../../lib/meta'
import { posts } from '../../lib/posts'
import { filterPosts, groupByYear } from '../../lib/blog-list'
import { Rule, SectionNumber, JPLabel } from '../../components/motifs'
import { ArrowRight } from '../../components/icons'
import { getListThumbnail } from '../../lib/thumbnails'
import { SurveillanceCard } from '../../components/surveillance-card'
import { CRTCard } from '../../components/crt-card'
import { useReveal } from '../../lib/motion'
import { revealBlogList } from '../../lib/reveals'
import { SideFlourish } from '../../components/side-flourish'
import { TopFlourish } from '../../components/top-flourish'
import DecryptedText from '../../components/react-bits/DecryptedText'
import Magnetic from '../../components/react-bits/Magnetic'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const dayOf = (iso: string) => iso.slice(8, 10)
const monthOf = (iso: string) => MONTHS[Number(iso.slice(5, 7)) - 1] ?? iso.slice(5, 7)

export default function BlogIndex() {
  const [q, setQ] = useState('')
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)
  const groups = groupByYear(filterPosts(posts, q))
  const stats = {
    posts: posts.length,
    tags: new Set(posts.flatMap((p) => p.tags)).size,
    since: posts.reduce((m, p) => (p.date < m ? p.date : m), posts[0]?.date ?? '2023').slice(0, 4),
  }

  // reveal rows as they enter (IntersectionObserver); re-runs on search
  useEffect(() => revealBlogList(scope.current), [q])

  return (
    <>
      <Meta title="Blog" description="Weekly notes, CTF writeups, and Linux journeys." />

      <SideFlourish variant={2} /> {/* Kana */}

      <section ref={scope} className="relative mx-auto max-w-4xl px-6 pb-24 pt-36">
        <TopFlourish variant={0} stats={stats} /> {/* Readout */}
        <div data-reveal className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
          <div className="relative">
            <SectionNumber n="02" label="blog" />
            <div className="relative mt-3 w-fit">
              {/* vertical JP label centered on the big heading, not floating up by the section number */}
              <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex">
                <JPLabel>ブログ</JPLabel>
                <span aria-hidden className="h-4 w-px bg-gold/50" />
              </div>
              <h1 className="font-display text-5xl font-black text-charcoal dark:text-bone">
                <DecryptedText text="Blog" speed={50} delay={100} />
              </h1>
            </div>
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search posts..."
            aria-label="Search posts"
            className="w-full max-w-xs border-b border-charcoal/25 bg-transparent pb-1 font-mono text-xs font-medium tracking-wider outline-none placeholder:text-charcoal/55 focus:border-gold dark:border-bone/25 dark:placeholder:text-bone/55 transition-colors"
          />
        </div>

        <div data-reveal>
          <Rule className="mt-8" />
        </div>

        {groups.length === 0 && (
          <p className="mt-16 font-mono text-xs font-medium uppercase tracking-[0.25em] text-charcoal/65 dark:text-bone/65">
            no posts match [ {q} ]
          </p>
        )}

        {groups.map(({ year, posts: yearPosts }) => (
          <div key={year} className="mt-16">
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm font-semibold tracking-[0.3em] text-gold">{year}</span>
              <div data-yearline className="h-px flex-1 bg-charcoal/10 dark:bg-bone/10" />
            </div>
            <ul className="mt-10 space-y-12">
              {yearPosts.map((post) => {
                const img = getListThumbnail(post.slug)
                // Special posts get custom card layouts per slug
                if (post.slug === 'chat-control-eu' && img) {
                  return <SurveillanceCard key={post.slug} post={post} img={img} dayOf={dayOf} monthOf={monthOf} />
                }
                if (post.slug === 'epistemic-collapse' && img) {
                  return <CRTCard key={post.slug} post={post} img={img} dayOf={dayOf} monthOf={monthOf} />
                }
                return (
                  <li key={post.slug} data-post className="group grid gap-x-6 gap-y-4 md:grid-cols-12 md:items-start">
                    {/* Date column — big editorial day + mono month */}
                    <div data-col className="md:col-span-2">
                      <time dateTime={post.date} className="flex items-baseline gap-2.5 md:flex-col md:gap-1.5">
                        <span className="font-display text-3xl font-black leading-none tracking-tight text-charcoal/90 transition-colors duration-200 group-hover:text-gold dark:text-bone/90">
                          {dayOf(post.date)}
                        </span>
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-charcoal/60 dark:text-bone/60">
                          {monthOf(post.date)}
                        </span>
                      </time>
                    </div>

                    {/* Image Preview column */}
                    <div data-col className="md:col-span-3">
                      {img ? (
                        <div data-thumb className="overflow-hidden rounded border border-charcoal/10 dark:border-bone/10 bg-black aspect-[16/10] w-full shrink-0 shadow-sm transition-all duration-300 group-hover:border-gold/30">
                          <img
                            src={img}
                            alt=""
                            className="h-full w-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[16/10] w-full items-center justify-center rounded border border-dashed border-charcoal/15 bg-bone-tint/20 dark:border-bone/15 dark:bg-charcoal-tint/10">
                          <span className="font-mono text-[10px] font-medium text-charcoal/45 dark:text-bone/45 uppercase tracking-widest">
                            [ doc ]
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata and Title column */}
                    <div data-col className="md:col-span-7 flex flex-col">
                      <Magnetic range={20}>
                        <TLink
                          to={`/blog/${post.slug}`}
                          className="font-display text-xl font-bold leading-snug text-charcoal transition-all duration-200 group-hover:translate-x-1 group-hover:text-paper-deep dark:text-bone dark:group-hover:text-paper md:text-2xl"
                        >
                          {post.title}
                        </TLink>
                      </Magnetic>
                      {post.description && (
                        <p className="mt-2 text-sm font-medium leading-relaxed text-charcoal/75 dark:text-bone/75">
                          {post.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2.5">
                        {post.tags.map((t) => (
                          <span
                            key={t}
                            className="font-mono text-[10px] font-medium uppercase tracking-wider text-charcoal/65 dark:text-bone/65 border border-charcoal/15 rounded px-1.5 py-0.5 dark:border-bone/15"
                          >
                            #{t}
                          </span>
                        ))}
                        <ArrowRight className="ml-auto h-4 w-4 shrink-0 -translate-x-1 text-gold opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>
    </>
  )
}
