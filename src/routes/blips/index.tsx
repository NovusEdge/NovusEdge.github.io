import { useState } from 'react'
import { Meta } from '../../lib/meta'
import { blips, getBlipMediaUrl, type Blip } from '../../lib/blips'
import { Rule, SectionNumber, JPLabel } from '../../components/motifs'
import DecryptedText from '../../components/react-bits/DecryptedText'

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov']

function isVideo(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return VIDEO_EXTENSIONS.includes(ext)
}

// ponytail: deterministic rotation from index, no Math.random
const ROTATIONS = ['-2deg', '1.5deg', '-1deg', '2.5deg', '-1.8deg', '1deg', '-2.2deg', '0.8deg']
const TAPE_STYLES = ['top', 'corners', 'top', 'corners', 'top', 'corners'] as const

function Lightbox({ src, isVideo, onClose }: { src: string; isVideo: boolean; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 p-4 backdrop-blur-sm dark:bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 font-mono text-xs uppercase tracking-widest text-bone/70 transition-colors hover:text-gold"
      >
        close
      </button>
      {isVideo ? (
        <video
          src={src}
          controls
          autoPlay
          className="max-h-[85vh] max-w-[90vw] rounded"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={src}
          alt=""
          className="max-h-[85vh] max-w-[90vw] rounded object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  )
}

function BlipCard({ blip, index }: { blip: Blip; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const rotation = ROTATIONS[index % ROTATIONS.length]
  const tapeStyle = TAPE_STYLES[index % TAPE_STYLES.length]
  const mediaSrc = blip.media ? getBlipMediaUrl(blip.media) : null
  const hasMedia = !!mediaSrc

  return (
    <>
      <li
        className="group relative mb-8 break-inside-avoid bg-bone shadow-md transition-transform hover:z-10 hover:scale-[1.02] hover:rotate-0 dark:bg-charcoal/80"
        style={{ transform: `rotate(${rotation})` }}
      >
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
            <button
              onClick={() => setExpanded(true)}
              className="mb-3 block w-full cursor-pointer overflow-hidden border border-charcoal/10 transition-opacity hover:opacity-90 dark:border-bone/10"
            >
              {isVideo(blip.media!) ? (
                <video src={mediaSrc!} muted className="aspect-video w-full object-cover" />
              ) : (
                <img src={mediaSrc!} alt="" className="aspect-video w-full object-cover" />
              )}
            </button>
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
      </li>

      {expanded && mediaSrc && (
        <Lightbox src={mediaSrc} isVideo={isVideo(blip.media!)} onClose={() => setExpanded(false)} />
      )}
    </>
  )
}

export default function BlipsPage() {
  return (
    <>
      <Meta title="Blips" description="Short-form updates: notes, screenshots, and clips as they happen." />

      <section className="relative mx-auto max-w-4xl px-6 pb-24 pt-36">
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
            <BlipCard key={`${blip.date}-${i}`} blip={blip} index={i} />
          ))}
        </ul>
      </section>
    </>
  )
}
