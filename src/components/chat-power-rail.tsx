import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../lib/motion'
import { DC_AVG_MW, fmtMW, fmtWh, power, useInputs } from '../lib/chat-power'

const W = 340
const H = 320

function Plate({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg className="cpr-plate" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {children}
    </svg>
  )
}

const AREA_SIDE = 290
const AREA_BASE = 310
const side = (gw: number) => AREA_SIDE * Math.sqrt(gw / 100)
const AREAS = [
  { name: 'Fingrid enquiries', value: '>100 GW', gw: 100, asked: true },
  { name: 'UK data-centre queue', value: '73 GW', gw: 73, asked: true },
  { name: 'Data centres, 2025', value: '55 GW', gw: 55, asked: false },
]

function NumberScene() {
  const avg = side(0.14)
  const peak = side(0.233)
  return (
    <Plate label="Areas to scale. Fingrid holds over 100 GW of connection enquiries, the UK queue has about 73 GW of data centres, and data centres used about 55 GW on average in 2025. Consumer chat draws about 140 MW on average and 233 MW at peak, a speck in the corner.">
      {AREAS.map((a) => {
        const s = side(a.gw)
        const top = AREA_BASE - s
        return (
          <g key={a.name}>
            <rect data-grow="xy" className={a.asked ? 'cpr-asked' : 'cpr-used'} x={0.5} y={top} width={s} height={s} />
            <g data-in>
              <text className="cpr-l" x={9} y={top + 17}>
                {a.name}
              </text>
              <text className="cpr-l cpr-strong" x={s - 8} y={top + 17} textAnchor="end">
                {a.value}
              </text>
            </g>
          </g>
        )
      })}
      <rect data-grow="xy" className="cpr-ring" x={0.5} y={AREA_BASE - peak} width={peak} height={peak} />
      <rect data-grow="xy" className="cpr-fill-ox" x={0.5} y={AREA_BASE - avg} width={avg} height={avg} />
      <g data-in>
        <line className="cpr-lead" x1={peak + 2} y1={AREA_BASE - peak - 2} x2={36} y2={270} />
        <text className="cpr-v cpr-ox" x={41} y={268}>
          140 MW
        </text>
        <text className="cpr-l cpr-ox" x={41} y={284}>
          consumer chat
        </text>
        <text className="cpr-l" x={41} y={299}>
          233 MW at peak
        </text>
      </g>
    </Plate>
  )
}

const SPINE_X = 22
const TRACK_Y = 244
// 1 MW to 100 GW, the span the calculator's sliders can reach between them.
const trackX = (mw: number) => (Math.min(5, Math.max(0, Math.log10(mw))) / 5) * W

function ChainScene() {
  const v = useInputs()
  const { avg, peak } = power(v)
  const steps = [
    { value: `${v.wau}M`, label: 'weekly users' },
    { value: `× ${v.msgs.toFixed(2)}`, label: 'messages a day' },
    { value: `× ${fmtWh(v.wh)}`, label: 'a message' },
    { value: `× ${v.mult.toFixed(2)}`, label: 'all assistants' },
  ]
  const ax = trackX(avg)
  const px = trackX(peak)
  const labelX = Math.min(Math.max(ax - 8, 0), W - 150)
  const share = ((avg / DC_AVG_MW) * 100).toFixed(2)
  return (
    <Plate
      label={`The calculator's sum: ${v.wau} million weekly users, times ${v.msgs.toFixed(2)} messages a day, times ${fmtWh(v.wh)} a message, times ${v.mult.toFixed(2)} for all assistants, gives ${fmtMW(avg)} on average and ${fmtMW(peak)} at peak, ${share}% of the 55 GW data centres used in 2025.`}
    >
      <path data-draw pathLength={1} className="cpr-spine" d={`M${SPINE_X} 24 V178 C${SPINE_X} 214 ${ax} 204 ${ax} ${TRACK_Y - 7}`} />
      {steps.map((s, i) => {
        const y = 24 + i * 46
        return (
          <g key={s.label} data-in>
            <circle className="cpr-node" cx={SPINE_X} cy={y} r={4} />
            <text className="cpr-v" x={42} y={y + 6}>
              {s.value}
            </text>
            <text className="cpr-l" x={W} y={y + 5} textAnchor="end">
              {s.label}
            </text>
          </g>
        )
      })}
      <g data-in>
        <line className="cpr-axis" x1={0} x2={W} y1={TRACK_Y} y2={TRACK_Y} />
        {[0, 1, 2, 3, 4, 5].map((d) => (
          <line key={d} className="cpr-axis" x1={(d / 5) * W} x2={(d / 5) * W} y1={TRACK_Y - 3} y2={TRACK_Y + 3} />
        ))}
        <line className="cpr-used" x1={trackX(DC_AVG_MW)} x2={trackX(DC_AVG_MW)} y1={TRACK_Y - 12} y2={TRACK_Y + 12} />
        <text className="cpr-s" x={W} y={H - 4} textAnchor="end">
          data centres, 55 GW
        </text>
        <text className="cpr-s" x={0} y={H - 4}>
          1 MW
        </text>
      </g>
      <g data-in>
        <circle className="cpr-ring" cx={px} cy={TRACK_Y} r={6} />
        <circle className="cpr-fill-ox" cx={ax} cy={TRACK_Y} r={6} />
        <text className="cpr-v cpr-ox" x={labelX} y={TRACK_Y + 32}>
          {fmtMW(avg)}
        </text>
        <text className="cpr-l cpr-ox" x={labelX + 78} y={TRACK_Y + 31}>
          {fmtMW(peak)} peak
        </text>
      </g>
    </Plate>
  )
}

const FLOOR = [
  { label: '80–95% input', value: '240–360 MW', from: 240, to: 360, main: true },
  { label: '78%, DeepSeek’s mix', value: '370 MW', from: 0, to: 370, main: false },
  { label: '50% input', value: '590 MW', from: 0, to: 590, main: false },
]
const floorX = (mw: number) => (mw / 600) * W

function FloorScene() {
  return (
    <Plate label="Google processes about 1.2 billion tokens a second. At DeepSeek's efficiency that is about 240 to 360 MW if 80 to 95% of tokens are input, 370 MW at DeepSeek's own 78% mix, and about 590 MW at 50% input.">
      <g data-in>
        <text className="cpr-big cpr-ox" x={0} y={40}>
          1.2 billion
        </text>
        <text className="cpr-l" x={0} y={60}>
          tokens a second
        </text>
      </g>
      <g aria-hidden="true">
        {[78, 86, 94].map((y) => (
          <line key={y} className="cpr-stream" x1={0} x2={W} y1={y} y2={y} />
        ))}
      </g>
      {FLOOR.map((r, i) => {
        const y = 136 + i * 56
        return (
          <g key={r.label}>
            <g data-in>
              <text className="cpr-l" x={0} y={y}>
                {r.label}
              </text>
              <text className={`cpr-l cpr-strong${r.main ? ' cpr-ox' : ''}`} x={W} y={y} textAnchor="end">
                {r.value}
              </text>
            </g>
            <rect className="cpr-track" x={0} y={y + 9} width={W} height={10} />
            <rect data-grow="x" className={r.main ? 'cpr-fill-ox' : 'cpr-fill-ink'} x={floorX(r.from)} y={y + 9} width={floorX(r.to - r.from)} height={10} />
          </g>
        )
      })}
      <g data-in>
        <text className="cpr-s" x={0} y={H - 4}>
          0
        </text>
        <text className="cpr-s" x={W} y={H - 4} textAnchor="end">
          600 MW
        </text>
      </g>
    </Plate>
  )
}

const GROW_X0 = 34
const GROW_X1 = 208
const GROW_Y = 104
const growY = (factor: number) => GROW_Y - 104 * Math.log10(factor)

function GrowthScene() {
  const up = growY(5)
  const down = growY(1 / 33)
  return (
    <Plate label="On a log scale over one year: ChatGPT messages grew more than fivefold between July 2024 and July 2025, while the energy of Google's median text prompt fell 33-fold between May 2024 and May 2025.">
      <g data-in>
        <line className="cpr-axis cpr-dash" x1={GROW_X0} x2={GROW_X1} y1={GROW_Y} y2={GROW_Y} />
        <text className="cpr-l" x={0} y={GROW_Y + 4}>
          1×
        </text>
        <text className="cpr-s" x={GROW_X0} y={H - 4} textAnchor="middle">
          2024
        </text>
        <text className="cpr-s" x={GROW_X1} y={H - 4} textAnchor="middle">
          2025
        </text>
      </g>
      <path data-draw pathLength={1} className="cpr-line-ox" d={`M${GROW_X0} ${GROW_Y} L${GROW_X1} ${up}`} />
      <path data-draw pathLength={1} className="cpr-line-ink" d={`M${GROW_X0} ${GROW_Y} L${GROW_X1} ${down}`} />
      <circle data-in className="cpr-node" cx={GROW_X0} cy={GROW_Y} r={4} />
      <g data-in>
        <circle className="cpr-fill-ox" cx={GROW_X1} cy={up} r={5} />
        <text className="cpr-big cpr-ox" x={GROW_X1 + 14} y={up + 12}>
          5×
        </text>
        <text className="cpr-l" x={GROW_X1 + 14} y={up + 31}>
          messages
        </text>
      </g>
      <g data-in>
        <circle className="cpr-fill-ink" cx={GROW_X1} cy={down} r={5} />
        <text className="cpr-big" x={GROW_X1 + 14} y={down - 12}>
          ÷33
        </text>
        <text className="cpr-l" x={GROW_X1 + 14} y={down + 7}>
          energy per prompt
        </text>
      </g>
    </Plate>
  )
}

const SITE_MW = 5
const SITES = [
  { name: 'Finland', value: '0.55 MW', mw: 0.55, main: true },
  { name: 'Germany', value: '6 MW', mw: 6, main: false },
  { name: 'US, by users', value: '24 MW', mw: 24, main: false },
  { name: 'US, by visits', value: '71 MW', mw: 71, main: false },
]

function FinlandScene() {
  return (
    <Plate label="Peak demand in the central case, drawn as 5 MW city sites. Finland needs about 0.55 MW, a ninth of one site. Germany needs about 6 MW. The US needs about 24 MW by users, or about 71 MW counted by chatgpt.com visits.">
      {SITES.map((s, i) => {
        const y = 14 + i * 70
        const n = Math.ceil(s.mw / SITE_MW)
        return (
          <g key={s.name}>
            <g data-in>
              <text className={`cpr-l${s.main ? ' cpr-ox' : ''}`} x={0} y={y}>
                {s.name}
              </text>
              <text className={`cpr-l cpr-strong${s.main ? ' cpr-ox' : ''}`} x={W} y={y} textAnchor="end">
                {s.value}
              </text>
            </g>
            {Array.from({ length: n }, (_, k) => {
              const fill = Math.min(1, s.mw / SITE_MW - k)
              return (
                <g key={k}>
                  <rect data-grow="x" className={s.main ? 'cpr-fill-ox' : 'cpr-fill-ink'} x={k * 21 + 0.5} y={y + 10} width={18 * fill} height={18} />
                  <rect data-in className="cpr-cell" x={k * 21 + 0.5} y={y + 10} width={18} height={18} />
                </g>
              )
            })}
          </g>
        )
      })}
      <g data-in>
        <rect className="cpr-cell" x={0.5} y={H - 17} width={12} height={12} />
        <text className="cpr-s" x={20} y={H - 7}>
          one 5 MW site
        </text>
      </g>
    </Plate>
  )
}

function CitiesScene() {
  const servers = 0.73 * W
  const facility = 0.16 * W
  const ha = (v: number) => (v / 0.25) * W
  return (
    <Plate label="Three comparisons. Cost of ownership of a 1 GW campus: servers and networking about 73%, the facility about 16%. Statutory connection time in Finland: 6 months on the distribution grid, 24 months at high voltage. Land: Finnish campuses take 0.07 to 0.22 hectares per MW, a site inside an existing building takes none.">
      <text data-in className="cpr-k" x={0} y={10}>
        Cost
      </text>
      <rect className="cpr-cell" x={0.5} y={20} width={W - 1} height={20} />
      <rect data-grow="x" className="cpr-fill-ink" x={0} y={20} width={servers} height={20} />
      <rect data-grow="x" className="cpr-fill-ox" x={servers} y={20} width={facility} height={20} />
      <g data-in>
        <text className="cpr-l" x={0} y={58}>
          servers <tspan className="cpr-strong">73%</tspan>
        </text>
        <text className="cpr-l cpr-ox" x={servers + facility} y={58} textAnchor="end">
          facility <tspan className="cpr-strong">16%</tspan>
        </text>
      </g>

      <text data-in className="cpr-k" x={0} y={106}>
        Months to connect
      </text>
      <g data-in>
        <text className="cpr-l cpr-ox" x={0} y={128}>
          distribution grid
        </text>
        <text className="cpr-l cpr-strong cpr-ox" x={W} y={128} textAnchor="end">
          6
        </text>
        <text className="cpr-l" x={0} y={164}>
          high voltage
        </text>
        <text className="cpr-l cpr-strong" x={W} y={164} textAnchor="end">
          24
        </text>
      </g>
      <rect data-grow="x" className="cpr-fill-ox" x={0} y={134} width={(6 / 24) * W} height={8} />
      <rect data-grow="x" className="cpr-fill-ink" x={0} y={170} width={W} height={8} />

      <text data-in className="cpr-k" x={0} y={226}>
        Hectares per MW
      </text>
      <line data-in className="cpr-axis" x1={0} x2={W} y1={268} y2={268} />
      <rect data-grow="x" className="cpr-fill-ink" x={ha(0.07)} y={264} width={ha(0.22 - 0.07)} height={8} />
      <g data-in>
        <circle className="cpr-fill-ox" cx={5} cy={268} r={5} />
        <text className="cpr-l cpr-ox" x={0} y={252}>
          existing building
        </text>
        <text className="cpr-l cpr-strong cpr-ox" x={0} y={292}>
          0
        </text>
        <text className="cpr-l" x={ha(0.145)} y={252} textAnchor="middle">
          campus
        </text>
        <text className="cpr-l cpr-strong" x={ha(0.07)} y={292} textAnchor="middle">
          0.07
        </text>
        <text className="cpr-l cpr-strong" x={ha(0.22)} y={292} textAnchor="middle">
          0.22
        </text>
      </g>
    </Plate>
  )
}

const LADDER_X = 72
const rungY = (v: number) => 292 - 126 * Math.log10(v)
const RUNGS = [
  { name: 'Texas', value: '75 MW', v: 75 },
  { name: 'PJM', value: '50 MW', v: 50 },
  { name: 'Ireland', value: '1 MVA', v: 1 },
]

function RulesScene() {
  return (
    <Plate label="A ladder on a log scale of where a site becomes a large load: 1 MVA in Ireland, 50 MW in PJM, 75 MW in Texas. A 1 to 5 MW city site sits at the bottom, on Ireland's line and far below the other two.">
      <rect data-grow="y" className="cpr-band" x={LADDER_X} y={rungY(5)} width={W - LADDER_X} height={rungY(1) - rungY(5)} />
      <path data-draw pathLength={1} className="cpr-rail" d={`M${LADDER_X} 300 V24`} />
      <path data-draw pathLength={1} className="cpr-rail" d={`M${W - 1} 300 V24`} />
      {RUNGS.map((r) => (
        <g key={r.name}>
          <path data-draw pathLength={1} className="cpr-rung" d={`M${LADDER_X} ${rungY(r.v)} H${W - 1}`} />
          <g data-in>
            <text className="cpr-l cpr-strong" x={LADDER_X - 10} y={rungY(r.v) + 4} textAnchor="end">
              {r.value}
            </text>
            <text className="cpr-l" x={W - 10} y={rungY(r.v) - 6} textAnchor="end">
              {r.name}
            </text>
          </g>
        </g>
      ))}
      <g data-in>
        <line className="cpr-line-ox cpr-dash" x1={LADDER_X} x2={W - 1} y1={rungY(5)} y2={rungY(5)} />
        <text className="cpr-l cpr-strong cpr-ox" x={LADDER_X - 10} y={rungY(5) + 4} textAnchor="end">
          5 MW
        </text>
        <text className="cpr-v cpr-ox" x={LADDER_X + 14} y={(rungY(5) + rungY(1)) / 2 + 6}>
          city site
        </text>
      </g>
    </Plate>
  )
}

const WH_X = 78
const whY = (wh: number) => 292 - 135 * Math.log10(wh / 0.2)
const WH = [
  { wh: 0.24, source: 'Google median', mw: '' },
  { wh: 0.34, source: 'Altman', mw: '140 MW', main: true },
  { wh: 1, source: 'my high case', mw: '' },
  { wh: 2.33, source: 'GPT-5, minimal', mw: '≈1 GW' },
  { wh: 17.15, source: 'GPT-5, high reasoning', mw: '≈7 GW' },
]

function UnknownScene() {
  return (
    <Plate label="Energy per message on a log scale, the estimate's dominant uncertainty. Google's median is 0.24 Wh, Altman's average 0.34 Wh, the high case 1.0 Wh, and modelled GPT-5 prompts 2.33 Wh with minimal reasoning and 17.15 Wh with high reasoning. With every other input at central those give 140 MW at 0.34 Wh, about 1 GW at 2.33 Wh and about 7 GW at 17.15 Wh.">
      <text data-in className="cpr-k" x={0} y={10}>
        Wh a message
      </text>
      <path data-draw pathLength={1} className="cpr-span" d={`M${WH_X} ${whY(0.24)} V${whY(17.15)}`} />
      {WH.map((p) => (
        <g key={p.wh} data-in>
          <circle className={p.main ? 'cpr-fill-ox' : 'cpr-node'} cx={WH_X} cy={whY(p.wh)} r={4} />
          <text className={`cpr-l cpr-strong${p.main ? ' cpr-ox' : ''}`} x={WH_X - 12} y={whY(p.wh) + 4} textAnchor="end">
            {p.wh === 1 ? '1.0' : p.wh}
          </text>
          <text className="cpr-l" x={WH_X + 12} y={whY(p.wh) + 4}>
            {p.source}
          </text>
          <text className={`cpr-v${p.main ? ' cpr-ox' : ''}`} x={W} y={whY(p.wh) + 6} textAnchor="end">
            {p.mw}
          </text>
        </g>
      ))}
    </Plate>
  )
}

const SCENES: { title: string; draw: () => ReactNode }[] = [
  { title: 'The number', draw: NumberScene },
  { title: 'The sum', draw: ChainScene },
  { title: 'A floor', draw: FloorScene },
  { title: 'Growth', draw: GrowthScene },
  { title: 'Finland', draw: FinlandScene },
  { title: 'Why cities', draw: CitiesScene },
  { title: 'The rules', draw: RulesScene },
  { title: 'The unknown', draw: UnknownScene },
]

// The last two sections, the caveats and the call for data, share the uncertainty plate.
const sceneOf = (section: number) => Math.min(Math.max(section, 0), SCENES.length - 1)

function sectionInView() {
  const line = window.innerHeight * 0.6
  let seen = 0
  document.querySelectorAll('.pa-body h2[id]').forEach((el, i) => {
    if (el.getBoundingClientRect().top < line) seen = i
  })
  return sceneOf(seen)
}

function RailFigure() {
  const [reduced] = useState(prefersReducedMotion)
  const [active, setActive] = useState(sectionInView)
  const [shown, setShown] = useState(active)
  const stage = useRef<HTMLDivElement>(null)
  const moved = useRef(false)
  const scene = reduced ? active : shown
  const Scene = SCENES[scene].draw

  useEffect(() => {
    const sync = () => setActive(sectionInView())
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  useGSAP(
    () => {
      if (reduced || active === shown) return
      moved.current = true
      gsap.to(stage.current, { opacity: 0.25, duration: 0.16, ease: 'power1.in', overwrite: true, onComplete: () => setShown(active) })
      // GSAP runs on requestAnimationFrame, which a background tab or a
      // headless capture starves. The timers keep a plate from staying
      // half-drawn or hidden when no frames arrive.
      const settle = window.setTimeout(() => setShown(active), 400)
      return () => window.clearTimeout(settle)
    },
    { dependencies: [active, shown, reduced] },
  )

  useGSAP(
    () => {
      // The plate in view at load is drawn complete; only scroll changes animate.
      if (reduced || !moved.current) return
      gsap.killTweensOf(stage.current)
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      const settle = window.setTimeout(() => tl.progress(1), 1400)
      tl.eventCallback('onComplete', () => window.clearTimeout(settle))
      tl.set(stage.current, { opacity: 1 })
      tl.from('[data-grow="xy"]', { scale: 0, transformOrigin: '0% 100%', duration: 0.8, stagger: 0.12 }, 0)
      tl.from('[data-grow="x"]', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.7, stagger: 0.035 }, 0.1)
      tl.from('[data-grow="y"]', { scaleY: 0, transformOrigin: '50% 100%', duration: 0.7 }, 0.1)
      tl.fromTo('[data-draw]', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.1, ease: 'power2.inOut' }, 0)
      // Labels start dimmed, never hidden, so a plate caught mid-build still reads.
      tl.from('[data-in]', { opacity: 0.35, y: 6, duration: 0.45, stagger: 0.04 }, 0)
      return () => window.clearTimeout(settle)
    },
    { dependencies: [shown, reduced], scope: stage, revertOnUpdate: true },
  )

  return (
    <figure className="cpr">
      <div ref={stage}>
        <p className="pa-fence-head">
          <span className="cpr-n">{String(scene + 1).padStart(2, '0')}</span>
          {SCENES[scene].title}
        </p>
        <Scene key={scene} />
      </div>
      <div className="cpr-ticks" aria-hidden="true">
        {SCENES.map((s, i) => (
          <span key={s.title} data-on={i === active || undefined} />
        ))}
      </div>
    </figure>
  )
}

const DOT_COLS = 40
const DOT_ROWS = 10
const CHAT_DOT = 6 * DOT_COLS + 11

/** The page-head figure: 400 dots for data-centre electricity, one of them chat (140 MW of 55 GW is 0.25%, 1 in 400). */
export function ChatPowerDots() {
  return (
    <figure className="pa-runway">
      <svg
        className="cpr-plate"
        viewBox="0 0 400 128"
        role="img"
        aria-label="400 dots stand for the electricity data centres used in 2025, about 55 GW on average. One dot is consumer chat, about 140 MW, or 0.25%."
      >
        {Array.from({ length: DOT_COLS * DOT_ROWS }, (_, i) => (
          <circle key={i} className={i === CHAT_DOT ? 'cpr-fill-ox' : 'cpr-dot'} cx={(i % DOT_COLS) * 10 + 5} cy={Math.floor(i / DOT_COLS) * 10 + 5} r={i === CHAT_DOT ? 3.6 : 2.4} />
        ))}
        <circle className="cpr-ripple" aria-hidden="true" cx={(CHAT_DOT % DOT_COLS) * 10 + 5} cy={Math.floor(CHAT_DOT / DOT_COLS) * 10 + 5} r={3.6} />
        <g>
          <circle className="cpr-fill-ox" cx={5} cy={120} r={3.6} />
          <text className="cpr-l cpr-ox" x={15} y={124}>
            consumer chat, 140 MW
          </text>
          <text className="cpr-l" x={400} y={124} textAnchor="end">
            all data centres, 55 GW
          </text>
        </g>
      </svg>
    </figure>
  )
}

/** One drawn plate per section of the chatbot-power post, switched by the section under the reading line. */
export function ChatPowerRail() {
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
