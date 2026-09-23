import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TLink } from '../../components/page-transition'
import { Meta } from '../../lib/meta'
import { blogHeadings } from '../../lib/blog-headings'
import { PlanAMarkdown } from '../../components/plan-a-markdown'
import { OpenJevRail, OpenJevStatic } from '../../components/openjev-board'
import { OPENJEV_FIGURES } from '../../components/openjev-figures'
import { REPO_URL } from '../../lib/openjev-data'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { Post } from '../../lib/posts'

type Head = { id: string; text: string }

function Contents({ toc, current, className }: { toc: Head[]; current: number; className: string }) {
  const { t } = useTranslation()
  return (
    <nav className={`pa-contents ${className}`} aria-label={t('blog.contents')}>
      <h2>{t('blog.contents')}</h2>
      <ol>
        {toc.map((h, i) => (
          <li key={h.id} aria-current={i === current ? 'location' : undefined}>
            <span className="pa-contents-n">{String(i + 1).padStart(2, '0')}</span>
            <a href={`#${h.id}`}>{h.text.replace(/\*/g, '')}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Index of the last heading above 40% of the viewport, or -1 above the first. */
function useCurrentSection(toc: Head[]): number {
  const [current, setCurrent] = useState(-1)
  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      const line = window.innerHeight * 0.4
      let at = -1
      toc.forEach((h, i) => {
        const el = document.getElementById(h.id)
        if (el && el.getBoundingClientRect().top <= line) at = i
      })
      setCurrent(at)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [toc])
  return current
}

export function OpenJevPage({ post, image }: { post: Post; image?: string | null }) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()
  const [toc] = useState(() => blogHeadings(post.content, post.slug))
  const current = useCurrentSection(toc)

  useEffect(() => {
    document.documentElement.classList.add('plan-a-paper')
    return () => document.documentElement.classList.remove('plan-a-paper')
  }, [])

  return (
    <div className="pa oj" lang={post.contentLocale}>
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
        </header>

        <hr />

        <Contents toc={toc} current={-1} className="pa-col oj-contents-inline" />

        <div className="pa-col oj-inline">
          <OpenJevStatic />
        </div>

        <div className="pa-spread oj-spread">
          <div className="oj-margin">
            <Contents toc={toc} current={current} className="oj-contents-rail" />
          </div>
          <div className="pa-col pa-body">
            <PlanAMarkdown slug={post.slug} figures={OPENJEV_FIGURES}>
              {post.content}
            </PlanAMarkdown>
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
