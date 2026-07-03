import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Meta } from '../../lib/meta'
import { posts } from '../../lib/posts'
import { filterPosts, groupByYear } from '../../lib/blog-list'
import { Rule, SectionNumber, JPLabel, MonoTag } from '../../components/motifs'
import { useReveal } from '../../lib/motion'

export default function BlogIndex() {
  const [q, setQ] = useState('')
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)
  const groups = groupByYear(filterPosts(posts, q))

  return (
    <>
      <Meta title="Blog" description="Weekly notes, CTF writeups, and Linux journeys." />
      <section ref={scope} className="relative mx-auto max-w-3xl px-6 pb-24 pt-36">
        <JPLabel className="absolute -left-2 top-40 hidden lg:block">ブログ</JPLabel>

        <div data-reveal className="flex items-baseline justify-between gap-6">
          <div>
            <SectionNumber n="02" label="blog" />
            <h1 className="mt-3 font-display text-5xl font-black">Blog</h1>
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search…"
            aria-label="Search posts"
            className="w-40 border-b border-charcoal/20 bg-transparent pb-1 font-mono text-xs tracking-wider outline-none placeholder:text-charcoal/40 focus:border-gold md:w-56 dark:border-bone/20 dark:placeholder:text-bone/40"
          />
        </div>

        <div data-reveal>
          <Rule className="mt-8" />
        </div>

        {groups.length === 0 && (
          <p className="mt-16 font-mono text-xs uppercase tracking-[0.25em] text-charcoal/50 dark:text-bone/50">
            no posts match “{q}”
          </p>
        )}

        {groups.map(({ year, posts: yearPosts }) => (
          <div key={year} className="mt-14" data-reveal>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm font-medium tracking-[0.3em] text-gold">{year}</span>
              <div className="h-px flex-1 bg-charcoal/10 dark:bg-bone/10" />
            </div>
            <ul className="mt-6 space-y-6">
              {yearPosts.map((post) => (
                <li key={post.slug} className="group grid grid-cols-[6rem_1fr] items-baseline gap-4">
                  <MonoTag>{post.date.slice(5)}</MonoTag>
                  <div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="font-display text-xl font-medium transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-paper-deep dark:group-hover:text-paper"
                    >
                      {post.title}
                    </Link>
                    {post.description && (
                      <p className="mt-1 text-sm text-charcoal/60 dark:text-bone/60">{post.description}</p>
                    )}
                    <div className="mt-1.5 flex gap-3">
                      {post.tags.map((t) => (
                        <MonoTag key={t}>{t}</MonoTag>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  )
}
