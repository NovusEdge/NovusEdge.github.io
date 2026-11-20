import { RESULTS, type Tone } from './timeline-data'

export const FIELD_MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'] as const
export type FieldMonth = (typeof FIELD_MONTHS)[number]

export type PrizeId = 'poincare' | 'rh' | 'ns' | 'pnp' | 'hodge' | 'ym' | 'bsd'

// The seven Clay Millennium Prize problems. `claimed` ones light when their result does.
// `short` is the name on a phone, where seven labels share one row.
export const PRIZES: { id: PrizeId; name: string; short?: string; state: 'solved' | 'claimed' | 'open'; note: string }[] = [
  { id: 'poincare', name: 'Poincaré', state: 'solved', note: 'Solved by Perelman, 2003' },
  { id: 'rh', name: 'Riemann', state: 'claimed', note: 'Claimed 20 Nov, pending' },
  { id: 'ns', name: 'Navier–Stokes', state: 'claimed', note: 'Claimed 20 Nov, pending' },
  { id: 'pnp', name: 'P vs NP', state: 'open', note: 'Open' },
  { id: 'hodge', name: 'Hodge', state: 'open', note: 'Open' },
  { id: 'ym', name: 'Yang–Mills', state: 'open', note: 'Open' },
  { id: 'bsd', name: 'Birch–Swinnerton-Dyer', short: 'BSD', state: 'open', note: 'Open' },
]

export type FieldResult = { month: FieldMonth; when: string; what: string; who: string; tone?: Tone; prize?: PrizeId; both?: boolean }

const row = (i: number, month: FieldMonth, extra: Partial<FieldResult> = {}): FieldResult => {
  const r = RESULTS[i]
  // Only an open or contested status is coloured; the rest are simply on the list.
  return { month, when: r.when, what: r.what.replaceAll('*', ''), who: r.who, tone: r.tone === 'ok' ? undefined : r.tone, ...extra }
}

// 2026 results in date order: the timeline's nine rows plus the other entries from the Wikipedia
// list of AI maths discoveries. Entries with a single unchecked source are left out.
export const FIELD: FieldResult[] = [
  { month: 'Feb', when: 'Feb', what: 'Four open Erdős problems proved, out of 700 surveyed', who: 'Gemini, DeepMind' },
  { month: 'Mar', when: 'Mar', what: 'Viazovska’s sphere packing proofs (dimensions 8 and 24) formalized in Lean', who: 'Math Inc. Gauss' },
  { month: 'May', when: 'May', what: 'Nine Erdős problems and 44 of 492 OEIS conjectures proved', who: 'DeepMind' },
  { month: 'May', when: 'May', what: 'Erdős unit distance conjecture disproved', who: 'OpenAI internal model' },
  { month: 'May', when: 'May', what: 'Borsuk counterexample in dimension 63', who: 'GPT-5.5 Pro' },
  { month: 'Jul', when: 'Jul', what: 'Cycle double cover conjecture proved', who: 'GPT-5.6 Sol Ultra' },
  row(0, 'Jul'),
  row(1, 'Jul'),
  row(2, 'Aug'),
  { month: 'Aug', when: 'Aug', what: 'Sendov’s conjecture proved, with Lean', who: 'GPT-5.6 Pro' },
  row(3, 'Aug'),
  { month: 'Aug', when: 'Aug', what: 'Elliptic curves of rank at least 30 and 31 (the record was 29)', who: 'Claude with Alpöge and Ava Howell' },
  { month: 'Aug', when: 'Aug', what: 'Erdős Problem 4, with Lean', who: 'GPT-5.6 Sol' },
  { month: 'Sep', when: 'Sep', what: 'Köthe conjecture disproved, with Lean', who: 'Epoch AI with GPT-6 Astra' },
  row(4, 'Sep'),
  row(5, 'Oct'),
  row(6, 'Oct', { both: true }),
  row(7, 'Nov', { prize: 'ns' }),
  row(8, 'Nov', { prize: 'rh' }),
]

// Tallest month, which sets how many sockets a column of the field has.
export const FIELD_ROWS = Math.max(...FIELD_MONTHS.map((m) => FIELD.filter((r) => r.month === m).length))
