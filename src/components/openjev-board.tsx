import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/motion'
import {
  STATE_HEADINGS,
  stateAt,
  AXIS,
  BANDS,
  BIG,
  LOSS,
  ROWS,
  ROW_H,
  ROW_IDS,
  ROWS_TOP,
  STATES,
  STATIC_CAPTION,
  STATIC_STATE,
  rowLayout,
  transitionOps,
  type RowId,
} from '../lib/openjev-data'

gsap.registerPlugin(ScrollTrigger)

const W = 380
const BAR_X = 168
export const BAR_W = 160
const ROWS_END = ROWS_TOP + 8 * ROW_H
const PARTS_Y = ROWS_END + 16
const H = PARTS_Y + 124
const xAt = (v: number) => BAR_X + ((v - AXIS.min) / (AXIS.max - AXIS.min)) * BAR_W
const LOSS_TOP = PARTS_Y + 16
const LOSS_BOTTOM = PARTS_Y + 100
const lossY = (l: number) => LOSS_TOP + ((0.75 - l) / 0.45) * (LOSS_BOTTOM - LOSS_TOP)
const lossX = (i: number) => 36 + (i * (W - 44)) / 3

const PARTS = ['axis', 'bands', 'loss', 'big'] as const
type Part = (typeof PARTS)[number]

type RowText = { label?: string; labelKey?: string; display?: string; displayKey?: string; mark: string }

function partsOf(k: number): Record<Part, boolean> {
  const s = STATES[k]
  return { axis: !s.bands, bands: !!s.bands, loss: !!s.loss, big: !!s.big }
}

function BoardRow({ id, y, frac, shown }: { id: RowId; y: number; frac: number; shown: boolean }) {
  const { t } = useTranslation()
  const row: RowText = ROWS[id]
  const label = row.labelKey ? t(row.labelKey) : row.label
  const value = row.displayKey ? t(row.displayKey) : row.display
  const mid = ROW_H / 2
  return (
    <g data-row={id} className={`oj-row oj-${row.mark}`} transform={`translate(0 ${y})`} opacity={shown ? 1 : 0}>
      <text className="oj-label" x={0} y={mid} dominantBaseline="middle">
        {label}
      </text>
      {row.mark === 'tick' && <line x1={xAt(AXIS.chance)} x2={xAt(AXIS.chance)} y1={5} y2={ROW_H - 5} />}
      {row.mark === 'empty' && <line x1={BAR_X} x2={BAR_X + BAR_W} y1={mid} y2={mid} />}
      {row.mark !== 'tick' && row.mark !== 'empty' && (
        <rect data-bar x={BAR_X} y={7} height={ROW_H - 14} width={frac * BAR_W} />
      )}
      <text className="oj-value" x={W} y={mid} dominantBaseline="middle" textAnchor="end">
        {value}
      </text>
    </g>
  )
}

/**
 * React draws the geometry of the state the board mounted in and never again.
 * Once animated, GSAP owns every row's transform, opacity and bar width, so a
 * re-render that wrote those attributes would snap rows mid-tween.
 */
export function OpenJevBoard({ state, animate }: { state: number; animate: boolean }) {
  const { t } = useTranslation()
  const svg = useRef<SVGSVGElement>(null)
  const mounted = useRef(state)
  const running = useRef<gsap.core.Timeline | null>(null)
  const drawn = animate ? mounted.current : state
  const lay = rowLayout(drawn)
  const parts = partsOf(drawn)

  useGSAP(
    () => {
      const el = svg.current
      if (!animate || !el || (running.current === null && state === mounted.current)) return
      running.current?.kill()
      const rowOf = (id: RowId) => el.querySelector<SVGGElement>(`[data-row="${id}"]`)!
      const ops = transitionOps(state, (id) => Number(gsap.getProperty(rowOf(id), 'opacity')) > 0.01)
      const tl = gsap.timeline({ defaults: { duration: 0.6, ease: 'power2.out' } })
      ROW_IDS.forEach((id, i) => {
        const g = rowOf(id)
        const bar = g.querySelector('[data-bar]')
        const op = ops[id]
        if (op.opacity === 0) {
          tl.to(g, { opacity: 0, duration: 0.3 }, 0)
          return
        }
        if (op.snap) {
          tl.set(g, { y: op.y }, 0)
          if (bar) tl.set(bar, { attr: { width: 0 } }, 0)
        }
        tl.to(g, { y: op.y, opacity: 1 }, i * 0.05)
        if (bar) tl.to(bar, { attr: { width: op.frac * BAR_W } }, i * 0.05)
      })
      const target = partsOf(state)
      for (const part of PARTS) {
        tl.to(el.querySelector(`[data-part="${part}"]`), { opacity: target[part] ? 1 : 0, duration: 0.4 }, target[part] ? 0.2 : 0)
      }
      running.current = tl
    },
    { dependencies: [state, animate], scope: svg },
  )

  return (
    <svg ref={svg} className="oj-board" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(`blog.openjev.caption.${state}`)}>
      <g data-part="axis" opacity={parts.axis ? 1 : 0}>
        <line className="oj-chance" x1={xAt(AXIS.chance)} x2={xAt(AXIS.chance)} y1={ROWS_TOP - 6} y2={ROWS_END} />
        <text className="oj-axis" x={xAt(AXIS.chance)} y={ROWS_TOP - 12} textAnchor="middle">
          {t('blog.openjev.chance')}
        </text>
      </g>

      {ROW_IDS.map((id) => (
        <BoardRow key={id} id={id} {...lay[id]} />
      ))}

      <g data-part="bands" opacity={parts.bands ? 1 : 0}>
        <text className="oj-axis" x={0} y={ROWS_TOP - 12}>
          {t('blog.openjev.preShare')}
        </text>
        {BANDS.map((b, i) => {
          const y = ROWS_TOP + i * ROW_H * 1.6
          return (
            <g key={b.label} transform={`translate(0 ${y})`}>
              <text className="oj-label" x={0} y={ROW_H / 2} dominantBaseline="middle">
                {b.label}
              </text>
              <rect className="oj-band-bg" x={BAR_X} y={7} height={ROW_H - 14} width={BAR_W} />
              <rect className="oj-band" x={BAR_X} y={7} height={ROW_H - 14} width={b.share * BAR_W} />
              <text className="oj-value" x={W} y={ROW_H / 2} dominantBaseline="middle" textAnchor="end">
                {b.display}
              </text>
            </g>
          )
        })}
      </g>

      {/* The dead run sits at ln 2 = 0.693, between the live run's first two
          checkpoints, so only the live run's ends carry values. */}
      <g data-part="loss" opacity={parts.loss ? 1 : 0}>
        {[0.6, 0.4].map((v) => (
          <g key={v}>
            <line className="oj-loss-grid" x1={lossX(0)} x2={W} y1={lossY(v)} y2={lossY(v)} />
            <text className="oj-axis" x={0} y={lossY(v)} dominantBaseline="middle">
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        <line className="oj-dead" x1={lossX(0)} x2={W} y1={lossY(LOSS.dead)} y2={lossY(LOSS.dead)} />
        <text className="oj-axis" x={W} y={lossY(LOSS.dead) - 7} textAnchor="end">
          {t('blog.openjev.lossDead')}
        </text>
        <polyline className="oj-live" points={LOSS.live.map((l, i) => `${lossX(i)},${lossY(l)}`).join(' ')} />
        {LOSS.live.map((l, i) => (
          <circle key={i} className="oj-live-pt" cx={lossX(i)} cy={lossY(l)} r={2.5} />
        ))}
        <text className="oj-value oj-live-val" x={lossX(0)} y={lossY(LOSS.live[0]) - 7}>
          {LOSS.liveDisplay[0]}
        </text>
        <text className="oj-value oj-live-val" x={lossX(3) - 12} y={lossY(LOSS.live[3])} textAnchor="end" dominantBaseline="middle">
          {LOSS.liveDisplay[3]}
        </text>
        <text className="oj-axis oj-live-key" x={lossX(0)} y={LOSS_BOTTOM + 18}>
          {t('blog.openjev.lossLive')}
        </text>
      </g>

      <g data-part="big" opacity={parts.big ? 1 : 0}>
        <text className="oj-big" x={0} y={PARTS_Y + 50}>
          {BIG.display}
        </text>
        <text className="oj-label" x={0} y={PARTS_Y + 74}>
          {t('blog.openjev.bigLabel')}
        </text>
      </g>
    </svg>
  )
}

export function OpenJevTable() {
  const { t } = useTranslation()
  return (
    <table className="sr-only">
      <caption>{t('blog.openjev.tableCaption')}</caption>
      <thead>
        <tr>
          <th>{t('blog.openjev.entry')}</th>
          <th>{t('blog.openjev.score')}</th>
        </tr>
      </thead>
      <tbody>
        {ROW_IDS.map((id) => {
          const row: RowText = ROWS[id]
          return (
            <tr key={id}>
              <td>{row.labelKey ? t(row.labelKey) : row.label}</td>
              <td>{row.displayKey ? t(row.displayKey) : row.display}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function OpenJevStatic() {
  const { t } = useTranslation()
  return (
    <figure className="oj-figure">
      <p className="pa-fence-head">{t('blog.openjev.board')}</p>
      <OpenJevBoard state={STATIC_STATE} animate={false} />
      <figcaption>{t(`blog.openjev.caption.${STATIC_CAPTION}`)}</figcaption>
      <OpenJevTable />
    </figure>
  )
}

function headingTops(): Map<string, number> {
  return new Map(STATE_HEADINGS.map(([id]) => [id, document.getElementById(id)?.getBoundingClientRect().top ?? Infinity]))
}

const readState = () => stateAt(headingTops(), window.innerHeight * 0.6)

function RailFigure() {
  const { t } = useTranslation()
  const [reduced] = useState(prefersReducedMotion)
  // Mounts client-side only, so the headings exist and the first state snaps
  // instead of animating up from state 0 on a mid-page load.
  const [state, setState] = useState(() => (reduced ? STATIC_STATE : readState()))
  const caption = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reduced) return
      // A reflow can cross several headings in one update, so read the current
      // section instead of counting callbacks.
      ScrollTrigger.create({
        trigger: '.pa-body',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: () => setState(readState()),
        onRefresh: () => setState(readState()),
      })
    },
    { dependencies: [reduced], revertOnUpdate: true },
  )

  useGSAP(
    () => {
      if (!reduced && caption.current) gsap.fromTo(caption.current, { opacity: 0 }, { opacity: 1, duration: 0.4, overwrite: 'auto' })
    },
    { dependencies: [state] },
  )

  return (
    <figure className="oj-figure">
      <p className="pa-fence-head">{t('blog.openjev.board')}</p>
      <OpenJevBoard state={state} animate={!reduced} />
      <figcaption ref={caption}>{t(`blog.openjev.caption.${reduced ? STATIC_CAPTION : state}`)}</figcaption>
      <OpenJevTable />
    </figure>
  )
}

export function OpenJevRail() {
  const [enabled, setEnabled] = useState(false)

  // Read at mount rather than at render: the route is prerendered in Node.
  useEffect(() => {
    const mq = matchMedia('(min-width: 1024px)')
    const sync = () => setEnabled(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return enabled ? <RailFigure /> : null
}
