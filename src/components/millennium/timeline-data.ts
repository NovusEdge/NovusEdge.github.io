export type Tone = 'ok' | 'wait' | 'warn'
export type Month = 'jul' | 'aug' | 'sep' | 'oct' | 'nov'

export type Result = {
  when: string
  month: Month
  // *asterisks* mark emphasis, as in the post's markdown
  what: string
  who: string
  tone: Tone
  status: string
}

// When a verdict lands, change `tone` and `status` on its row here. Nothing else reads them.
export const RESULTS: Result[] = [
  { when: 'Jul', month: 'jul', what: 'Explicit 3D counterexample to the Jacobian conjecture', who: 'Claude with Alpöge and Akhil Mathew', tone: 'ok', status: 'Checked' },
  { when: 'Jul', month: 'jul', what: "Crouzeix's conjecture proved", who: 'GPT-5.6 Sol', tone: 'ok', status: 'Reviewed' },
  { when: 'Aug', month: 'aug', what: 'Ehrhart volume conjecture, upper bound', who: 'GPT-6 Astra', tone: 'ok', status: 'Lean' },
  { when: 'Aug', month: 'aug', what: 'Share of zeta zeros proven on the critical line goes from 41.6% to 67.25%', who: 'Claude, Anthropic', tone: 'ok', status: 'Reviewed' },
  { when: 'Sep', month: 'sep', what: 'Finite-time blowup for *forced* Navier–Stokes', who: 'OpenAI internal model', tone: 'warn', status: 'Disputed' },
  { when: '6 Oct', month: 'oct', what: "722 papers dumped at once, one claiming Landau–Siegel zeros don't exist", who: 'OpenAI internal model', tone: 'warn', status: 'Mixed' },
  { when: '16 Oct', month: 'oct', what: 'Exponential Time Hypothesis is false', who: 'OpenAI and Anthropic, independently', tone: 'wait', status: 'Under review' },
  { when: '20 Nov', month: 'nov', what: 'Unforced Euler and Navier–Stokes blowup', who: 'Alpöge, Buckmaster (and Coiculescu for Euler), heavy AI use', tone: 'wait', status: 'Pending' },
  { when: '20 Nov', month: 'nov', what: 'Riemann Hypothesis and GRH', who: 'Alpöge with Claude', tone: 'wait', status: 'Pending' },
]

export const STATUS_KEY: Record<Tone, string> = {
  ok: 'checked by people or Lean',
  wait: 'waiting on a check',
  warn: 'disputed or partly walked back',
}

export const MONTH_KANJI: Record<Month, string> = { jul: '七月', aug: '八月', sep: '九月', oct: '十月', nov: '十一月' }

// Trajectories each result adds to the attractor. The curve is drawn, not measured: one thread
// in July, the full figure on 20 November.
export const TRACES = [1, 1, 2, 3, 4, 6, 8, 12, 16] as const

export const tracesThrough = (count: number) => TRACES.slice(0, count).reduce((n, t) => n + t, 0)

const TIMELINE = /^\{\{timeline\}\}[ \t]*$/m
const STILL = /^## Is it real[ \t]*$/m

// before: up to the timeline placeholder. middle: the three problems. tail: from "Is it real" on,
// where the attractor is held still. A post missing either marker keeps all its text in `before`
// or `middle` rather than dropping any.
export function splitPost(content: string): { before: string; middle: string; tail: string; hasTimeline: boolean } {
  const t = TIMELINE.exec(content)
  const before = t ? content.slice(0, t.index) : content
  const rest = t ? content.slice(t.index + t[0].length) : ''
  const s = STILL.exec(rest)
  return {
    before: before.trim(),
    middle: (s ? rest.slice(0, s.index) : rest).trim(),
    tail: s ? rest.slice(s.index).trim() : '',
    hasTimeline: !!t,
  }
}
