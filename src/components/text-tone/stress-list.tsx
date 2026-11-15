import { Fragment, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Trans, useTranslation } from 'react-i18next'
import { Volume2 } from 'lucide-react'
import { useLocale } from '../../i18n/context'
import { clips } from './clips'
import { whenFonts } from './fonts'
import { onWidthChange, useMotion } from './loop-pause'
import { FLAT, SENTENCE, STRESSED, clipKey, contour, penEase, ramp, type Reading, type TracePoint } from './stage-data'

const WORDS = SENTENCE.split(' ')
const REST = { yPercent: -15, scale: 1.12, '--k': 1 }

type Row = {
  e: Reading
  b: HTMLButtonElement
  s: HTMLElement
  words: HTMLElement[]
  k: number
  em: HTMLElement
  g: HTMLElement
  tr: SVGSVGElement
  label: string
  strokes: TracePoint[][]
  paths: SVGPathElement[]
  tl?: gsap.core.Timeline
}

const plain = (s: string) => s.replace(/<\/?i>/g, '')

function useLabels() {
  const { t } = useTranslation()
  return {
    row: (r: Reading) =>
      t('blog.textTone.rowLabel', { sentence: SENTENCE, word: r.stress, meaning: plain(t(`blog.textTone.meaning.${clipKey(r)}`)) }),
    flat: t('blog.textTone.flatLabel', { sentence: SENTENCE }),
  }
}

function Sentence({ k }: { k: number }) {
  return WORDS.map((w, j) => {
    const last = j === WORDS.length - 1
    const word = <span className="tt-w">{last && j !== k ? `${w}.` : w}</span>
    return (
      <Fragment key={j}>
        {j > 0 && ' '}
        {j === k ? <strong className="tt-em">{word}</strong> : word}
        {last && j === k && '.'}
      </Fragment>
    )
  })
}

export function StressList() {
  const { t } = useTranslation()
  const locale = useLocale()
  const mode = useMotion()
  const labels = useLabels()
  const wrap = useRef<HTMLDivElement>(null)
  const playRef = useRef<(i: number) => void>(() => {})

  useGSAP(
    (_, contextSafe) => {
      if (mode === 'pending' || !wrap.current) return
      const list = wrap.current.querySelector<HTMLElement>('.tt-readings')!
      const rows: Row[] = [...list.querySelectorAll<HTMLButtonElement>('.tt-rd')].map((b, i) => ({
        e: STRESSED[i],
        b,
        s: b.querySelector<HTMLElement>('.tt-s')!,
        words: [...b.querySelectorAll<HTMLElement>('.tt-w')],
        k: i,
        em: b.querySelector<HTMLElement>('.tt-em')!,
        g: b.querySelector<HTMLElement>('.tt-g')!,
        tr: b.querySelector<SVGSVGElement>('.tt-tr')!,
        label: b.getAttribute('aria-label')!,
        strokes: [],
        paths: [],
      }))
      const last = rows.at(-1)!
      const para = wrap.current.nextElementSibling as HTMLElement | null
      let typed = false
      let instant = false
      let alive = true

      // A pitch trace under each line, laid out against that line's own words.
      const trace = () =>
        rows.forEach((r) => {
          const sr = r.s.getBoundingClientRect()
          const H = r.tr.clientHeight || 18
          const x = ramp(
            r.e.words.flatMap((w, j) => {
              const wr = r.words[j].getBoundingClientRect()
              return [[w.start, wr.left - sr.left], [w.end, wr.right - sr.left]] as [number, number][]
            }),
          )
          r.strokes = contour(r.e).map((g) => g.map((p) => ({ t: p.t, x: x(p.t), y: H / 2 - (p.h / 1.3) * (H / 2 - 1.5) })))
          r.tr.setAttribute('viewBox', `0 0 ${sr.width} ${H}`)
          r.tr.innerHTML = r.strokes.map((g) => `<path d="M${g.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')}"/>`).join('')
          r.paths = [...r.tr.querySelectorAll('path')]
        })

      // Back to how a row sits when nothing plays.
      const settle = contextSafe!((r: Row) => {
        if (!alive || mode === 'reduced') return
        if (typed) return void gsap.set(r.words, { opacity: 1 })
        const duration = instant ? 0 : 0.3
        gsap.to(r.words, { opacity: (j: number) => (j === r.k ? 1 : 0.46), duration, overwrite: 'auto' })
        gsap.to(r.words[r.k], { ...REST, duration, ease: 'okOut', overwrite: 'auto' })
        gsap.set(r.paths, { drawSVG: '100%' })
      })

      // Every word brightens as it is spoken; the stressed one lifts when it starts.
      const animate = contextSafe!((r: Row, e: Reading) => {
        if (mode === 'reduced') return
        const tl = (r.tl = gsap.timeline())
        tl.set(r.words, { opacity: 0.46 }, 0)
        if (e === FLAT) {
          e.words.forEach((w, j) => tl.to(r.words[j], { opacity: 1, duration: 0.16, ease: 'okOut' }, w.start))
          return
        }
        tl.set(r.words[r.k], { yPercent: 0, scale: 1, '--k': 0 }, 0)
        r.e.words.forEach((w, j) =>
          j === r.k
            ? tl.to(r.words[j], { ...REST, opacity: 1, duration: 0.42, ease: 'okLift' }, w.start)
            : tl.to(r.words[j], { opacity: 1, duration: 0.16, ease: 'okOut' }, w.start),
        )
        r.strokes.forEach((g, j) =>
          tl.fromTo(r.paths[j], { drawSVG: '0%' }, { drawSVG: '100%', duration: g.at(-1)!.t - g[0].t, ease: penEase(g) }, g[0].t),
        )
      })

      playRef.current = (i: number) => {
        const r = rows[i]
        void clips.play(
          r,
          (typed ? FLAT : r.e).src,
          () => {
            r.b.classList.add('tt-on')
            animate(r, typed ? FLAT : r.e)
          },
          () => {
            r.tl?.kill()
            r.b.classList.remove('tt-on')
            settle(r)
          },
        )
      }
      const stopNow = () => {
        instant = true
        clips.stop()
        instant = false
      }

      rows.forEach((r) => gsap.set(r.words[r.k], REST))

      let ctl: gsap.core.Timeline | undefined
      // The "typed" point, made by the list itself.
      const setTyped = (p: number) => {
        if (p > 0.02 && !typed) stopNow()
        list.classList.toggle('tt-moving', p > 0.02 && p < 0.97)
        const t = p >= 0.97
        if (t === typed) return
        stopNow()
        typed = t
        list.classList.toggle('tt-typed', t)
        last.b.setAttribute('aria-label', t ? labels.flat : last.label)
        rows.slice(0, -1).forEach((r) => (r.b.inert = t))
      }

      // Reserved height, no pin: the list keeps its height and the rows move.
      const build = contextSafe!(() => {
        ctl?.scrollTrigger?.kill()
        ctl?.kill()
        stopNow()
        typed = false
        list.classList.remove('tt-typed', 'tt-moving')
        gsap.set(rows.flatMap((r) => [r.b, r.em, r.g, ...r.words]), { clearProps: 'transform,opacity,visibility,marginLeft,marginRight' })
        rows.forEach((r) => {
          gsap.set(r.words[r.k], REST)
          r.b.inert = false
        })
        last.b.setAttribute('aria-label', last.label)
        trace()
        if (!para) return
        const caret = last.s.querySelector('.tt-caret')!
        const H = last.tr.clientHeight || 18
        const top = last.b.getBoundingClientRect().top
        last.tr.insertAdjacentHTML('beforeend', `<path class="tt-rule" d="M0,${H / 2} L${last.s.getBoundingClientRect().width.toFixed(1)},${H / 2}"/>`)
        ctl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: para, start: 'top 68%', end: 'top 28%', scrub: 0.4, onUpdate: (st) => setTyped(st.progress) },
        })
        rows.forEach((r, i) => {
          const lag = i * 0.012
          ctl!
            .fromTo(r.words[r.k], REST, { yPercent: 0, scale: 1, '--k': 0, duration: 0.3, ease: 'okInOut' }, lag)
            .fromTo(r.em, { marginLeft: '.2em', marginRight: '.2em' }, { marginLeft: '0em', marginRight: '0em', duration: 0.3, ease: 'okInOut' }, lag)
            .fromTo(r.g, { opacity: 1 }, { opacity: 0, duration: 0.22 }, 0)
            .fromTo(r.words, { opacity: (j: number) => (j === r.k ? 1 : 0.46) }, { opacity: 1, duration: 0.4 }, 0.3)
          r.strokes.forEach((g, j) =>
            ctl!.fromTo(
              r.paths[j],
              { morphSVG: r.paths[j].getAttribute('d')! },
              { morphSVG: `M${g[0].x.toFixed(1)},${H / 2} L${g.at(-1)!.x.toFixed(1)},${H / 2}`, duration: 0.3, ease: 'okInOut' },
              lag,
            ),
          )
          if (r !== last)
            ctl!
              .fromTo(r.b, { y: 0 }, { y: top - r.b.getBoundingClientRect().top, duration: 0.5, ease: 'okInOut' }, 0.32 + lag)
              .fromTo(r.b, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1 }, 0.87)
        })
        ctl
          .fromTo(last.tr.querySelector('.tt-rule'), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.86)
          .fromTo(caret, { opacity: 0 }, { opacity: 1, duration: 0.02 }, 0.97)
          .set({}, {}, 1)
      })

      const draw = mode === 'full' ? build : contextSafe!(trace)
      void whenFonts([['400 1em "Instrument Serif"']]).then(() => {
        if (!alive) return
        draw()
        ScrollTrigger.refresh()
      })
      const off = onWidthChange(draw)
      return () => {
        alive = false
        off()
        clips.stop()
      }
    },
    { dependencies: [mode], scope: wrap, revertOnUpdate: true },
  )

  return (
    <div className="tt-list" ref={wrap}>
      {locale.code !== 'en' && <p className="tt-note tt-mono">{t('blog.textTone.englishOnly')}</p>}
      <ul className="tt-readings">
        {STRESSED.map((r, i) => (
          <li key={r.src}>
            <button type="button" className="tt-rd" aria-label={labels.row(r)} onClick={() => playRef.current(i)}>
              <span className="tt-s">
                <Sentence k={i} />
                {i === STRESSED.length - 1 && <i className="tt-caret" aria-hidden="true" />}
              </span>
              <svg className="tt-tr" aria-hidden="true" />
              <span className="tt-g tt-mono">
                <Trans i18nKey={`blog.textTone.meaning.${clipKey(r)}`} components={{ i: <em /> }} />
              </span>
              <Volume2 className="tt-ic tt-ear" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Under reduced motion the list stays open, and the typed version is this static line under "Now type it."
export function TypedLine() {
  const mode = useMotion()
  const labels = useLabels()
  const btn = useRef<HTMLButtonElement>(null)
  const key = useRef({}).current
  if (mode !== 'reduced') return null
  return (
    <p className="tt-readings tt-one">
      <button
        ref={btn}
        type="button"
        className="tt-rd"
        aria-label={labels.flat}
        onClick={() =>
          void clips.play(
            key,
            FLAT.src,
            () => btn.current?.classList.add('tt-on'),
            () => btn.current?.classList.remove('tt-on'),
          )
        }
      >
        <span className="tt-s">
          {SENTENCE}.<i className="tt-caret" aria-hidden="true" />
        </span>
        <Volume2 className="tt-ic tt-ear" aria-hidden="true" />
      </button>
    </p>
  )
}
