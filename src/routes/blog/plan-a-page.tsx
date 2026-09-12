import { blogHeadings } from '../../lib/blog-headings'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TLink } from '../../components/page-transition'
import { Meta } from '../../lib/meta'
import { PlanAMarkdown, markPlanA } from '../../components/plan-a-markdown'
import { PlanAFence } from '../../components/plan-a-fence'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { Post } from '../../lib/posts'

const PUBLISHED = '2026-07-09'
const PROOF = '2026-09-08'
const MILESTONE = '2029-01-01'

function days(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / 86_400_000
}

/**
 * The gap the essay is about, drawn to scale: publication to machine-checked
 * proof is 61 days, publication to the plan's first negotiating milestone is
 * 907. At true scale the first two marks nearly collide, which is the argument.
 */
function Runway() {
  const { t, i18n } = useTranslation()
  const span = days(PUBLISHED, MILESTONE)
  const proofAt = (days(PUBLISHED, PROOF) / span) * 100

  return (
    <figure className="pa-runway">
      <svg viewBox="-2 0 104 26" className="w-full" role="img" aria-label={t('blog.planA.runwayLabel')}>
        <line x1="0.4" y1="13" x2="99.6" y2="13" stroke="color-mix(in srgb, var(--pa-ink) 30%, transparent)" strokeWidth="0.3" />
        <line x1="0.4" y1="13" x2={proofAt} y2="13" stroke="var(--pa-ox)" strokeWidth="1.1" />
        <circle cx="0.4" cy="13" r="1.1" fill="var(--pa-ox)" />
        <circle cx={proofAt} cy="13" r="1.1" fill="var(--pa-ox)" />
        <circle cx="99.6" cy="13" r="1.1" fill="none" stroke="color-mix(in srgb, var(--pa-ink) 45%, transparent)" strokeWidth="0.35" />
        <text x="0.4" y="7.6" fontSize="3.1" fill="var(--pa-ink)" textAnchor="start">{new Date(PUBLISHED).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</text>
        <text x="0.4" y="21.5" fontSize="2.7" fill="color-mix(in srgb, var(--pa-ink) 60%, transparent)" textAnchor="start">{t('blog.planA.published')}</text>
        <text x="99.6" y="7.6" fontSize="3.1" fill="var(--pa-ink)" textAnchor="end">2029</text>
        <text x="99.6" y="21.5" fontSize="2.7" fill="color-mix(in srgb, var(--pa-ink) 60%, transparent)" textAnchor="end">{t('blog.planA.milestone')}</text>
      </svg>
      <figcaption>
        <span className="pa-runway-n">61</span> {t('blog.planA.runwayFirst')} <span className="pa-runway-n">907</span> {t('blog.planA.runwayLast')}
      </figcaption>
    </figure>
  )
}

export function PlanAPage({ post, image }: { post: Post; image?: string | null }) {
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
          <a href="https://ai-2040.com/" target="_blank" rel="noreferrer noopener">
            {t('blog.planA.document')}
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
          <Runway />
        </header>

        <hr />

        <nav className="pa-col pa-contents" aria-label={t('blog.contents')}>
          <h2>{t('blog.contents')}</h2>
          <ol>
            {toc.map((h, i) => (
              <li key={h.id}>
                <span className="pa-contents-n">{String(i + 1).padStart(2, '0')}</span>
                <a href={`#${h.id}`}>{markPlanA(h.text)}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="pa-spread">
          <div className="pa-col pa-body">
            <PlanAMarkdown>{post.content}</PlanAMarkdown>
          </div>
          <div className="pa-rail">
            <PlanAFence />
          </div>
        </div>

        <hr />

        <footer className="pa-col pa-end">
          <p>
            {t('blog.planA.typeset')}
          </p>
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
        </footer>
      </div>
    </div>
  )
}
