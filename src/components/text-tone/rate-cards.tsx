import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { PauseButton, useLoop, useMotion } from './loop-pause'

const SECS = 5
const LANES = [
  { rate: 1, name: 'typing', lines: ['typingWpm', 'typingTps'] },
  { rate: 3, name: 'speaking', lines: ['speakingWpm', 'speakingTps'] },
  { rate: 100, name: 'aModel', lines: ['modelTps', 'shownAt'] },
] as const

// One hole per token at the real rates. The model finishes a hundred-hole card every second.
export function RateCards() {
  const { t } = useTranslation()
  const mode = useMotion()
  const fig = useRef<HTMLElement>(null)
  const clock = useRef<HTMLElement>(null)

  const paint = (time: number) => {
    fig.current?.querySelectorAll('.tt-pile').forEach((pile, p) =>
      [...pile.children].forEach((card, i) => {
        const n = Math.min(100, Math.max(0, Math.floor(LANES[p].rate * time) - i * 100))
        const el = card as HTMLElement
        const [full, rest] = [...el.children] as HTMLElement[]
        el.style.visibility = n || !i ? 'visible' : 'hidden'
        full.style.height = `calc(var(--c) * ${Math.floor(n / 10)})`
        Object.assign(rest.style, { width: `calc(var(--c) * ${n % 10})`, height: n % 10 ? 'var(--c)' : '0' })
      }),
    )
    if (clock.current) clock.current.textContent = t('blog.textTone.clock', { s: Math.min(SECS, Math.floor(time)) })
  }

  useEffect(() => {
    if (mode === 'reduced') paint(1)
  }, [mode])

  const loop = useLoop(fig, () => {
    const o = { t: 0 }
    paint(0)
    const stack = [...fig.current!.querySelectorAll('.tt-pile')[2].children]
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.2 }).to(o, { t: SECS, duration: SECS, ease: 'none', onUpdate: () => paint(o.t) }, 0)
    stack.forEach((card, i) =>
      tl.fromTo(
        card,
        { y: -34, rotation: 0, x: 0 },
        { y: -i * 7, x: -i * 6, rotation: [0, 2.5, -2, 3.5, -1][i], duration: 0.5, ease: 'okOut', immediateRender: false },
        i,
      ),
    )
    return tl
  })

  return (
    <figure ref={fig} className="tt-fig" role="group" aria-label={t('blog.textTone.ratesLabel')}>
      <div className="tt-cards">
        {LANES.map((l) => (
          <div key={l.name} className="tt-lane">
            <div className="tt-pile">
              {Array.from({ length: l.rate > 10 ? SECS : 1 }, (_, i) => (
                <div key={i} className="tt-card">
                  <i />
                  <i />
                </div>
              ))}
            </div>
            <b>{t(`blog.textTone.${l.name}`)}</b>
            <small className="tt-mono">
              {t(`blog.textTone.${l.lines[0]}`)}
              <br />
              {t(`blog.textTone.${l.lines[1]}`)}
            </small>
          </div>
        ))}
      </div>
      <figcaption ref={clock} className="tt-mono">
        {t('blog.textTone.clock', { s: 0 })}
      </figcaption>
      {loop.running && <PauseButton paused={loop.paused} onToggle={loop.toggle} />}
    </figure>
  )
}
