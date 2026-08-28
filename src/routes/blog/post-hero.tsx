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

export const HERO_VARIANTS = ['Cinematic', 'Dither', 'Framed', 'Duotone', 'Grain', 'WarmthShift', 'Raw'] as const

type HeroProps = { post: Post; image: string | null; lang?: string }

const BLEED = 'relative flex h-[80vh] min-h-[520px] w-full items-end overflow-hidden bg-charcoal pb-16'
const PAGE_FADE = 'pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bone dark:to-charcoal'

// title + meta laid over a dark image
function OverTitle({ post, lang }: { post: Post; lang?: string }) {
  return (
    <div
      data-herotitle
      lang={lang}
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
function HeroCinematic({ post, image, lang }: HeroProps) {
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
      <OverTitle post={post} lang={lang} />
    </header>
  )
}

// 2 — image run through the ImageDithering shader (on-brand with the landing)
function HeroDither({ post, image, lang }: HeroProps) {
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
      <OverTitle post={post} lang={lang} />
    </header>
  )
}

// 3 — contained framed panel with reg-marks, title BELOW (most readable / editorial)
function HeroFramed({ post, image, lang }: HeroProps) {
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
      <div data-herotitle lang={lang} className="mt-8">
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
function HeroDuotone({ post, image, lang }: HeroProps) {
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
      <OverTitle post={post} lang={lang} />
    </header>
  )
}

// 5 — grain overlay (video if available, otherwise image)
const GRAIN_VIDEOS: Record<string, string> = {
  'epistemic-collapse': '/assets/blog/epistemic-hero.mp4',
  'building-vs-creating': '/assets/blog/building-vs-creating.mp4',
}

function HeroGrain({ post, image, lang }: HeroProps) {
  const scope = useRef<HTMLElement>(null)
  useHeroMotion(scope, true)
  const video = GRAIN_VIDEOS[post.slug]
  return (
    <header ref={scope} className={BLEED}>
      {video ? (
        <video
          data-heroimg
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-[124%] w-full -translate-y-[8%] scale-105 object-cover opacity-80"
        />
      ) : image ? (
        <img
          data-heroimg
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-contain opacity-80"
          style={{ maskImage: 'radial-gradient(ellipse 70% 80% at center, black 50%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at center, black 50%, transparent 100%)' }}
        />
      ) : null}
      {/* grain overlay */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{ backgroundImage: NOISE, backgroundSize: '150px' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/20" />
      <div className={PAGE_FADE} />
      <OverTitle post={post} lang={lang} />
    </header>
  )
}

// 6 — warmth shift: warm amber → cool blue as you scroll
function HeroWarmthShift({ post, image, lang }: HeroProps) {
  const scope = useRef<HTMLElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-herotitle]', { opacity: 0, y: 32, duration: 0.9, ease: 'power3.out', delay: 0.15 })
      // warm (sepia + saturate) → cool (hue-rotate toward blue, desaturate)
      gsap.to(imgRef.current, {
        filter: 'sepia(0) saturate(0.7) hue-rotate(180deg) brightness(0.85)',
        ease: 'none',
        scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope },
  )

  return (
    <header ref={scope} className={BLEED}>
      {image && (
        <img
          ref={imgRef}
          data-heroimg
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            filter: 'sepia(0.3) saturate(1.3) brightness(1.05)',
            maskImage: 'radial-gradient(ellipse 70% 80% at center, black 50%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at center, black 50%, transparent 100%)',
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
      <div className={PAGE_FADE} />
      <OverTitle post={post} lang={lang} />
    </header>
  )
}

// 7 — raw: contained hero, no grain/color effects, just the media
const RAW_VIDEOS: Record<string, string> = {
  'building-vs-creating': '/assets/blog/building-vs-creating.mp4',
}

function HeroRaw({ post, image, lang }: HeroProps) {
  const scope = useRef<HTMLElement>(null)
  const video = RAW_VIDEOS[post.slug]
  useHeroMotion(scope, false)

  return (
    <header ref={scope} className={BLEED} style={{ backgroundColor: '#2a1f1a' }}>
      {video ? (
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : image ? (
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-contain" />
      ) : null}
      {/* left/right blur edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[15%] backdrop-blur-md" style={{ maskImage: 'linear-gradient(to right, black, transparent)', WebkitMaskImage: 'linear-gradient(to right, black, transparent)' }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[15%] backdrop-blur-md" style={{ maskImage: 'linear-gradient(to left, black, transparent)', WebkitMaskImage: 'linear-gradient(to left, black, transparent)' }} />
      {/* color fade over blur */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-[#2a1f1a] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[15%] bg-gradient-to-l from-[#2a1f1a] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#2a1f1a]/80 to-transparent" />
      <div className={PAGE_FADE} />
      <OverTitle post={post} lang={lang} />
    </header>
  )
}

const VARIANTS = [HeroCinematic, HeroDither, HeroFramed, HeroDuotone, HeroGrain, HeroWarmthShift, HeroRaw]

export function PostHero({ variant, post, image, lang }: { variant: number } & HeroProps) {
  const Hero = VARIANTS[variant] ?? HeroCinematic
  // key on variant+slug so switching variants / posts fully remounts (clean shader + GSAP state)
  return <Hero key={`${variant}-${post.slug}`} post={post} image={image} lang={lang} />
}
