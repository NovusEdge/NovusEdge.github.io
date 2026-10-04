import { describe, expect, it } from 'vitest'
import me from '../../assets/sprites/me.json'
import stoat from '../../assets/sprites/stoat.json'
import footerJson from '../../assets/sprites/footer.json'
import bubbleJson from '../../assets/sprites/bubble.json'
import { STOAT_SIZE } from './stoat-sprite'
import { clipSize, paletteFor, resolveClip, validateSprite, type Sprite } from './sprite'

const tiny: Sprite = {
  w: 2,
  h: 1,
  palette: { A: '#000000', B: '#ffffff' },
  palettes: { inv: { A: '#ffffff', B: '#000000' } },
  animations: { idle: { loop: true, frames: [{ ms: 100, px: ['AB'] }] } },
}

describe('sprite data', () => {
  it.each([
    ['me', me],
    ['stoat', stoat],
  ])('%s.json is internally consistent', (_, s) => {
    expect(validateSprite(s as Sprite)).toEqual([])
  })

  it('marks typing frames on the desk and keeps the stoat slot', () => {
    const desk = (me as unknown as Sprite).animations.desk
    expect(desk.frames.some((f) => f.typing)).toBe(true)
    expect(desk.frames.some((f) => !f.typing)).toBe(true)
    expect(desk.stoatSlot).toHaveLength(4)
  })

  it('ships the stoat clips in both coats', () => {
    const s = stoat as Sprite
    expect(Object.keys(s.animations).sort()).toEqual([
      'bound',
      'chase_tail',
      'confused',
      'curl',
      'groom',
      'happy',
      'peek',
      'periscope',
      'pounce',
      'sit',
      'sit_down',
      'sleep',
      'startle',
      'wake',
    ])
    expect(Object.keys(s.palettes!).sort()).toEqual(['summer', 'winter'])
  })

  it('reserves the stoat box at the size of the sprite', () => {
    expect(STOAT_SIZE).toEqual({ w: stoat.w, h: stoat.h })
  })

  it('has the desk transitions for pixel-me', () => {
    const a = (me as unknown as Sprite).animations
    for (const n of ['desk_empty', 'stand_up', 'sit_down']) expect(a[n]).toMatchObject({ w: 99, h: 57 })
    expect(a.stand_up.standAt).toHaveLength(2)
  })
})

describe('footer sprites', () => {
  const footer = footerJson as unknown as Sprite
  const bubble = bubbleJson as unknown as Sprite

  it('validate', () => {
    expect(validateSprite(footer)).toEqual([])
    expect(validateSprite(bubble)).toEqual([])
  })

  it('carry the glyph anchor and the bob on every levitate frame', () => {
    expect(footer.anchor).toEqual([24, 7])
    expect(footer.animations.levitate.loop).toBe(true)
    for (const f of footer.animations.levitate.frames) expect(typeof f.g).toBe('number')
  })

  it('flare before emit, once each, in the burst', () => {
    const evs = footer.animations.levitate_burst.frames.map((f) => f.ev ?? null).filter(Boolean)
    expect(evs).toEqual(['flare', 'emit'])
    expect(footer.animations.levitate_burst.loop).toBe(false)
  })

  it('has the nine bubble clips, looping only the held ones', () => {
    expect(Object.keys(bubble.animations).sort()).toEqual(
      ['focus', 'focus_in', 'focus_out', 'grow', 'idle', 'pop', 'recede', 'recede_in', 'recede_out'],
    )
    const loops = Object.entries(bubble.animations).filter(([, c]) => c.loop).map(([k]) => k).sort()
    expect(loops).toEqual(['focus', 'idle', 'recede'])
  })
})

describe('validateSprite', () => {
  it('reports a row of the wrong width', () => {
    const bad = { ...tiny, animations: { idle: { loop: true, frames: [{ ms: 100, px: ['ABA'] }] } } }
    expect(validateSprite(bad)[0]).toMatch(/idle\[0\] row 0/)
  })

  it('reports a letter missing from the palette', () => {
    const bad = { ...tiny, animations: { idle: { loop: true, frames: [{ ms: 100, px: ['AZ'] }] } } }
    expect(validateSprite(bad)[0]).toMatch(/letter Z/)
  })

  it('reports a variant palette missing a base letter', () => {
    const bad = { ...tiny, palettes: { inv: { A: '#ffffff' } } }
    expect(validateSprite(bad)[0]).toMatch(/inv lacks B/)
  })

  it('uses a clip-level size when the clip has one', () => {
    const s = { ...tiny, animations: { wide: { loop: true, w: 3, h: 1, frames: [{ ms: 100, px: ['ABA'] }] } } }
    expect(validateSprite(s)).toEqual([])
    expect(clipSize(s, s.animations.wide)).toEqual({ w: 3, h: 1 })
  })
})

describe('paletteFor', () => {
  it('overrides the base with the variant', () => {
    expect(paletteFor(tiny, 'inv').A).toBe('#ffffff')
  })

  it('falls back to the base for an unknown variant', () => {
    expect(paletteFor(tiny, 'nope').A).toBe('#000000')
  })
})

describe('resolveClip', () => {
  it('returns the named clip when it exists', () => {
    expect(resolveClip(tiny, 'idle')).toMatchObject({ name: 'idle', fallback: false })
  })

  it('falls back to idle for a clip not drawn yet', () => {
    expect(resolveClip(tiny, 'groom')).toMatchObject({ name: 'idle', fallback: true })
  })

  it('falls back to the first clip when the sprite has no idle', () => {
    const s: Sprite = { w: 1, h: 1, palette: { A: '#000' }, animations: { bound: { loop: true, frames: [{ ms: 50, px: ['A'] }] } } }
    expect(resolveClip(s, 'sit')).toMatchObject({ name: 'bound', fallback: true })
  })
})
