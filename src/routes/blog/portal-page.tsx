import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TLink } from '../../components/page-transition'
import { Meta } from '../../lib/meta'
import { PORTAL_DOC, PortalMarkdown, portalModules } from '../../components/portal-markdown'
import { PortalProgress, useReadingProgress } from '../../components/portal-progress'
import { useReveal } from '../../lib/motion'
import { useLocalePath } from '../../i18n/use-locale-path'
import { posts, type Post } from '../../lib/posts'
import blogListings from '../../i18n/blog-listings.json'
import { useLocale } from '../../i18n/context'

export function PortalPage({ post, image }: { post: Post; image?: string | null }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const locale = useLocale()
  const scope = useRef<HTMLDivElement>(null)
  // Stable identity: useReadingProgress keys its scroll listener off this array.
  const mods = useMemo(() => portalModules(post.content, t), [post.content, t])
  const progress = useReadingProgress(mods)
  // posts is sorted newest first, so the first published post at or before
  // this date is the next one down the list.
  const next = posts.find((p) => p.slug !== post.slug && !p.draft && p.date <= post.date)
  const listing = (blogListings as Record<string, Record<string, { title: string }>>)[locale.code]

  useReveal(scope)

  useEffect(() => {
    document.documentElement.classList.add('op-portal')
    return () => document.documentElement.classList.remove('op-portal')
  }, [])

  return (
    <div className="op" ref={scope} lang={post.contentLocale}>
      <Meta title={post.title} description={post.description || post.title} image={image} />

      <div className="op-shell">
        <nav className="op-strip" aria-label={t('blog.portal.document')}>
          <TLink to={lp('/blog')}>{t('blog.backToBlog')}</TLink>
        </nav>

        <header className="op-hero">
          <p className="op-eyebrow" data-reveal>
            {t('blog.portal.programme')} <span className="op-eyebrow-sep" aria-hidden="true" /> {t('blog.portal.series')}
          </p>
          <h1 data-reveal>{post.title}</h1>
          <p className="op-sub" data-reveal>
            {t('blog.portal.intro', { count: mods.length })}
          </p>
        </header>

        <div className="op-body">
          <PortalMarkdown>{post.content}</PortalMarkdown>
        </div>

        <footer className="op-end">
          <p className="op-end-status">
            <span className="op-k">{t('blog.portal.end')}</span>
            <span>
              {PORTAL_DOC} <span className="op-k">{t('blog.portal.displayed')}</span>{' '}
              {t('blog.portal.count', { current: String(progress.modules.filter((p) => p >= 100).length).padStart(2, '0'), total: String(mods.length).padStart(2, '0') })}
            </span>
          </p>
          {next && (
            <TLink to={lp(`/blog/${next.slug}`)} className="op-next">
              <span className="op-k">{t('blog.portal.next')}</span>
              <span className="op-next-t">
                <span className="op-next-mark" aria-hidden="true" />
                {listing?.[next.slug]?.title ?? next.title}
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
