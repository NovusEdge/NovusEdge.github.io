import type { Persona } from './persona'

export type Side = 'left' | 'right'
export type CornerMode = 'swap' | 'lift'

// Both /portfolio options ship until the client picks one at the browser check;
// the other branch is deleted then.
export const CORNER_MODE: CornerMode = 'swap'

// Tailwind needs literal class names, so components hard-code these heights;
// the test ties them to the desk clip.
export const DESK_LIFT_PX = { wide: 138, narrow: 81 }

export const deskSide = (p: Persona): Side => (p === 'desk-right' ? 'right' : 'left')

export const pawSide = (p: Persona, mode: CornerMode = CORNER_MODE): Side => (p === 'desk-right' && mode === 'swap' ? 'right' : 'left')

export const panelSide = (p: Persona, friendsOn: boolean, mode: CornerMode = CORNER_MODE): Side => (friendsOn ? deskSide(p) : pawSide(p, mode))

export function a11yCorner(p: Persona, friendsOn: boolean, mode: CornerMode = CORNER_MODE): { side: Side; lifted: boolean } {
  if (p !== 'desk-right') return { side: 'right', lifted: false }
  if (mode === 'swap') return { side: 'left', lifted: false }
  return { side: 'right', lifted: friendsOn }
}
