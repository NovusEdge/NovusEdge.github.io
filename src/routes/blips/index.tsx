import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Dithering } from '@paper-design/shaders-react'
import { Meta } from '../../lib/meta'
import { blips, getBlipMediaUrl, type Blip } from '../../lib/blips'
import { Rule, SectionNumber, JPLabel } from '../../components/motifs'
import DecryptedText from '../../components/react-bits/DecryptedText'

// dither noise pattern for card hover
const DITHER_NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

// side dither strips
function DitherStrips() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let current = 0
    let target = 0
    let rafId: number

    const onScroll = () => {
      target = window.scrollY * 0.05
    }

    const tick = () => {
      current += (target - current) * 0.08
      if (ref.current) {
        ref.current.style.transform = `translateY(${current}px)`
      }
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    rafId = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div ref={ref} className="pointer-events-none fixed inset-y-0 left-0 right-0 z-0 hidden lg:block" aria-hidden>
      {/* left strip */}
      <div className="absolute left-0 top-0 h-full w-24 opacity-[0.07]">
        <Dithering
          colorBack="#141414"
          colorFront="#d4a03c"
          shape="warp"
          type="random"
          size={1.8}
          speed={0.01}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {/* right strip */}
      <div className="absolute right-0 top-0 h-full w-24 opacity-[0.07]">
        <Dithering
          colorBack="#141414"
          colorFront="#d4a03c"
          shape="warp"
          type="random"
          size={1.8}
          speed={0.01}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
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

// ponytail: deterministic rotation from index, no Math.random
const ROTATIONS = ['-2deg', '1.5deg', '-1deg', '2.5deg', '-1.8deg', '1deg', '-2.2deg', '0.8deg']

function ExpandedCard({
  blip,
  onClose,
}: {
  blip: Blip
  onClose: () => void
}) {
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

  const mediaSrc = blip.media ? getBlipMediaUrl(blip.media) : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 p-4 backdrop-blur-sm dark:bg-black/80"
    >
      <motion.div
        ref={ref}
        layoutId={`blip-${blip.date}-${blip.media}`}
        role="dialog"
        aria-modal="true"
        aria-label="Expanded blip"
        tabIndex={-1}
        className="relative max-h-[85vh] w-full max-w-2xl overflow-auto bg-bone p-6 shadow-2xl outline-none dark:bg-charcoal"
      >
        {mediaSrc && (
          <div className="mb-4 overflow-hidden">
            {isVideo(blip.media!) ? (
              <video src={mediaSrc} controls autoPlay muted className="w-full rounded" />
            ) : (
              <img src={mediaSrc} alt="" className="w-full rounded object-contain" />
            )}
          </div>
        )}

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

function BlipCard({
  blip,
  index,
  onExpand,
}: {
  blip: Blip
  index: number
  onExpand?: () => void
}) {
  const rotation = ROTATIONS[index % ROTATIONS.length]
  const mediaSrc = blip.media ? getBlipMediaUrl(blip.media) : null
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
          <div className="mb-3 overflow-hidden border border-charcoal/10 dark:border-bone/10">
            {isVideo(blip.media!) ? (
              <video src={mediaSrc!} muted className="aspect-video w-full object-cover" />
            ) : (
              <img src={mediaSrc!} alt="" className="aspect-video w-full object-cover" />
            )}
          </div>
        )}

        <time
          dateTime={blip.date}
          className="font-mono text-xs uppercase tracking-[0.15em] text-gold"
        >
          {blip.date}
        </time>

        {blip.text && (
          <p className="mt-2 text-base leading-relaxed text-charcoal/85 dark:text-bone/85">
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

  const baseClasses =
    'group relative mb-8 break-inside-avoid bg-bone shadow-md transition-all duration-300 hover:z-10 hover:scale-[1.02] hover:rotate-0 hover:shadow-lg dark:bg-charcoal/80'

  if (isClickable) {
    return (
      <motion.li
        layoutId={`blip-${blip.date}-${blip.media}`}
        className={`${baseClasses} cursor-pointer`}
        style={{ transform: `rotate(${rotation})` }}
        onClick={onExpand}
        whileHover={{ rotate: 0 }}
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
      </motion.li>
    )
  }

  return (
    <motion.li
      className={baseClasses}
      style={{ transform: `rotate(${rotation})` }}
      whileHover={{ rotate: 0 }}
    >
      {cardContent}
    </motion.li>
  )
}

export default function BlipsPage() {
  const [expandedBlip, setExpandedBlip] = useState<Blip | null>(null)

  return (
    <>
      <Meta title="Blips" description="Short-form updates: notes, screenshots, and clips as they happen." />
      <DitherStrips />

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-36">
        <div className="relative">
          <SectionNumber n="05" label="blips" />
          <div className="relative mt-3 w-fit">
            <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex">
              <JPLabel>断片</JPLabel>
              <span aria-hidden className="h-4 w-px bg-gold/50" />
            </div>
            <h1 className="font-display text-5xl font-black text-charcoal dark:text-bone">
              <DecryptedText text="Blips" speed={50} delay={100} />
            </h1>
          </div>
        </div>
        <Rule className="mt-4" />

        {blips.length === 0 && (
          <p className="mt-16 font-mono text-xs font-medium uppercase tracking-[0.25em] text-charcoal/65 dark:text-bone/65">
            nothing here yet
          </p>
        )}

        <ul className="mt-16 columns-1 gap-8 sm:columns-2 lg:columns-3 xl:columns-4">
          {blips.map((blip, i) => (
            <BlipCard
              key={`${blip.date}-${i}`}
              blip={blip}
              index={i}
              onExpand={blip.media ? () => setExpandedBlip(blip) : undefined}
            />
          ))}
        </ul>
      </section>

      <AnimatePresence>
        {expandedBlip && (
          <ExpandedCard blip={expandedBlip} onClose={() => setExpandedBlip(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
