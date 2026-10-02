import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Meta } from '../../lib/meta'
import type { Post } from '../../lib/posts'
import { MEANING_POSTS } from '../../lib/meaning-data'
import { Drawn } from '../../components/meaning/drawn'
import { MeaningMarkdown } from '../../components/meaning/markdown'
import { TangleLayerContext } from '../../components/meaning/voices'
import { PostSignoff } from '../../components/post-signoff'

export function MeaningPage({ post, image }: { post: Post; image?: string | null }) {
  const { t } = useTranslation()
  const tangle = useRef<HTMLCanvasElement>(null)
  const data = MEANING_POSTS[post.slug]
  const hero = data?.hero ?? { text: post.description }

  return (
    <TangleLayerContext.Provider value={tangle}>
      <div className="ms" lang={post.contentLocale}>
        <Meta title={post.title} description={post.description || post.title} image={image} />
        <div className="ms-tangle-layer" aria-hidden="true">
          <canvas ref={tangle} />
        </div>

        <header className="ms-col">
          <h1 className="ms-kicker">{post.title}</h1>
          <p className="ms-hero">
            {hero.svg ? <img src={hero.svg} alt={hero.text} /> : hero.text}
            <Drawn kind="underline" accent delay={400} />
          </p>
        </header>

        <MeaningMarkdown slug={post.slug} locale={post.contentLocale}>
          {post.content}
        </MeaningMarkdown>

        <div className="ms-col">
          <div className="ms-end" aria-hidden="true">
            <Drawn kind="star" accent />
          </div>
          {data?.photoCredit && (
            <p className="ms-credit">
              {t('blog.meaning.photoCredit')}{' '}
              <a href={data.photoCredit} target="_blank" rel="noreferrer noopener">
                {new URL(data.photoCredit).hostname.replace(/^www\./, '')}
              </a>
            </p>
          )}
        </div>

        <div className="ms-signoff">
          <PostSignoff variant={0} />
        </div>
      </div>
    </TangleLayerContext.Provider>
  )
}
