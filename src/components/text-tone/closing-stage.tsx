import { Fragment, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { whenFonts } from './fonts'
import { PauseButton, onWidthChange, useLoop, useMotion } from './loop-pause'

// Stage units: 1000 wide at any size, the arc's top at (500, 0), a circle of radius RV.
const RV = 1300
const EDGE = RV - Math.sqrt(RV * RV - 700 * 700)
const ARC = `M-200,${EDGE.toFixed(1)} A${RV},${RV} 0 0 1 1200,${EDGE.toFixed(1)}`
const FLAT = 'M-200,0 L1200,0'
// Thin bands on the horizon that end in the footer's own black, so nothing is cut off at the join.
const BANDS = ['#d4a03c', '#efe6d2', '#6b8cae', '#e2d6bd', '#d4a03c', '#efe6d2', '#0b0a09']
const LINE = 'I didn’t say she stole the money'
const FRAC = 0.46
const UNSEATED = { x: 0, y: 0, rotation: 0, scale: 1 }

type Seat = { y: number; r: number }

// The typed line gets its curve, its light and its paper back, then loses them again.
export function ClosingStage() {
  const { t } = useTranslation()
  const mode = useMotion()
  const stage = useRef<HTMLDivElement>(null)
  const [fonts, setFonts] = useState(false)
  useEffect(() => {
    if (mode !== 'pending') void whenFonts([['400 1em "Instrument Serif"']]).then(() => setFonts(true))
  }, [mode])

  // Size the sentence to the stage, then seat every letter on the circle: dropped by the sagitta at
  // its x and turned to the tangent.
  const layout = () => {
    const el = stage.current!
    const line = el.querySelector<HTMLElement>('.tt-line')!
    const chars = [...line.querySelectorAll<HTMLElement>('.tt-c')]
    const w = el.clientWidth, h = el.clientHeight, s = w / 1000, top = Math.round(h * (1 - FRAC))
    el.querySelector('svg')!.setAttribute('viewBox', `0 0 ${w} ${h}`)
    el.querySelector('.tt-space')!.setAttribute('transform', `translate(0 ${top}) scale(${s})`)
    gsap.set(chars, { clearProps: 'transform' })
    line.style.fontSize = '100px'
    const fs = Math.min(w * 0.08, (100 * w * (w < 640 ? 0.92 : 0.86)) / line.offsetWidth)
    line.style.fontSize = `${fs}px`
    line.style.top = `${top}px`
    const lr = line.getBoundingClientRect(), mid = lr.left + lr.width / 2
    const seats = new Map<Element, Seat>()
    for (const c of chars) {
      const r = c.getBoundingClientRect()
      const th = Math.asin((r.left + r.width / 2 - mid) / (RV * s))
      seats.set(c, { y: RV * s * (1 - Math.cos(th)), r: (th * 180) / Math.PI })
    }
    gsap.set(chars, { transformOrigin: '50% 78%' })
    const seated = { x: 0, y: (_: number, c: Element) => seats.get(c)!.y, rotation: (_: number, c: Element) => seats.get(c)!.r, scale: 1 }
    return { chars, seated }
  }

  // Reduced motion: the bent arc with its paper, still.
  useGSAP(
    () => {
      if (mode !== 'reduced' || !fonts) return
      const place = () => {
        const { chars, seated } = layout()
        gsap.set(chars, seated)
      }
      place()
      return onWidthChange(place)
    },
    { dependencies: [mode, fonts], scope: stage, revertOnUpdate: true },
  )

  const loop = useLoop(
    stage,
    () => {
      const el = stage.current!
      const arc = el.querySelector<SVGPathElement>('.tt-arc')!
      const rim = el.querySelector<SVGPathElement>('.tt-rim')!
      const shade = el.querySelector<SVGGElement>('.tt-dress')!
      const layers = [...el.querySelectorAll('.tt-under circle')]
      gsap.set([arc, rim, shade, ...layers], { clearProps: 'all' })
      arc.setAttribute('d', ARC)
      const { chars, seated } = layout()
      gsap.set(chars, seated)
      const e = { duration: 1.4, ease: 'okInOut' }
      return gsap
        .timeline({ repeat: -1 })
        .fromTo(arc, { morphSVG: FLAT }, { morphSVG: ARC, ...e }, 1.2)
        .fromTo(chars, UNSEATED, { ...seated, ...e, stagger: { each: 0.012, from: 'center' } }, 1.2)
        .fromTo(shade, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.7)
        .to(shade, { autoAlpha: 0, duration: 0.5 }, 7.6)
        .fromTo(layers, { attr: { cy: RV + 1000 } }, { attr: { cy: RV }, duration: 1.3, ease: 'okOut', stagger: 0.08 }, 1.7)
        .fromTo(rim, { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 1.4, ease: 'okOut' }, 2)
        .to(rim, { autoAlpha: 0, duration: 0.8, ease: 'okInOut' }, 7)
        .to(layers, { attr: { cy: RV + 1000 }, duration: 1.1, ease: 'okInOut', stagger: { each: 0.05, from: 'end' } }, 7)
        .fromTo(arc, { morphSVG: ARC }, { morphSVG: FLAT, immediateRender: false, ...e }, 7.5)
        .to(chars, { ...UNSEATED, ...e, stagger: { each: 0.012, from: 'edges' } }, 7.5)
        .set({}, {}, 9.4)
    },
    fonts,
  )

  return (
    <div className="tt-closing">
      <div ref={stage} className="tt-stage tt-end" role="img" aria-label={t('blog.textTone.stageLabel')}>
        <svg aria-hidden="true">
          <defs>
            <filter id="tt-soft"><feGaussianBlur stdDeviation="9" /></filter>
            <filter id="tt-lift" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="-5" stdDeviation="7" floodOpacity=".34" />
            </filter>
            {/* Long, thin noise reads as paper fibre once it is multiplied over a flat colour. */}
            <filter id="tt-fibre"x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency=".012 .55" numOctaves="3" seed="6" />
              <feColorMatrix values="0 0 0 0 .42  0 0 0 0 .37  0 0 0 0 .3  1.5 0 0 0 -.62" />
            </filter>
            <clipPath id="tt-clip"><path d={`${ARC} L1200,950 L-200,950 Z`} /></clipPath>
          </defs>
          <g className="tt-space">
            <path className="tt-rim" d={ARC} />
            <g className="tt-under" clipPath="url(#tt-clip)">
              {BANDS.map((fill, i) => (
                <circle key={i} cx="500" cy={RV} r={RV - i * 17} fill={fill} filter="url(#tt-lift)" />
              ))}
              <g className="tt-dress">
                <rect className="tt-fibre" x="-200" y="-10" width="1400" height="960" filter="url(#tt-fibre)" />
                <path className="tt-shade" d={ARC} transform="translate(0,-6)" />
              </g>
            </g>
            <path className="tt-arc" d={ARC} />
          </g>
        </svg>
        <p className="tt-line" aria-hidden="true">
          {LINE.split(' ').map((word, i) => (
            <Fragment key={i}>
              {i > 0 && ' '}
              <span className="tt-w">
                {[...word].map((ch, j) => (
                  <span key={j} className="tt-c">{ch}</span>
                ))}
              </span>
            </Fragment>
          ))}
        </p>
      </div>
      {loop.running && <PauseButton paused={loop.paused} onToggle={loop.toggle} />}
    </div>
  )
}
