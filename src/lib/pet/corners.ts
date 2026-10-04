import type { Persona } from './persona'

export type Side = 'left' | 'right'

// The pixel-me desk, the paw and the pet panel share a side; the accessibility
// button takes the opposite one so the two never overlap.
export const deskSide = (p: Persona): Side => (p === 'desk-right' ? 'right' : 'left')

export const a11ySide = (p: Persona): Side => (p === 'desk-right' ? 'left' : 'right')
