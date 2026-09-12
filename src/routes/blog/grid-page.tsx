import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TLink } from '../../components/page-transition'
import { Meta } from '../../lib/meta'
import { GridMarkdown, gridHeadings, markMoney } from '../../components/grid-markdown'
import { GridIndex } from '../../components/grid-index'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { Post } from '../../lib/posts'

export function GridPage({ post, image }: { post: Post; image?: string | null }) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()
  // Stable identity: GridIndex keys its scroll listener off this array.
  const heads = useMemo(() => gridHeadings(post.content, t), [post.content, t])

  useEffect(() => {
    document.documentElement.classList.add('fg-frost')
    return () => document.documentElement.classList.remove('fg-frost')
  }, [])

  return (
    <div className="fg" lang={post.contentLocale}>
      <Meta title={post.title} description={post.description || post.title} image={image} />

      <div className="fg-shell pb-24">
        <nav className="fg-masthead">
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
          {/* The essay never names the city. A masthead location would assert a
              fact the reporting does not have. */}
          <span>{t('blog.grid.location')}</span>
        </nav>

        <header className="fg-head">
          <p className="fg-chip">
            <span className="fg-chip-n">00</span>
            {t('blog.grid.essay')}
          </p>
          <h1>{markMoney(post.title)}</h1>
          <p className="fg-standfirst">{post.description}</p>
          <p className="fg-byline">
            NovusEdge
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
            </time>
          </p>
        </header>

        <GridIndex heads={heads} />

        <div className="fg-body">
          <GridMarkdown>{post.content}</GridMarkdown>
        </div>

        <footer className="fg-end">
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
        </footer>
      </div>
    </div>
  )
}
