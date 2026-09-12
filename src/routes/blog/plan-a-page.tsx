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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

function headings(content: string): { id: string; text: string }[] {
  return [...content.matchAll(/^## (.+)$/gm)].map((m) => ({
    id: slugify(m[1]),
    text: m[1],
  }))
}

function days(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / 86_400_000
}

/**
 * The gap the essay is about, drawn to scale: publication to machine-checked
 * proof is 61 days, publication to the plan's first negotiating milestone is
 * 907. At true scale the first two marks nearly collide, which is the argument.
 */
function Runway() {
  const span = days(PUBLISHED, MILESTONE)
  const proofAt = (days(PUBLISHED, PROOF) / span) * 100

  return (
    <figure className="pa-runway">
      <svg viewBox="-2 0 104 26" className="w-full" role="img" aria-label="Plan A published July 9 2026, Navier-Stokes proof 61 days later, first negotiating milestone 2029">
        <line x1="0.4" y1="13" x2="99.6" y2="13" stroke="rgba(17,17,17,0.3)" strokeWidth="0.3" />
        <line x1="0.4" y1="13" x2={proofAt} y2="13" stroke="#93392a" strokeWidth="1.1" />
        <circle cx="0.4" cy="13" r="1.1" fill="#93392a" />
        <circle cx={proofAt} cy="13" r="1.1" fill="#93392a" />
        <circle cx="99.6" cy="13" r="1.1" fill="none" stroke="rgba(17,17,17,0.45)" strokeWidth="0.35" />
        <text x="0.4" y="7.6" fontSize="3.1" fill="#111" textAnchor="start">9 Jul 2026</text>
        <text x="0.4" y="21.5" fontSize="2.7" fill="rgba(17,17,17,0.6)" textAnchor="start">Plan A published</text>
        <text x="99.6" y="7.6" fontSize="3.1" fill="#111" textAnchor="end">2029</text>
        <text x="99.6" y="21.5" fontSize="2.7" fill="rgba(17,17,17,0.6)" textAnchor="end">negotiate, declare, pause</text>
      </svg>
      <figcaption>
        <span className="pa-runway-n">61</span> days from publication to a Lean-checked proof of a Millennium Prize
        problem. <span className="pa-runway-n">907</span> to the first thing the plan asks anyone to do.
      </figcaption>
    </figure>
  )
}

export function PlanAPage({ post, image }: { post: Post; image?: string | null }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const toc = headings(post.content)

  useEffect(() => {
    document.documentElement.classList.add('plan-a-paper')
    return () => document.documentElement.classList.remove('plan-a-paper')
  }, [])

  return (
    <div className="pa">
      <Meta title={post.title} description={post.description || post.title} image={image} />

      <div className="pa-shell pb-24 pt-8">
        <nav className="pa-masthead">
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
          <a href="https://ai-2040.com/" target="_blank" rel="noreferrer noopener">
            the document in question
          </a>
        </nav>

        <header className="pa-head">
          <div className="pa-col">
            <h1>{post.title}</h1>
            <p className="pa-byline">
              NovusEdge
              <span className="pa-byline-sep">·</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
            </p>
            <p className="pa-standfirst">{post.description}</p>
          </div>
          <Runway />
        </header>

        <hr />

        <nav className="pa-col pa-contents" aria-label="Contents">
          <h2>Contents</h2>
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
            Typeset in ET Book, because the argument is partly about how much work a document's clothes do for it.
          </p>
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
        </footer>
      </div>
    </div>
  )
}
