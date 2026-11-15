import { useRef } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { PauseButton, useLoop, useMotion } from './loop-pause'

const STOP = 4
const RATE = 40 / 6
const ON = { backgroundColor: '#e2573c', rotationX: 180 }

// Both rows hear "no wait, not that" at the same moment. Only the spoken one can use it.
export function FortySheets() {
  const { t } = useTranslation()
  const mode = useMotion()
  const fig = useRef<HTMLElement>(null)
  const loop = useLoop(fig, () => {
    const [A, B] = [...fig.current!.querySelectorAll('.tt-run')].map((r) => ({
      files: [...r.querySelectorAll<HTMLElement>('.tt-files i')],
      slip: r.querySelector<HTMLElement>('.tt-slip')!,
      count: r.querySelector<HTMLElement>('.tt-count')!,
    }))
    const counts = (a: number, b: number) => {
      A.count.textContent = t('blog.textTone.changed', { n: a })
      B.count.textContent = t('blog.textTone.changed', { n: b })
    }
    gsap.set([...A.files, ...B.files, A.slip, B.slip], { clearProps: 'all' })
    counts(0, 0)
    const o = { t: 0 }
    const said = STOP / RATE
    return gsap
      .timeline({ repeat: -1, repeatDelay: 2.6 })
      .set([A.slip, B.slip], { autoAlpha: 0 }, 0)
      .to(o, { t: 6, duration: 6, ease: 'none', onUpdate: () => counts(Math.min(STOP, Math.floor(o.t * RATE)), Math.min(40, Math.floor(o.t * RATE))) }, 0)
      .to(A.files.slice(0, STOP), { ...ON, duration: 0.3, ease: 'okOut', stagger: 1 / RATE }, 0)
      .to(B.files, { ...ON, duration: 0.3, ease: 'okOut', stagger: 1 / RATE }, 0)
      .fromTo(A.slip, { autoAlpha: 0, y: -16, rotation: -9 }, { autoAlpha: 1, y: 0, rotation: -2, duration: 0.45, ease: 'okLift' }, said)
      .fromTo(B.slip, { autoAlpha: 0, y: -16, rotation: -9 }, { autoAlpha: 0.4, y: -5, rotation: -6, duration: 0.45, ease: 'okOut' }, said)
      .to(B.slip, { autoAlpha: 1, y: 0, rotation: -2, duration: 0.45, ease: 'okLift' }, 6.25)
  })
  const reduced = mode === 'reduced'
  const run = (key: 'spoken' | 'typed', lit: number) => (
    <div className="tt-run">
      <header>
        <b>{t(`blog.textTone.${key}`)}</b>
        <span className="tt-slip tt-mono">{t('blog.textTone.noWait')}</span>
        <span className="tt-count tt-mono">{reduced ? t('blog.textTone.changed', { n: lit }) : null}</span>
      </header>
      <div className="tt-files">
        {Array.from({ length: 40 }, (_, i) => (
          <i key={i} className={reduced && i < lit ? 'tt-lit' : undefined} />
        ))}
      </div>
    </div>
  )
  return (
    <figure ref={fig} className="tt-fig" role="group" aria-label={t('blog.textTone.sheetsLabel')}>
      <div className="tt-runs">
        {run('spoken', STOP)}
        {run('typed', 40)}
      </div>
      {loop.running && <PauseButton paused={loop.paused} onToggle={loop.toggle} />}
    </figure>
  )
}
