import { useRef, useState, useEffect } from 'react'
import { TLink } from './page-transition'
import { ArrowRight } from './icons'
import type { Post } from '../lib/posts'

// Redacted text - word by word slide reveal
function RedactedText({ text, revealed }: { text: string; revealed: boolean }) {
  const words = text.split(' ')
  return (
    <span className="inline">
      {words.map((word, i) => (
        <span key={i} className="relative inline-block overflow-hidden mr-[0.25em]">
          <span className="relative z-10">{word}</span>
          <span
            className="absolute inset-0 bg-charcoal dark:bg-bone pointer-events-none transition-transform duration-500 ease-out"
            style={{
              transform: revealed ? 'translateX(105%)' : 'translateX(0)',
              transitionDelay: revealed ? `${i * 60}ms` : '0ms',
            }}
            aria-hidden
          />
        </span>
      ))}
    </span>
  )
}

type Props = {
  post: Post
  img: string
  dayOf: (date: string) => string
  monthOf: (date: string) => string
}

export function SurveillanceCard({ post, img, dayOf, monthOf }: Props) {
  const cardRef = useRef<HTMLLIElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [hovered, setHovered] = useState(false)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })

  // Eye tracking effect
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!cardRef.current || !imgRef.current) return

      const rect = imgRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Calculate offset (max 8px movement)
      const maxOffset = 8
      const deltaX = (e.clientX - centerX) / window.innerWidth
      const deltaY = (e.clientY - centerY) / window.innerHeight

      setEyeOffset({
        x: deltaX * maxOffset * 2,
        y: deltaY * maxOffset * 2,
      })
    }

    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <li
      ref={cardRef}
      data-post
      className="group grid gap-x-6 gap-y-4 md:grid-cols-12 md:items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Date column */}
      <div data-col className="md:col-span-2 md:self-start">
        <time dateTime={post.date} className="flex items-baseline gap-2.5 md:flex-col md:gap-1.5">
          <span className="font-display text-3xl font-black leading-none tracking-tight text-charcoal/90 transition-colors duration-200 group-hover:text-gold dark:text-bone/90">
            {dayOf(post.date)}
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-charcoal/60 dark:text-bone/60">
            {monthOf(post.date)}
          </span>
        </time>
      </div>

      {/* Image with eye tracking */}
      <div data-col className="md:col-span-4 order-2">
        <TLink to={`/blog/${post.slug}`} className="block">
          <div
            data-thumb
            className="relative overflow-hidden rounded-lg border border-charcoal/10 dark:border-bone/10 bg-black aspect-[4/5] w-full max-w-[220px] shadow-md transition-all duration-300 group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20 group-hover:shadow-lg"
          >
            {/* Scanlines overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-20"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
              }}
            />
            {/* Image with tracking */}
            <img
              ref={imgRef}
              src={img}
              alt=""
              className="h-full w-full object-cover transition-all duration-100 ease-out"
              style={{
                transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px) scale(1.05)`,
              }}
            />
            {/* Green glow pulse on hover */}
            <div className="absolute inset-0 bg-emerald-500/0 transition-colors duration-500 group-hover:bg-emerald-500/10" />
          </div>
        </TLink>
      </div>

      {/* Title with redaction effect */}
      <div data-col className="md:col-span-6 flex flex-col justify-center order-3">
        <TLink
          to={`/blog/${post.slug}`}
          className="font-display text-2xl font-bold leading-snug text-charcoal transition-all duration-200 group-hover:text-emerald-400 dark:text-bone md:text-3xl"
        >
          <RedactedText text={post.title} revealed={hovered} />
        </TLink>
        {post.description && (
          <p className="mt-3 text-sm font-medium leading-relaxed text-charcoal/75 dark:text-bone/75 relative overflow-hidden">
            <span className="relative z-10">{post.description}</span>
            <span
              className="absolute inset-0 bg-charcoal dark:bg-bone pointer-events-none transition-transform duration-700 ease-out delay-100"
              style={{ transform: hovered ? 'translateX(105%)' : 'translateX(0)' }}
              aria-hidden
            />
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {post.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] font-medium uppercase tracking-wider text-charcoal/65 dark:text-bone/65 border border-charcoal/15 rounded px-1.5 py-0.5 dark:border-bone/15 transition-colors group-hover:border-emerald-500/30 group-hover:text-emerald-400/80"
            >
              #{t}
            </span>
          ))}
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 -translate-x-1 text-emerald-500 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
        </div>
      </div>
    </li>
  )
}
