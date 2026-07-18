import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Meta } from '../../lib/meta'
import { blips, getBlipMediaUrl, type Blip } from '../../lib/blips'
import { Rule, SectionNumber, JPLabel } from '../../components/motifs'
import DecryptedText from '../../components/react-bits/DecryptedText'

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
const TAPE_STYLES = ['top', 'corners', 'top', 'corners', 'top', 'corners'] as const

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
        className="relative max-h-[85vh] w-full max-w-2xl overflow-auto bg-bone p-6 shadow-2xl dark:bg-charcoal"
      >
        {/* Tape decoration */}
        <div className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-1 bg-gold/60" />

        {mediaSrc && (
          <div className="mb-4 overflow-hidden">
            {isVideo(blip.media!) ? (
              <video src={mediaSrc} controls autoPlay className="w-full rounded" />
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
  const tapeStyle = TAPE_STYLES[index % TAPE_STYLES.length]
  const mediaSrc = blip.media ? getBlipMediaUrl(blip.media) : null
  const hasMedia = !!mediaSrc
  const isClickable = hasMedia

  const cardContent = (
    <>
      {/* Tape decorations */}
      {tapeStyle === 'top' && (
        <div className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2 bg-gold/50" />
      )}
      {tapeStyle === 'corners' && (
        <>
          <div className="absolute -left-3 -top-2 h-6 w-10 -rotate-[35deg] bg-gold/50" />
          <div className="absolute -right-3 -top-2 h-6 w-10 rotate-[35deg] bg-gold/50" />
        </>
      )}

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
      >
        {cardContent}
      </motion.li>
    )
  }

  return (
    <li
      className={baseClasses}
      style={{ transform: `rotate(${rotation})` }}
    >
      {cardContent}
    </li>
  )
}

export default function BlipsPage() {
  const [expandedBlip, setExpandedBlip] = useState<Blip | null>(null)

  return (
    <>
      <Meta title="Blips" description="Short-form updates: notes, screenshots, and clips as they happen." />

      <section className="relative mx-auto max-w-5xl px-6 pb-24 pt-36">
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
