import { useEffect, useRef, useState } from 'react'
import { TLink } from './page-transition'
import { ArrowRight } from './icons'
import { isMobile, prefersReducedMotion } from '../lib/motion'
import type { Post } from '../lib/posts'
import { useLocalePath } from '../i18n/use-locale-path'

// The post page's oxide red, opened up two steps so it holds against charcoal.
const OXIDE = '#c85a41'

const CLIP = '/assets/blog/plan-a-thumb.mp4'

/**
 * The frame. Nothing here transitions, scales or recolours, on hover or ever:
 * the card's whole point is that this geometry survives the churn behind it
 * unchanged. Any hover style added to this element kills the idea.
 */
function Perimeter() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <span className="absolute inset-[9px] border" style={{ borderColor: OXIDE }} />
      {[
        'left-[9px] top-[9px] border-l-2 border-t-2',
        'right-[9px] top-[9px] border-r-2 border-t-2',
        'left-[9px] bottom-[9px] border-b-2 border-l-2',
        'right-[9px] bottom-[9px] border-b-2 border-r-2',
      ].map((pos) => (
        <span key={pos} className={`absolute h-3 w-3 ${pos}`} style={{ borderColor: OXIDE }} />
      ))}
    </span>
  )
}

type Props = {
  post: Post
  img: string
  clip?: string
  dayOf: (date: string) => string
  monthOf: (date: string) => string
}

export function PlanACard({ post, img, clip = CLIP, dayOf, monthOf }: Props) {
  const [hovered, setHovered] = useState(false)
  const [animated, setAnimated] = useState(false)
  // The clip is 330KB for a hover flourish, so it only gets a src once the
  // pointer has actually arrived.
  const [armed, setArmed] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const lp = useLocalePath()

  useEffect(() => {
    setAnimated(!prefersReducedMotion() && !isMobile())
  }, [])

  useEffect(() => {
    const el = video.current
    if (!el) return
    if (hovered) void el.play().catch(() => {})
    else el.pause()
  }, [hovered, armed])

  const enter = () => {
    setHovered(true)
    if (animated) setArmed(true)
  }

  return (
    <li
      data-post
      className="group grid gap-x-6 gap-y-4 md:grid-cols-12 md:items-center"
      onMouseEnter={enter}
      onMouseLeave={() => setHovered(false)}
    >
      <div data-col className="md:col-span-2 md:self-start">
        <time dateTime={post.date} className="flex items-baseline gap-2.5 md:flex-col md:gap-1.5">
          <span
            className="font-display text-3xl font-black leading-none tracking-tight text-charcoal/90 transition-colors duration-300 dark:text-bone/90"
            style={hovered ? { color: OXIDE } : undefined}
          >
            {dayOf(post.date)}
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-charcoal/60 dark:text-bone/60">
            {monthOf(post.date)}
          </span>
        </time>
      </div>

      <div data-col className="md:col-span-4 order-2">
        <TLink to={lp(`/blog/${post.slug}`)} className="block">
          <div
            data-thumb
            className="relative overflow-hidden rounded-lg border border-charcoal/10 dark:border-bone/10 bg-black aspect-[4/5] w-full max-w-[220px] shadow-md"
          >
            <img
              src={img}
              alt=""
              className="h-full w-full object-cover transition-[transform,filter] duration-[1200ms] ease-out"
              style={
                hovered
                  ? { transform: 'scale(1.09) translateX(-2%)', filter: 'contrast(1.15) brightness(0.9)' }
                  : undefined
              }
            />
            {armed && (
              <video
                ref={video}
                src={clip}
                loop
                muted
                playsInline
                preload="none"
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
                style={{ opacity: hovered ? 1 : 0 }}
              />
            )}
            <Perimeter />
          </div>
        </TLink>
      </div>

      <div data-col className="md:col-span-6 flex flex-col justify-center order-3">
        <TLink
          to={lp(`/blog/${post.slug}`)}
          className="font-display text-2xl font-bold leading-snug text-charcoal transition-colors duration-300 dark:text-bone md:text-3xl"
          style={hovered ? { color: OXIDE } : undefined}
        >
          {post.title}
        </TLink>
        {post.description && (
          <p className="mt-3 text-sm font-medium leading-relaxed text-charcoal/75 dark:text-bone/75">
            {post.description}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] font-medium uppercase tracking-wider text-charcoal/65 dark:text-bone/65 border border-charcoal/15 rounded px-1.5 py-0.5 dark:border-bone/15 transition-colors duration-300"
              style={hovered ? { borderColor: `${OXIDE}55`, color: `${OXIDE}cc` } : undefined}
            >
              #{tag}
            </span>
          ))}
          <ArrowRight
            className="ml-auto h-4 w-4 shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
            style={{ color: OXIDE }}
          />
        </div>
      </div>
    </li>
  )
}
