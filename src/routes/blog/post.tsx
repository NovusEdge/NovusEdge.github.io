import { useRef } from 'react'
import { useParams } from 'react-router'
import { TLink } from '../../components/page-transition'
import { useGSAP } from '@gsap/react'
import { Meta } from '../../lib/meta'
import { getPost } from '../../lib/posts'
import { getPostThumbnail } from '../../lib/thumbnails'
import { prefersReducedMotion } from '../../lib/motion'
import { revealPostContent } from '../../lib/reveals'
import { Markdown } from '../../components/markdown'
import { Rule } from '../../components/motifs'
import { PostSignoff } from '../../components/post-signoff'
import { SideFlourish } from '../../components/side-flourish'
import { TableOfContents } from '../../components/table-of-contents'
import { BlogDecorations } from '../../components/blog-decorations'
import { BlogInterstitials } from '../../components/blog-interstitial'
import NotFound from '../not-found'
import Magnetic from '../../components/react-bits/Magnetic'
import { PostHero } from './post-hero'

// ponytail: per-post decorations, add more as needed
const POST_DECORATIONS: Record<string, { id: string; src: string; side: 'left' | 'right'; triggerId: string; size?: string; offset?: Record<string, string> }[]> = {
  'chat-control-eu': [
    { id: 'camera', src: '/assets/blog/camera.webp', side: 'right', triggerId: 'its-not-just-your-dms', size: '140px', offset: { top: '35%', right: '3rem' } },
    { id: 'mind', src: '/assets/blog/mind-control.jpeg', side: 'left', triggerId: 'what-you-think', size: '160px', offset: { top: '40%', left: '2rem' } },
  ],
}

// ponytail: per-post interstitials (mid-page banners)
const POST_INTERSTITIALS: Record<string, { id: string; src: string; triggerId: string; exitTriggerId?: string }[]> = {
  'chat-control-eu': [
    { id: 'watched', src: '/assets/blog/chat-control-banner.jpeg', triggerId: 'willingly', exitTriggerId: 'convenience-always-wins' },
  ],
}

// ponytail: posts that disable the japanese side flourish
const HIDE_SIDE_FLOURISH = ['chat-control-eu', 'epistemic-collapse']

// locked picks: hero = Dither (1), content scroll = focus (2), sign-off = Terminal (0)
const DEFAULT_HERO = 1
const CONTENT = 'focus' as const
const SIGNOFF = 0

// ponytail: per-post hero variants (0=Cinematic, 1=Dither, 2=Framed, 3=Duotone, 4=CRT)
const POST_HERO: Record<string, number> = {
  'epistemic-collapse': 4,
}

export default function BlogPost() {
  const { slug } = useParams()
  const post = slug ? getPost(slug) : undefined
  const proseRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      revealPostContent(proseRef.current, CONTENT)
    },
    { scope: proseRef, dependencies: [post?.slug] },
  )

  if (!post) return <NotFound />

  const image = getPostThumbnail(post.slug)

  return (
    <>
      <Meta title={post.title} description={post.description || post.title} />

      <PostHero variant={POST_HERO[post.slug] ?? DEFAULT_HERO} post={post} image={image} />

      {!HIDE_SIDE_FLOURISH.includes(slug || '') && <SideFlourish variant={2} heroGate />}

      {post.toc && <TableOfContents content={post.content} />}

      {slug && POST_DECORATIONS[slug] && <BlogDecorations decorations={POST_DECORATIONS[slug]} />}
      {slug && POST_INTERSTITIALS[slug] && <BlogInterstitials interstitials={POST_INTERSTITIALS[slug]} />}

      <article className="mx-auto max-w-4xl px-6 pb-24 pt-12">
        <div className="mb-10">
          <Magnetic range={25}>
            <TLink
              to="/blog"
              className="group inline-block rounded border border-charcoal/10 bg-bone-tint/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-paper-deep transition-colors hover:border-gold dark:border-bone/10 dark:bg-charcoal-tint/10 dark:text-paper dark:hover:border-gold"
            >
              [ back to blog ]
            </TLink>
          </Magnetic>
        </div>

        <Rule className="mb-12" />

        <div
          ref={proseRef}
          className="prose prose-neutral prose-lg max-w-none font-body leading-relaxed text-charcoal/80 dark:prose-invert dark:text-bone/85 prose-headings:mt-12 prose-headings:mb-6 prose-p:my-6 prose-h2:text-3xl prose-h3:text-xl"
        >
          <Markdown>{post.content}</Markdown>
        </div>

        <PostSignoff variant={SIGNOFF} />
      </article>
    </>
  )
}
