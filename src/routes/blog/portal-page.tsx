import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TLink } from '../../components/page-transition'
import { Meta } from '../../lib/meta'
import { PORTAL_DOC, PortalMarkdown, portalModules } from '../../components/portal-markdown'
import { PortalProgress, useReadingProgress } from '../../components/portal-progress'
import { useReveal } from '../../lib/motion'
import { useLocalePath } from '../../i18n/use-locale-path'
import { posts, type Post } from '../../lib/posts'

const SERIES = 'Series 26'

export function PortalPage({ post, image }: { post: Post; image?: string | null }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const scope = useRef<HTMLDivElement>(null)
  // Stable identity: useReadingProgress keys its scroll listener off this array.
  const mods = useMemo(() => portalModules(post.content), [post.content])
  const progress = useReadingProgress(mods)
  // posts is sorted newest first, so the first published post at or before
  // this date is the next one down the list.
  const next = posts.find((p) => p.slug !== post.slug && !p.draft && p.date <= post.date)

  useReveal(scope)

  useEffect(() => {
    document.documentElement.classList.add('op-portal')
    return () => document.documentElement.classList.remove('op-portal')
  }, [])

  return (
    <div className="op" ref={scope}>
      <Meta title={post.title} description={post.description || post.title} image={image} />

      <div className="op-shell">
        <nav className="op-strip" aria-label="Document">
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
        </nav>

        <header className="op-hero">
          <p className="op-eyebrow" data-reveal>
            Orientation programme <span className="op-eyebrow-sep" aria-hidden="true" /> {SERIES}
          </p>
          <h1 data-reveal>{post.title}</h1>
          <p className="op-sub" data-reveal>
            This programme consists of {mods.length} modules. Progress is recorded automatically as each module is
            displayed. No assessment follows.
          </p>
        </header>

        <div className="op-body">
          <PortalMarkdown>{post.content}</PortalMarkdown>
        </div>

        <footer className="op-end">
          <p className="op-end-status">
            <span className="op-k">End of programme</span>
            <span>
              {PORTAL_DOC} <span className="op-k">Modules displayed</span>{' '}
              {String(progress.modules.filter((p) => p >= 100).length).padStart(2, '0')} of{' '}
              {String(mods.length).padStart(2, '0')}
            </span>
          </p>
          {next && (
            <TLink to={lp(`/blog/${next.slug}`)} className="op-next">
              <span className="op-k">Next in sequence</span>
              <span className="op-next-t">
                <span className="op-next-mark" aria-hidden="true" />
                {next.title}
              </span>
            </TLink>
          )}
          <TLink to={lp('/blog')} className="op-end-back">
            {t('blog.backToBlog')}
          </TLink>
        </footer>
      </div>

      <PortalProgress progress={progress} mods={mods} />
    </div>
  )
}
