import { useState } from 'react'
import CRTEffect from 'vault66-crt-effect'
import 'vault66-crt-effect/style.css'
import { TLink } from './page-transition'
import { ArrowRight } from './icons'
import type { Post } from '../lib/posts'

type Props = {
  post: Post
  img: string
  dayOf: (date: string) => string
  monthOf: (date: string) => string
}

export function CRTCard({ post, img, dayOf, monthOf }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <li
      data-post
      className="group grid gap-x-6 gap-y-4 md:grid-cols-12 md:items-end"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Date column */}
      <div data-col className="md:col-span-2 md:self-start">
        <time dateTime={post.date} className="flex items-baseline gap-2.5 md:flex-col md:gap-1.5">
          <span className="font-display text-3xl font-black leading-none tracking-tight text-charcoal/90 transition-colors duration-200 group-hover:text-amber-500 dark:text-bone/90">
            {dayOf(post.date)}
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-charcoal/60 dark:text-bone/60">
            {monthOf(post.date)}
          </span>
        </time>
      </div>

      {/* Image with CRT effect */}
      <div data-col className="md:col-span-4 order-2">
        <TLink to={`/blog/${post.slug}`} className="block">
          <div
            data-thumb
            className="relative overflow-hidden rounded-lg border border-charcoal/10 dark:border-bone/10 bg-black aspect-[4/5] w-full max-w-[220px] shadow-md transition-all duration-300 group-hover:shadow-amber-500/20 group-hover:shadow-lg"
          >
            <CRTEffect
              theme="amber"
              scanlineOpacity={0.15}
              enableSweep={false}
              enableFlicker={hovered}
              flickerIntensity="low"
              enableGlitch={hovered}
              glitchIntensity="low"
              enableNoise={hovered}
              noiseOpacity={0.1}
              enableGlow={hovered}
              glowColor="rgba(255,180,50,0.3)"
              enableVignette
              vignetteIntensity={0.3}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
              />
            </CRTEffect>
          </div>
        </TLink>
      </div>

      {/* Title */}
      <div data-col className="md:col-span-6 flex flex-col justify-end order-3">
        <TLink
          to={`/blog/${post.slug}`}
          className="font-display text-2xl font-bold leading-snug text-charcoal transition-all duration-200 group-hover:text-amber-500 dark:text-bone md:text-3xl"
        >
          {post.title}
        </TLink>
        {post.description && (
          <p className="mt-3 text-sm font-medium leading-relaxed text-charcoal/75 dark:text-bone/75">
            {post.description}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {post.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] font-medium uppercase tracking-wider text-charcoal/65 dark:text-bone/65 border border-charcoal/15 rounded px-1.5 py-0.5 dark:border-bone/15 transition-colors group-hover:border-amber-500/30 group-hover:text-amber-500/80"
            >
              #{t}
            </span>
          ))}
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 -translate-x-1 text-amber-500 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
        </div>
      </div>
    </li>
  )
}
