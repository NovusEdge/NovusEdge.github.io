import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { whenFonts } from './fonts'
import { PauseButton, useLoop, useMotion } from './loop-pause'

const TONES = [
  { han: '妈', marked: 'mā', d: 'M8,6 L92,6', gloss: 'mother' },
  { han: '麻', marked: 'má', d: 'M8,24 C36,23 62,14 92,4', gloss: 'hemp' },
  { han: '马', marked: 'mǎ', d: 'M8,30 C28,40 44,42 54,38 C70,31 82,18 92,12', gloss: 'horse' },
  { han: '骂', marked: 'mà', d: 'M8,4 C36,8 66,26 92,40', gloss: 'toScold' },
] as const
const LEVEL = 'M8,22 L92,22'
const POEM = {
  han: '石室诗士施氏，嗜狮，誓食十狮',
  marked: 'Shíshì shīshì Shī Shì, shì shī, shì shí shí shī',
  bare: 'shi shi shi shi shi shi, shi shi, shi shi shi shi',
}

// Four words that differ only by tone. Take the tones away and the four fold into one syllable:
// the same move as the English list.
export function TonesFigure() {
  const { t } = useTranslation()
  const mode = useMotion()
  const fig = useRef<HTMLElement>(null)
  const [fonts, setFonts] = useState(false)
  useEffect(() => {
    if (mode === 'full') void whenFonts([['500 1em "Noto Serif SC"', '妈'], ['italic 500 1em Spectral', 'ā']]).then(() => setFonts(true))
  }, [mode])

  const loop = useLoop(
    fig,
    () => {
      const root = fig.current!
      const cells = [...root.querySelectorAll<HTMLElement>('.tt-tone')]
      const q = (s: string) => cells.map((c) => c.querySelector<HTMLElement>(s)!)
      const paths = cells.map((c) => c.querySelector('path')!)
      const han = q('.tt-han'), gl = q('.tt-gl'), marked = q('.tt-py i'), bare = q('.tt-py i + i')
      const poem = root.querySelector('.tt-poem')!
      const [pm, pb] = [...poem.querySelectorAll<HTMLElement>('.tt-py i')]
      const ph = poem.querySelector<HTMLElement>('.tt-han')!
      gsap.set([...cells, ...han, ...gl, ...marked, ...bare, ph, pm, pb], { clearProps: 'transform,opacity,visibility' })
      paths.forEach((p, i) => p.setAttribute('d', TONES[i].d))
      const box = root.querySelector('.tt-tones')!.getBoundingClientRect()
      const cx = box.left + box.width / 2, cy = box.top + box.height / 2
      const to = cells.map((c) => {
        const r = c.getBoundingClientRect()
        return { x: cx - r.left - r.width / 2, y: cy - r.top - r.height / 2 }
      })
      const up = -han[0].offsetHeight * 0.82, S = 2.4, R = S + 4.6
      const tl = gsap
        .timeline({ repeat: -1 })
        .to(paths, { morphSVG: LEVEL, duration: 0.7, ease: 'okInOut', stagger: 0.06 }, S)
        .to([...marked, pm], { opacity: 0, duration: 0.3, ease: 'okOut' }, S)
        .to([...bare, pb], { opacity: 1, duration: 0.3, ease: 'okOut' }, S + 0.2)
        .to([...han, ...gl], { opacity: 0, duration: 0.5, ease: 'okOut' }, S + 0.6)
        .to(ph, { opacity: 0.13, duration: 0.5, ease: 'okOut' }, S + 0.6)
        .to(cells, { x: (i) => to[i].x, y: (i) => to[i].y, duration: 0.85, ease: 'okInOut' }, S + 1.1)
        .to(bare, { y: up, duration: 0.85, ease: 'okInOut' }, S + 1.1)
        .to(cells.slice(1), { autoAlpha: 0, duration: 0.12 }, S + 1.9)
        .to(cells.slice(1), { autoAlpha: 1, duration: 0.12 }, R)
        .to(cells, { x: 0, y: 0, duration: 0.85, ease: 'okInOut' }, R + 0.05)
        .to(bare, { y: 0, duration: 0.85, ease: 'okInOut' }, R + 0.05)
        .to([...han, ...gl, ph], { opacity: 1, duration: 0.5, ease: 'okOut' }, R + 0.7)
        .to([...bare, pb], { opacity: 0, duration: 0.3, ease: 'okOut' }, R + 0.9)
        .to([...marked, pm], { opacity: 1, duration: 0.3, ease: 'okOut' }, R + 1.05)
      paths.forEach((p, i) => tl.to(p, { morphSVG: TONES[i].d, duration: 0.7, ease: 'okInOut' }, R + 0.9 + i * 0.06))
      return tl.set({}, {}, R + 2)
    },
    fonts,
  )

  return (
    <figure ref={fig} className={`tt-fig tt-lang${mode === 'reduced' ? ' tt-static' : ''}`} role="group" aria-label={t('blog.textTone.tonesLabel')}>
      <div className="tt-tones">
        {TONES.map((x) => (
          <div key={x.han} className="tt-tone">
            <svg className="tt-tc" viewBox="0 0 100 44" aria-hidden="true">
              <path d={x.d} />
            </svg>
            <span className="tt-han" lang="zh-Hans">{x.han}</span>
            <span className="tt-py"><i>{x.marked}</i><i>ma</i></span>
            <span className="tt-gl tt-mono">{t(`blog.textTone.${x.gloss}`)}</span>
          </div>
        ))}
      </div>
      <div className="tt-poem">
        <span className="tt-han" lang="zh-Hans">{POEM.han}</span>
        <span className="tt-py"><i>{POEM.marked}</i><i>{POEM.bare}</i></span>
      </div>
      {loop.running && <PauseButton paused={loop.paused} onToggle={loop.toggle} />}
    </figure>
  )
}
