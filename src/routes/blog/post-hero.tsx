import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Dithering, ImageDithering } from '@paper-design/shaders-react'
import type { Post } from '../../lib/posts'
import { RegMarks } from '../../components/motifs'
import { prefersReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

const PERF = { minPixelRatio: 1, maxPixelCount: 900_000 }

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export const HERO_VARIANTS = ['Cinematic', 'Dither', 'Framed', 'Duotone'] as const

type HeroProps = { post: Post; image: string | null }

const BLEED = 'relative flex h-[80vh] min-h-[520px] w-full items-end overflow-hidden bg-charcoal pb-16'
const PAGE_FADE = 'pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bone dark:to-charcoal'

// title + meta laid over a dark image
function OverTitle({ post }: { post: Post }) {
  return (
    <div
      data-herotitle
      className="relative z-10 mx-auto w-full max-w-3xl px-6 [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]"
    >
      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-bone/75">
        <span className="text-gold">{post.date}</span>
        {post.tags.map((t) => (
          <span key={t}>#{t}</span>
        ))}
      </div>
      <h1 className="mt-4 font-display text-4xl font-black leading-tight text-bone md:text-6xl">{post.title}</h1>
    </div>
  )
}

function useHeroMotion(scope: React.RefObject<HTMLElement | null>, parallax: boolean) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      if (parallax) {
        gsap.to('[data-heroimg]', {
          yPercent: 16,
          ease: 'none',
          scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      }
      gsap.from('[data-herotitle]', { opacity: 0, y: 32, duration: 0.9, ease: 'power3.out', delay: 0.15 })
    },
    { scope },
  )
}

// 1 — full-bleed photo, darkened, parallax + ken-burns
function HeroCinematic({ post, image }: HeroProps) {
  const scope = useRef<HTMLElement>(null)
  useHeroMotion(scope, true)
  return (
    <header ref={scope} className={BLEED}>
      {image && (
        <img
          data-heroimg
          src={image}
          alt=""
          className="absolute inset-0 h-[124%] w-full -translate-y-[8%] scale-105 object-cover opacity-70"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/45 to-charcoal/25" />
      <div className={PAGE_FADE} />
      <OverTitle post={post} />
    </header>
  )
}

// 2 — image run through the ImageDithering shader (on-brand with the landing)
function HeroDither({ post, image }: HeroProps) {
  const scope = useRef<HTMLElement>(null)
  useHeroMotion(scope, false)
  return (
    <header ref={scope} className={BLEED}>
      {image ? (
        <ImageDithering
          className="absolute inset-0"
          width="100%"
          height="100%"
          {...PERF}
          image={image}
          colorBack="#141414"
          colorFront="#e8e4da"
        />
      ) : (
        <Dithering
          className="absolute inset-0"
          width="100%"
          height="100%"
          {...PERF}
          colorBack="#141414"
          colorFront="#d4a03c"
          shape="swirl"
          type="4x4"
          size={2}
          speed={0.3}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />
      <div className={PAGE_FADE} />
      <OverTitle post={post} />
    </header>
  )
}

// 3 — contained framed panel with reg-marks, title BELOW (most readable / editorial)
function HeroFramed({ post, image }: HeroProps) {
  const scope = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-frameimg]', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power3.out' })
      gsap.from('[data-herotitle] > *', {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.35,
      })
    },
    { scope },
  )
  return (
    <header ref={scope} className="mx-auto max-w-4xl px-6 pt-32">
      {image && (
        <div className="relative">
          <RegMarks />
          <div
            data-frameimg
            className="aspect-[21/9] w-full overflow-hidden rounded border border-charcoal/10 bg-black dark:border-bone/10"
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      )}
      <div data-herotitle className="mt-8">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-charcoal/60 dark:text-bone/60">
          <span className="text-gold">{post.date}</span>
          {post.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
        <h1 className="mt-4 font-display text-4xl font-black leading-tight text-charcoal dark:text-bone md:text-5xl">
          {post.title}
        </h1>
      </div>
    </header>
  )
}

// 4 — duotone (grayscale + paper-blue/gold) + grain, moody
function HeroDuotone({ post, image }: HeroProps) {
  const scope = useRef<HTMLElement>(null)
  useHeroMotion(scope, true)
  return (
    <header ref={scope} className={BLEED}>
      {image && (
        <img
          data-heroimg
          src={image}
          alt=""
          className="absolute inset-0 h-[124%] w-full -translate-y-[8%] scale-105 object-cover opacity-90 grayscale"
        />
      )}
      <div className="absolute inset-0 bg-paper-deep mix-blend-color" />
      <div className="absolute inset-0 bg-gradient-to-tr from-charcoal via-transparent to-gold/40 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />
      <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{ backgroundImage: NOISE }} />
      <div className={PAGE_FADE} />
      <OverTitle post={post} />
    </header>
  )
}

const VARIANTS = [HeroCinematic, HeroDither, HeroFramed, HeroDuotone]

export function PostHero({ variant, post, image }: { variant: number } & HeroProps) {
  const Hero = VARIANTS[variant] ?? HeroCinematic
  // key on variant+slug so switching variants / posts fully remounts (clean shader + GSAP state)
  return <Hero key={`${variant}-${post.slug}`} post={post} image={image} />
}
