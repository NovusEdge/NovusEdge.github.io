import { describe, expect, it } from 'vitest'
import meJson from '../../assets/sprites/me.json'
import { a11yCorner, DESK_LIFT_PX, deskSide, panelSide, pawSide } from './corners'

describe('corners', () => {
  it('puts the desk on the right only on desk-right routes', () => {
    expect(deskSide('desk')).toBe('left')
    expect(deskSide('thinking')).toBe('left')
    expect(deskSide('scientist')).toBe('left')
    expect(deskSide('desk-right')).toBe('right')
  })

  it('swap: the accessibility button and paw trade corners on desk-right', () => {
    expect(a11yCorner('desk-right', true, 'swap')).toEqual({ side: 'left', lifted: false })
    expect(a11yCorner('desk-right', false, 'swap')).toEqual({ side: 'left', lifted: false })
    expect(pawSide('desk-right', 'swap')).toBe('right')
    expect(panelSide('desk-right', true, 'swap')).toBe('right')
    expect(panelSide('desk-right', false, 'swap')).toBe('right')
  })

  it('lift: the button rises above the desk only while the desk is there', () => {
    expect(a11yCorner('desk-right', true, 'lift')).toEqual({ side: 'right', lifted: true })
    expect(a11yCorner('desk-right', false, 'lift')).toEqual({ side: 'right', lifted: false })
    expect(pawSide('desk-right', 'lift')).toBe('left')
    expect(panelSide('desk-right', true, 'lift')).toBe('right')
    expect(panelSide('desk-right', false, 'lift')).toBe('left')
  })

  it('every other persona keeps the phase 1 corners in both modes', () => {
    for (const mode of ['swap', 'lift'] as const) {
      for (const p of ['desk', 'thinking', 'scientist'] as const) {
        expect(a11yCorner(p, true, mode)).toEqual({ side: 'right', lifted: false })
        expect(pawSide(p, mode)).toBe('left')
        expect(panelSide(p, true, mode)).toBe('left')
      }
    }
  })

  it('lifts by the desk height plus the 24 px gap at both desk scales', () => {
    const h = meJson.animations.desk.h
    expect(DESK_LIFT_PX).toEqual({ wide: h * 2 + 24, narrow: h + 24 })
  })
})
