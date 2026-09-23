import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TLink } from '../../components/page-transition'
import { Meta } from '../../lib/meta'
import { blogHeadings } from '../../lib/blog-headings'
import { OpenJevProgress } from '../../components/openjev-progress'
import { PlanAMarkdown } from '../../components/plan-a-markdown'
import { OpenJevRail, OpenJevStatic } from '../../components/openjev-board'
import { OPENJEV_FIGURES } from '../../components/openjev-figures'
import { DOI, DOI_URL, REPO_URL } from '../../lib/openjev-data'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { Post } from '../../lib/posts'



/**
 * Index of the last heading above 40% of the viewport, or -1 above the first.
 * Only the margin list may hold this state: a re-render of the page rebuilds
 * the markdown and remounts every chart, which closes an open chart dialog.
 */


export function OpenJevPage({ post, image }: { post: Post; image?: string | null }) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()
  const [toc] = useState(() => blogHeadings(post.content, post.slug))

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
          <span className="oj-masthead-links">
            <a href={DOI_URL} target="_blank" rel="noreferrer noopener">
              doi:{DOI}
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
              {t('blog.openjev.weights')}
            </a>
          </span>
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


        <div className="pa-col oj-inline">
          <OpenJevStatic />
        </div>

        <div className="pa-spread oj-spread">
          <div className="pa-col pa-body">
            <PlanAMarkdown slug={post.slug} figures={OPENJEV_FIGURES} numbers highlight>
              {post.content}
            </PlanAMarkdown>
          </div>
          <div className="pa-rail">
            <OpenJevRail />
          </div>
        </div>

        <OpenJevProgress sections={toc} />

        <hr />

        <footer className="pa-col pa-end">
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
        </footer>
      </div>
    </div>
  )
}
