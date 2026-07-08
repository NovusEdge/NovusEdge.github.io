import { useRef } from 'react'
import { Link, useParams } from 'react-router'
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
import NotFound from '../not-found'
import Magnetic from '../../components/react-bits/Magnetic'
import { PostHero } from './post-hero'

// locked picks: hero = Dither (1), content scroll = focus (2), sign-off = Terminal (0)
const HERO = 1
const CONTENT = 'focus' as const
const SIGNOFF = 0

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

      <PostHero variant={HERO} post={post} image={image} />

      <SideFlourish variant={2} heroGate /> {/* Kana, fades in past the hero */}

      <article className="mx-auto max-w-2xl px-6 pb-24 pt-12">
        <div className="mb-10">
          <Magnetic range={25}>
            <Link
              to="/blog"
              className="group inline-block rounded border border-charcoal/10 bg-bone-tint/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-paper-deep transition-colors hover:border-gold dark:border-bone/10 dark:bg-charcoal-tint/10 dark:text-paper dark:hover:border-gold"
            >
              [ back to blog ]
            </Link>
          </Magnetic>
        </div>

        <Rule className="mb-12" />

        <div
          ref={proseRef}
          className="prose prose-neutral max-w-none font-body leading-relaxed text-charcoal/80 dark:prose-invert dark:text-bone/85"
        >
          <Markdown>{post.content}</Markdown>
        </div>

        <PostSignoff variant={SIGNOFF} />
      </article>
    </>
  )
}
