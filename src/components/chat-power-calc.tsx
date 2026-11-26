import { useId } from 'react'
import { DC_AVG_MW, PRESETS, fmtMW, fmtWh, power, setInputs, useInputs, type Inputs } from '../lib/chat-power'

const SITE_MW = 5

// Energy per message spans two orders of magnitude, so its slider is logarithmic.
const WH_MIN = Math.log10(0.1)
const WH_MAX = Math.log10(40)

function Slider({ label, value, display, min, max, step, onChange }: { label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const id = useId()
  return (
    <div className="cpc-row">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <output htmlFor={id}>{display}</output>
    </div>
  )
}

export function ChatPowerCalc() {
  const v = useInputs()
  const set = (k: keyof Inputs) => (x: number) => setInputs({ ...v, [k]: x })
  const { avg, peak } = power(v)

  return (
    <figure className="cpc">
      <div className="cpc-presets" role="group" aria-label="Presets">
        {PRESETS.map((p) => (
          <button key={p.name} type="button" aria-pressed={JSON.stringify(p.v) === JSON.stringify(v)} onClick={() => setInputs(p.v)}>
            {p.name}
          </button>
        ))}
      </div>

      <Slider label="ChatGPT weekly users" value={v.wau} display={`${v.wau}M`} min={300} max={2000} step={50} onChange={set('wau')} />
      <Slider label="Messages per user per day" value={v.msgs} display={v.msgs.toFixed(2)} min={1} max={25} step={0.01} onChange={set('msgs')} />
      <Slider
        label="Energy per message"
        value={Math.log10(v.wh)}
        display={fmtWh(v.wh)}
        min={WH_MIN}
        max={WH_MAX}
        step={0.01}
        onChange={(x) => set('wh')(Number((10 ** x).toPrecision(3)))}
      />
      <Slider label="All assistants ÷ ChatGPT" value={v.mult} display={`${v.mult.toFixed(2)}×`} min={1} max={4} step={0.05} onChange={set('mult')} />
      <Slider label="Peak ÷ mean" value={v.peak} display={`${v.peak.toFixed(2)}×`} min={1.2} max={4} step={0.01} onChange={set('peak')} />

      <div className="cpc-out" aria-live="polite">
        <p>
          <span className="cpc-big">{fmtMW(avg)}</span> average
        </p>
        <p>
          <span className="cpc-big">{fmtMW(peak)}</span> at peak
        </p>
        <p>
          <span className="cpc-big">{((avg / DC_AVG_MW) * 100).toFixed(2)}%</span> of 2025 data-centre electricity
        </p>
        <p>
          <span className="cpc-big">{Math.ceil(peak / SITE_MW).toLocaleString()}</span> city sites of {SITE_MW} MW at peak
        </p>
      </div>
      <figcaption>Facility power. The presets are the post's cases; the GPT-5 rows use Jegham et al.'s modelled energy per prompt with the other inputs at central.</figcaption>
    </figure>
  )
}

export const CHAT_POWER_FIGURES = { '/figures/chat-power-calculator': <ChatPowerCalc /> }
