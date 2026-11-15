import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft } from 'lucide-react'
import { TLink } from '../../components/page-transition'
import Magnetic from '../../components/react-bits/Magnetic'
import { PostSignoff } from '../../components/post-signoff'
import { StressList, TypedLine } from '../../components/text-tone/stress-list'
import { FortySheets } from '../../components/text-tone/forty-sheets'
import { RateCards } from '../../components/text-tone/rate-cards'
import { TextToneMarkdown } from '../../components/text-tone/markdown'
import { MotionContext, useMotionMode } from '../../components/text-tone/loop-pause'
import { ensureFontLinks } from '../../components/text-tone/fonts'
import { clips } from '../../components/text-tone/clips'
import { Meta } from '../../lib/meta'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { Post } from '../../lib/posts'
import '../../components/text-tone/text-tone.css'

const FIGURES: Record<string, ReactNode> = {
  stress_list: <StressList />,
  typed_line: <TypedLine />,
  forty_sheets: <FortySheets />,
  rate_cards: <RateCards />,
}

export function TextTonePage({ post, image }: { post: Post; image?: string | null }) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()
  const mode = useMotionMode()

  useEffect(() => {
    // The footer is App's, outside this page, so its night background hangs off <html>.
    const root = document.documentElement
    root.classList.add('tone-night')
    void ensureFontLinks()
    // .page-enter settles 0.5 s after mount; scroll positions measured before that are 14px off.
    const id = setTimeout(() => ScrollTrigger.refresh(), 600)
    return () => {
      root.classList.remove('tone-night')
      clearTimeout(id)
      clips.close()
    }
  }, [])

  const [before, after] = post.title.split('!=')
  const date = new Date(post.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <MotionContext value={mode}>
      <div className="tt" lang={post.contentLocale}>
        <Meta title={post.title} description={post.description || post.title} image={image} />
        <main className="tt-page">
          <div className="tt-col">
            <header className="tt-head">
              <Magnetic range={25}>
                <TLink
                  to={lp('/blog')}
                  className="group inline-flex items-center gap-2 rounded border border-charcoal/10 bg-bone-tint/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-paper-deep transition-colors hover:border-gold dark:border-bone/10 dark:bg-charcoal-tint/10 dark:text-paper dark:hover:border-gold"
                >
                  <ArrowLeft className="tt-ic transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                  {t('blog.textTone.back')}
                </TLink>
              </Magnetic>
              <h1>
                {after === undefined ? (
                  post.title
                ) : (
                  <>
                    {before.trim()} <span className="tt-ne">!=</span> {after.trim()}
                  </>
                )}
              </h1>
              <p className="tt-mono">
                <time dateTime={post.date}>{date}</time>
              </p>
            </header>
            <TextToneMarkdown figures={FIGURES} locale={post.contentLocale}>
              {post.content}
            </TextToneMarkdown>
            <PostSignoff variant={0} />
          </div>
        </main>
      </div>
    </MotionContext>
  )
}
