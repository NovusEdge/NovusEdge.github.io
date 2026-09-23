import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TLink } from '../../components/page-transition'
import { Meta } from '../../lib/meta'
import { blogHeadings } from '../../lib/blog-headings'
import { PlanAMarkdown } from '../../components/plan-a-markdown'
import { OpenJevRail, OpenJevStatic } from '../../components/openjev-board'
import { REPO_URL } from '../../lib/openjev-data'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { Post } from '../../lib/posts'

/**
 * The first run cost 40 cents and the project cost 4 dollars, drawn to scale
 * like Plan A's runway. The first mark sits a tenth of the way along.
 */
function CostStrip() {
  const { t } = useTranslation()
  const first = 0.4 + (99.2 * 0.4) / 4
  return (
    <figure className="pa-runway">
      <svg viewBox="-2 0 104 26" className="w-full" role="img" aria-label={t('blog.openjev.costLabel')}>
        <line x1="0.4" y1="13" x2="99.6" y2="13" stroke="color-mix(in srgb, var(--pa-ink) 30%, transparent)" strokeWidth="0.3" />
        <line x1="0.4" y1="13" x2={first} y2="13" stroke="var(--pa-ox)" strokeWidth="1.1" />
        <circle cx="0.4" cy="13" r="1.1" fill="var(--pa-ox)" />
        <circle cx={first} cy="13" r="1.1" fill="var(--pa-ox)" />
        <circle cx="99.6" cy="13" r="1.1" fill="none" stroke="color-mix(in srgb, var(--pa-ink) 45%, transparent)" strokeWidth="0.35" />
        <text x={first} y="7.6" fontSize="3.1" fill="var(--pa-ink)" textAnchor="middle">$0.40</text>
        <text x="0.4" y="21.5" fontSize="2.7" fill="color-mix(in srgb, var(--pa-ink) 60%, transparent)" textAnchor="start">{t('blog.openjev.costFirst')}</text>
        <text x="99.6" y="7.6" fontSize="3.1" fill="var(--pa-ink)" textAnchor="end">$4</text>
        <text x="99.6" y="21.5" fontSize="2.7" fill="color-mix(in srgb, var(--pa-ink) 60%, transparent)" textAnchor="end">{t('blog.openjev.costLast')}</text>
      </svg>
    </figure>
  )
}

export function OpenJevPage({ post, image }: { post: Post; image?: string | null }) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()
  const toc = blogHeadings(post.content, post.slug)

  useEffect(() => {
    document.documentElement.classList.add('plan-a-paper')
    return () => document.documentElement.classList.remove('plan-a-paper')
  }, [])

  return (
    <div className="pa" lang={post.contentLocale}>
      <Meta title={post.title} description={post.description || post.title} image={image} />

      <div className="pa-shell pb-24 pt-8">
        <nav className="pa-masthead">
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
          <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
            {t('blog.openjev.weights')}
          </a>
        </nav>

        <header className="pa-head">
          <div className="pa-col">
            <h1>{post.title}</h1>
            <p className="pa-byline">
              NovusEdge
              <span className="pa-byline-sep">·</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
              </time>
            </p>
            <p className="pa-standfirst">{post.description}</p>
          </div>
          <CostStrip />
        </header>

        <hr />

        <nav className="pa-col pa-contents" aria-label={t('blog.contents')}>
          <h2>{t('blog.contents')}</h2>
          <ol>
            {toc.map((h, i) => (
              <li key={h.id}>
                <span className="pa-contents-n">{String(i + 1).padStart(2, '0')}</span>
                <a href={`#${h.id}`}>{h.text.replace(/\*/g, '')}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="pa-col oj-inline">
          <OpenJevStatic />
        </div>

        <div className="pa-spread">
          <div className="pa-col pa-body">
            <PlanAMarkdown slug={post.slug}>{post.content}</PlanAMarkdown>
          </div>
          <div className="pa-rail">
            <OpenJevRail />
          </div>
        </div>

        <hr />

        <footer className="pa-col pa-end">
          <p>{t('blog.openjev.typeset')}</p>
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
        </footer>
      </div>
    </div>
  )
}
