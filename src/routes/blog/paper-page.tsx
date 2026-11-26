import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TLink } from '../../components/page-transition'
import { Meta } from '../../lib/meta'
import { PlanAMarkdown } from '../../components/plan-a-markdown'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { Post } from '../../lib/posts'

/** Plan A's paper, without Plan A's runway and masthead link. `head` sits beside the title; `rail` sticks beside the text on desktop. */
export function PaperPage({ post, image, figures, head, rail }: { post: Post; image?: string | null; figures?: Record<string, ReactNode>; head?: ReactNode; rail?: ReactNode }) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()

  useEffect(() => {
    document.documentElement.classList.add('plan-a-paper')
    return () => document.documentElement.classList.remove('plan-a-paper')
  }, [])

  return (
    <div className="pa pa-paper" lang={post.contentLocale}>
      <Meta title={post.title} description={post.description || post.title} image={image} />

      <div className="pa-shell pb-24 pt-8">
        <nav className="pa-masthead">
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
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
          {head}
        </header>

        <hr />

        <div className="pa-spread">
          <div className="pa-col pa-body">
            <PlanAMarkdown slug={post.slug} figures={figures} numbers>
              {post.content}
            </PlanAMarkdown>
          </div>
          {rail && <div className="pa-rail">{rail}</div>}
        </div>

        <hr />

        <footer className="pa-col pa-end">
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
        </footer>
      </div>
    </div>
  )
}
