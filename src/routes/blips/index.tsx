import { useEffect, useRef, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Dithering } from '@paper-design/shaders-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Meta } from '../../lib/meta'
import { prefersReducedMotion } from '../../lib/motion'
import { blips, getBlipMediaUrl, type Blip } from '../../lib/blips'
import { Rule, SectionNumber, JPLabel } from '../../components/motifs'
import DecryptedText from '../../components/react-bits/DecryptedText'

gsap.registerPlugin(ScrollTrigger)

// dither noise pattern for card hover
const DITHER_NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

// Sticky rather than fixed: .page-enter carries a transform, which makes a fixed
// child resolve against the whole page, so the canvas spanned the full page
// height and the shader's pixel cap stretched every dither grain. The negative
// margin keeps the layer from pushing the content down.
// The route is prerendered in Node, so the shader starts still and picks up
// speed on mount once the reduced-motion setting can be read.
function DitherBg() {
  const [speed, setSpeed] = useState(0)

  useEffect(() => {
    if (!prefersReducedMotion()) setSpeed(0.1)
  }, [])

  return (
    <div className="pointer-events-none sticky top-0 z-0 -mb-[100lvh] h-lvh opacity-[0.06]" aria-hidden>
      <Dithering
        colorBack="#141414"
        colorFront="#d4a03c"
        shape="warp"
        type="random"
        size={1.8}
        speed={speed}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

// The fill reaches each point on the spine as it crosses 60% of the viewport,
// the reading line the blog's scroll figures use. Each month group owns its
// fill, so the dashed year-gap segments between groups stay unfilled.
function useTimelineMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    (_, contextSafe) => {
      const root = scope.current
      if (!root || prefersReducedMotion()) return

      for (const fill of gsap.utils.toArray<HTMLElement>('[data-spine-fill]', root)) {
        gsap.fromTo(
          fill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: fill.parentElement, start: 'top 60%', end: 'bottom 60%', scrub: 0.4 },
          },
        )
      }

      // Scale 1.14 leaves 7% of overflow on each edge, which covers the ±6% drift.
      for (const media of gsap.utils.toArray<HTMLElement>('[data-parallax]', root)) {
        gsap.fromTo(
          media,
          { yPercent: -6, scale: 1.14 },
          {
            yPercent: 6,
            scale: 1.14,
            ease: 'none',
            scrollTrigger: { trigger: media.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      }

      // Cards reveal through IntersectionObserver rather than ScrollTrigger, like
      // the blog list in lib/reveals.ts, so a missed refresh cannot strand one hidden.
      const entries = gsap.utils.toArray<HTMLElement>('[data-entry]', root)
      gsap.set(gsap.utils.toArray('[data-card]', root), { opacity: 0, y: 24 })
      gsap.set(gsap.utils.toArray('[data-date]', root), { opacity: 0, x: -10 })

      const io = new IntersectionObserver(
        contextSafe!((seen: IntersectionObserverEntry[]) => {
          seen
            .filter((e) => e.isIntersecting)
            .forEach((e, i) => {
              io.unobserve(e.target)
              const q = gsap.utils.selector(e.target)
              const delay = i * 0.08
              gsap.to(q('[data-card]'), { opacity: 1, y: 0, duration: 1, delay, ease: 'power3.out', clearProps: 'transform' })
              gsap.to(q('[data-date]'), { opacity: 1, x: 0, duration: 0.8, delay: delay + 0.1, ease: 'power3.out' })
            })
        }),
        { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
      )
      entries.forEach((entry) => io.observe(entry))
      return () => io.disconnect()
    },
    { scope },
  )
}

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  callback: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      callback(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, callback])
}

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov']

function isVideo(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return VIDEO_EXTENSIONS.includes(ext)
}

function ExpandedCard({
  blip,
  onClose,
}: {
  blip: Blip
  onClose: () => void
}) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)

  useOutsideClick(ref, onClose)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 p-4 backdrop-blur-sm dark:bg-black/80"
    >
      <motion.div
        ref={ref}
        layoutId={`blip-${blip.date}-${blip.media?.[0]}`}
        role="dialog"
        aria-modal="true"
        aria-label={t('blips.expandedLabel')}
        tabIndex={-1}
        className="relative max-h-[85vh] w-full max-w-2xl overflow-auto bg-bone p-6 shadow-2xl outline-none dark:bg-charcoal"
      >
        {blip.media?.map((file) => {
          const src = getBlipMediaUrl(file)
          if (!src) return null
          return (
            <div key={file} className="mb-4 overflow-hidden">
              {isVideo(file) ? (
                <video
                  src={src}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="mx-auto block max-h-[60vh] w-auto max-w-full rounded"
                />
              ) : (
                <img src={src} alt="" className="mx-auto block max-h-[60vh] w-auto max-w-full rounded" />
              )}
            </div>
          )
        })}

        <time
          dateTime={blip.date}
          className="font-mono text-xs uppercase tracking-[0.15em] text-gold"
        >
          {blip.date}
        </time>

        {blip.text && (
          <p className="mt-3 text-base leading-relaxed text-charcoal/85 dark:text-bone/85">
            {blip.text}
          </p>
        )}

        {blip.tags && blip.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {blip.tags.map((t) => (
              <span
                key={t}
                className="bg-charcoal px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-bone dark:bg-bone dark:text-charcoal"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// Groups arrive newest first because `blips` is sorted by date descending.
function groupByMonth(list: Blip[]) {
  const groups: { key: string; items: Blip[] }[] = []
  for (const blip of list) {
    const key = blip.date.slice(0, 7)
    const last = groups[groups.length - 1]
    if (last?.key === key) last.items.push(blip)
    else groups.push({ key, items: [blip] })
  }
  return groups
}

function monthIndex(key: string) {
  const [y, m] = key.split('-').map(Number)
  return y * 12 + m
}

// The spine sits in the middle of the 1rem marker column: below sm that column
// starts at 0; from sm it follows the 5rem date column and the 1.25rem gap.
// Change the grid columns or gap and these offsets must move with them.
const ROW_GRID = 'grid grid-cols-[1rem_1fr] gap-x-5 sm:grid-cols-[5rem_1rem_1fr]'
const SPINE_X = 'left-2 sm:left-[6.75rem]'

function BlipEntry({ blip, onExpand }: { blip: Blip; onExpand?: () => void }) {
  const coverFile = blip.media?.[0]
  const mediaSrc = coverFile ? getBlipMediaUrl(coverFile) : null
  const extraCount = (blip.media?.length ?? 0) - 1
  const hasMedia = !!mediaSrc
  const isClickable = hasMedia

  const cardContent = (
    <>
      {/* dither hover overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-[0.12]"
        style={{ backgroundImage: DITHER_NOISE }}
      />
      <div className="p-4">
        {hasMedia && (
          <div className="relative mb-3 overflow-hidden border border-charcoal/10 dark:border-bone/10">
            {extraCount > 0 && (
              <span className="absolute right-2 top-2 z-10 bg-charcoal/85 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-bone">
                +{extraCount}
              </span>
            )}
            {isVideo(coverFile!) ? (
              <video
                src={mediaSrc!}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                data-parallax
                className="aspect-video w-full object-cover"
              />
            ) : (
              <img src={mediaSrc!} alt="" data-parallax className="aspect-video w-full object-cover" />
            )}
          </div>
        )}

        <time
          dateTime={blip.date}
          className="mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-gold sm:hidden"
        >
          {blip.date}
        </time>

        {blip.text && (
          <p className="text-base leading-relaxed text-charcoal/85 dark:text-bone/85">
            {blip.text}
          </p>
        )}

        {blip.tags && blip.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {blip.tags.map((t) => (
              <span
                key={t}
                className="bg-charcoal px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-bone dark:bg-bone dark:text-charcoal"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )

  const cardClasses =
    'group relative bg-bone shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:bg-charcoal/80'

  return (
    <li data-entry className={`${ROW_GRID} pb-8`}>
      <time
        dateTime={blip.date}
        data-date
        className="hidden pt-4 text-right font-mono text-xs tracking-[0.15em] text-gold sm:block"
      >
        {blip.date.slice(5)}
      </time>
      <span
        aria-hidden
        className={`relative z-10 mt-[1.15rem] h-2.5 w-2.5 rotate-45 justify-self-center border border-gold ${
          hasMedia ? 'bg-gold' : 'bg-bone dark:bg-charcoal'
        }`}
      />
      {/* GSAP animates this wrapper, never the motion.div: framer-motion owns
          that element's transform for the shared-layout expand. */}
      <div data-card className="relative max-w-xl">
        {isClickable ? (
          <motion.div
            layoutId={`blip-${blip.date}-${coverFile}`}
            className={`${cardClasses} cursor-pointer`}
            onClick={onExpand}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onExpand?.()
              }
            }}
          >
            {cardContent}
          </motion.div>
        ) : (
          <div className={cardClasses}>{cardContent}</div>
        )}
      </div>
    </li>
  )
}

const groups = groupByMonth(blips)

export default function BlipsPage() {
  const { t, i18n } = useTranslation()
  const [expandedBlip, setExpandedBlip] = useState<Blip | null>(null)
  const timeline = useRef<HTMLOListElement>(null)
  useTimelineMotion(timeline)
  const monthFormat = new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <>
      <Meta title={t('blips.title')} description="Short-form updates: notes, screenshots, and clips as they happen." />
      <DitherBg />

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-36">
        <div className="relative">
          <SectionNumber n="05" label={t('blips.sectionLabel')} />
          <div className="relative mt-3 w-fit">
            <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex">
              <JPLabel>断片</JPLabel>
              <span aria-hidden className="h-4 w-px bg-gold/50" />
            </div>
            <h1 className="font-display text-5xl font-black text-charcoal dark:text-bone">
              <DecryptedText text={t('blips.title')} speed={50} delay={100} />
            </h1>
          </div>
        </div>
        <Rule className="mt-4" />

        {blips.length === 0 && (
          <p className="mt-16 font-mono text-xs font-medium uppercase tracking-[0.25em] text-charcoal/65 dark:text-bone/65">
            {t('blips.empty')}
          </p>
        )}

        <ol ref={timeline} className="mt-16">
          {groups.map((group, gi) => {
            const prev = groups[gi - 1]
            const skipsMonths = prev && monthIndex(prev.key) - monthIndex(group.key) > 1
            return (
              <li key={group.key}>
                {skipsMonths && (
                  <div
                    aria-hidden
                    className={`relative h-24 ${SPINE_X} w-0 -translate-x-1/2 border-l-2 border-dashed border-gold/60`}
                  />
                )}
                <div className="relative">
                  <span aria-hidden className={`absolute inset-y-0 ${SPINE_X} w-px -translate-x-1/2 bg-gold/30`} />
                  <span
                    aria-hidden
                    data-spine-fill
                    className={`absolute inset-y-0 ${SPINE_X} w-px -translate-x-1/2 origin-top bg-gold`}
                    style={{ transform: 'scaleY(0)' }}
                  />
                  <div className={`${ROW_GRID} items-center pb-6 ${gi === 0 ? '' : 'pt-4'}`}>
                    <span className="hidden sm:block" />
                    <span aria-hidden className="relative z-10 h-3.5 w-3.5 justify-self-center bg-gold" />
                    <h2 className="font-mono text-sm font-bold uppercase tracking-[0.25em] text-charcoal dark:text-bone">
                      {monthFormat.format(new Date(`${group.key}-01T00:00:00Z`))}
                    </h2>
                  </div>
                  <ol>
                    {group.items.map((blip, i) => (
                      <BlipEntry
                        key={`${blip.date}-${i}`}
                        blip={blip}
                        onExpand={blip.media ? () => setExpandedBlip(blip) : undefined}
                      />
                    ))}
                  </ol>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <AnimatePresence>
        {expandedBlip && (
          <ExpandedCard blip={expandedBlip} onClose={() => setExpandedBlip(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
