export type FooterState = 'idle' | 'bursting' | 'open' | 'closing'
export type FooterEvent = 'toggle' | 'dismiss' | 'reset' | 'burstEnd' | 'closeEnd'

export function footerNext(s: FooterState, e: FooterEvent): FooterState {
  if (e === 'reset') return 'idle'
  switch (s) {
    case 'idle':
      return e === 'toggle' ? 'bursting' : 'idle'
    case 'bursting':
      return e === 'toggle' || e === 'dismiss' ? 'closing' : e === 'burstEnd' ? 'open' : s
    case 'open':
      return e === 'toggle' || e === 'dismiss' ? 'closing' : s
    case 'closing':
      return e === 'toggle' ? 'bursting' : e === 'closeEnd' ? 'idle' : s
  }
}

// A keyboard-activated button click has detail 0; pointers and most assistive tech report 1+.
export const activation = (detail: number, reduced: boolean): 'card' | 'burst' => (reduced || detail === 0 ? 'card' : 'burst')

export type BubbleMode = 'normal' | 'focus' | 'recede'

export const modeFor = (i: number, focused: number | null): BubbleMode =>
  focused === null ? 'normal' : i === focused ? 'focus' : 'recede'

const LEAVE: Record<BubbleMode, string | null> = { normal: null, focus: 'focus_out', recede: 'recede_out' }
const ENTER: Record<BubbleMode, [string | null, string]> = {
  normal: [null, 'idle'],
  focus: ['focus_in', 'focus'],
  recede: ['recede_in', 'recede'],
}

// Size changes are drawn frames, so a mode change plays its clips in order and holds the last.
export function bubbleQueue(from: BubbleMode, to: BubbleMode): string[] {
  if (from === to) return []
  return [LEAVE[from], ENTER[to][0], ENTER[to][1]].filter((c): c is string => c !== null)
}
