import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { whenFonts } from './fonts'
import { PauseButton, useLoop, useMotion } from './loop-pause'

const BARE = 'كتب'
const READINGS = [
  { marked: null, tr: 'k-t-b', gloss: 'asWritten' },
  { marked: 'كَتَبَ', tr: 'kataba', gloss: 'heWrote' },
  { marked: 'كُتِبَ', tr: 'kutiba', gloss: 'itWasWritten' },
  { marked: 'كُتُب', tr: 'kutub', gloss: 'books' },
] as const

// The same three consonants every time. The vowel marks arrive on three of them and make three words,
// then leave, and the page is back to what is normally written.
export function HarakatFigure() {
  const { t } = useTranslation()
  const mode = useMotion()
  const fig = useRef<HTMLElement>(null)
  const [font, setFont] = useState<boolean | null>(null)
  useEffect(() => {
    if (mode === 'full') void whenFonts([['500 1em "Noto Naskh Arabic"', BARE]]).then(setFont)
  }, [mode])
  // The marked word is laid over the bare one, which needs equal advance widths; only Noto Naskh
  // Arabic is checked for that, so without it the figure shows every reading at once.
  const still = mode === 'reduced' || font === false

  const loop = useLoop(
    fig,
    () => {
      const cells = [...fig.current!.querySelectorAll<HTMLElement>('.tt-vw')].slice(1)
      const hk = cells.map((c) => c.querySelector<HTMLElement>('.tt-hk')!)
      const labels = cells.map((c) => [c.querySelector<HTMLElement>('.tt-py')!, c.querySelector<HTMLElement>('.tt-gl')!])
      const under = cells.map((c) => c.querySelector<HTMLElement>('.tt-ar > span')!)
      gsap.set([...hk, ...labels.flat(), ...under], { clearProps: 'opacity' })
      const tl = gsap.timeline({ repeat: -1 }).set([...hk, ...labels.flat()], { opacity: 0 }, 0)
      // Fade the marked word in over the bare one, then switch the bare one off: two stacked copies
      // draw the letters heavier than their neighbour.
      cells.forEach((_, i) =>
        tl
          .to(hk[i], { opacity: 1, duration: 0.7, ease: 'okOut' }, 1 + i * 1.4)
          .set(under[i], { opacity: 0 }, 1.7 + i * 1.4)
          .to(labels[i], { opacity: 1, duration: 0.5, ease: 'okOut' }, 1.15 + i * 1.4),
      )
      return tl
        .set(under, { opacity: 1 }, 7.2)
        .to([...hk, ...labels.flat()], { opacity: 0, duration: 0.8, ease: 'okInOut' }, 7.2)
        .set({}, {}, 9)
    },
    font === true,
  )

  return (
    <figure ref={fig} className={`tt-fig tt-lang${still ? ' tt-static' : ''}`} role="group" aria-label={t('blog.textTone.harakatLabel')}>
      <div className="tt-vowels">
        {READINGS.map((w) => (
          <div key={w.tr} className="tt-vw">
            <span className="tt-ar">
              <span lang="ar" dir="rtl">{BARE}</span>
              {w.marked && <span className="tt-hk" lang="ar" dir="rtl">{w.marked}</span>}
            </span>
            <span className="tt-py"><i>{w.tr}</i></span>
            <span className="tt-gl tt-mono">{t(`blog.textTone.${w.gloss}`)}</span>
          </div>
        ))}
      </div>
      {loop.running && <PauseButton paused={loop.paused} onToggle={loop.toggle} />}
    </figure>
  )
}
