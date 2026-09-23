export const OPENJEV_SLUG = 'fine-tuning-openjev-on-62695-ab-tests'
export const REPO_URL = 'https://huggingface.co/NovusEdge/vera-deberta-v3-large'
export const DOI = '10.57967/hf/10573'
export const DOI_URL = `https://doi.org/${DOI}`

// Pairwise accuracy on held-out Upworthy pairs. Chance is 0.5.
export const AXIS = { min: 0.4, max: 0.85, chance: 0.5 } as const

export type Mark = 'ours' | 'ink' | 'struck' | 'tick' | 'empty'

type Row = { label?: string; labelKey?: string; value: number | null; display?: string; displayKey?: string; mark: Mark }

export const ROWS = {
  claim: { label: 'ModernBERT, 2015 tail', value: 0.704, display: '0.704', mark: 'ours' },
  withdrawn: { labelKey: 'blog.openjev.withdrawn', value: 0.704, display: '0.704', mark: 'struck' },
  holdout: { label: 'ModernBERT, holdout', value: 0.637, display: '0.637', mark: 'ours' },
  exploratory: { label: 'ModernBERT, exploratory', value: 0.624, display: '0.624', mark: 'ours' },
  phase0: { label: 'MSE', value: 0.637, display: '0.637', mark: 'ours' },
  moreData: { label: 'MSE, more data', value: 0.724, display: '0.724', mark: 'ours' },
  rank: { label: 'Bradley-Terry', value: 0.775, display: '0.775', mark: 'ours' },
  rankMore: { label: 'Bradley-Terry, more data', value: 0.787, display: '0.787', mark: 'ours' },
  deberta: { label: 'VERA, best-vs-worst', value: 0.812, display: '0.812', mark: 'ours' },
  allPairs: { label: 'VERA, every pair', value: 0.689, display: '0.689', mark: 'ours' },
  sota: { label: 'Linguistic features', value: 0.544, display: '0.544', mark: 'ink' },
  gemini: { label: 'Gemini 3.1 Pro', value: 0.751, display: '0.751', mark: 'ink' },
  humans: { labelKey: 'blog.openjev.humans', value: 0.5, displayKey: 'blog.openjev.nearChance', mark: 'tick' },
  llama: { label: 'Llama-3-8B LoRA', value: 0.469, display: '0.469', mark: 'ink' },
  email: { labelKey: 'blog.openjev.email', value: null, displayKey: 'blog.openjev.noData', mark: 'empty' },
} satisfies Record<string, Row>

export type RowId = keyof typeof ROWS
export const ROW_IDS = Object.keys(ROWS) as RowId[]

export type State = { rows: RowId[]; bands?: true; loss?: true; big?: true }

const FINAL: RowId[] = ['deberta', 'gemini', 'allPairs', 'sota', 'humans']

export const STATES: State[] = [
  { rows: ['claim', 'sota', 'humans'] },
  { rows: ['withdrawn', 'holdout', 'exploratory', 'sota', 'humans'] },
  { rows: [], bands: true },
  { rows: ['withdrawn', 'holdout', 'sota', 'humans'] },
  { rows: ['deberta', 'rankMore', 'rank', 'moreData', 'phase0', 'sota', 'humans'], loss: true },
  { rows: FINAL, big: true },
  { rows: [...FINAL, 'email'], big: true },
]

// Reduced motion and small screens get the final board and the takeaway caption.
export const STATIC_STATE = 6
export const STATIC_CAPTION = 5

// Share of each split's arms dated before 2015. All three span Jan 2013 to Apr 2015.
export const BANDS = [
  { label: 'confirmatory', share: 0.835, display: '83.5%' },
  { label: 'holdout', share: 0.828, display: '82.8%' },
  { label: 'exploratory', share: 0.838, display: '83.8%' },
] as const

// The post gives four checkpoints for the live run and no step positions.
export const LOSS = {
  dead: Math.log(2),
  deadDisplay: '-log(0.5)',
  live: [0.709, 0.682, 0.62, 0.36],
  liveDisplay: ['0.709', '0.682', '0.620', '0.360'],
} as const

export const BIG = { display: '90.3%' } as const

// Ids are headingId() of the post's ## headings. Renaming a heading drops its
// state, so openjev-data.test.ts reads them back from the post.
export const STATE_HEADINGS: [id: string, state: number][] = [
  ['data-and-method', 0],
  ['cross-split-evaluation', 1],
  ['split-structure', 2],
  ['leakage-and-label-noise', 3],
  ['ablations', 4],
  ['calibration-and-realised-lift', 5],
  ['domain-transfer', 6],
]

export function stateAt(tops: Map<string, number>, line: number): number {
  let state = 0
  for (const [id, k] of STATE_HEADINGS) {
    const top = tops.get(id)
    if (top !== undefined && top <= line) state = k
  }
  return state
}

export const ROW_H = 28
export const ROWS_TOP = 30

export function rowLayout(k: number): Record<RowId, { shown: boolean; y: number; frac: number }> {
  const rows = STATES[k].rows
  const out = {} as Record<RowId, { shown: boolean; y: number; frac: number }>
  for (const id of ROW_IDS) {
    const row: Row = ROWS[id]
    const i = rows.indexOf(id)
    const frac =
      row.value === null || row.mark === 'tick'
        ? 0
        : Math.min(1, Math.max(0, (row.value - AXIS.min) / (AXIS.max - AXIS.min)))
    out[id] = { shown: i >= 0, y: ROWS_TOP + Math.max(i, 0) * ROW_H, frac }
  }
  return out
}

export type RowOp = { opacity: 0 } | { opacity: 1; y: number; frac: number; snap: boolean }

/**
 * Targets for a transition into state k, judged against what is on screen now
 * and not against the previous state: a transition cut short by the next one
 * leaves rows the previous state never showed. A row that is not visible yet
 * snaps to its slot before it fades in, so it never slides in from elsewhere.
 */
export function transitionOps(k: number, visible: (id: RowId) => boolean): Record<RowId, RowOp> {
  const lay = rowLayout(k)
  const out = {} as Record<RowId, RowOp>
  for (const id of ROW_IDS) {
    const { shown, y, frac } = lay[id]
    out[id] = shown ? { opacity: 1, y, frac, snap: !visible(id) } : { opacity: 0 }
  }
  return out
}
