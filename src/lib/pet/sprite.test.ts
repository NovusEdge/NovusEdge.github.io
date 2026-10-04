import { describe, expect, it } from 'vitest'
import cat from '../../assets/sprites/cat.json'
import me from '../../assets/sprites/me.json'
import stoat from '../../assets/sprites/stoat.json'
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
    ['cat', cat],
    ['me', me],
    ['stoat', stoat],
  ])('%s.json is internally consistent', (_, s) => {
    expect(validateSprite(s as Sprite)).toEqual([])
  })

  it('ships the approved cat clips and all four coats', () => {
    const s = cat as Sprite
    expect(Object.keys(s.animations)).toEqual(expect.arrayContaining(['idle', 'walk']))
    expect(Object.keys(s.palettes!).sort()).toEqual(['black', 'orange', 'shiny', 'tuxedo'])
    expect(s.animations.walk.travel).toBe(1)
  })

  it('marks typing frames on the desk and keeps the cat slot', () => {
    const desk = (me as unknown as Sprite).animations.desk
    expect(desk.frames.some((f) => f.typing)).toBe(true)
    expect(desk.frames.some((f) => !f.typing)).toBe(true)
    expect(desk.catSlot).toHaveLength(4)
  })

  it('ships the stoat clips in both coats', () => {
    const s = stoat as Sprite
    expect(Object.keys(s.animations).sort()).toEqual([
      'bound',
      'curl',
      'groom',
      'peek',
      'periscope',
      'sit',
      'sit_down',
      'sleep',
      'wake',
    ])
    expect(Object.keys(s.palettes!).sort()).toEqual(['summer', 'winter'])
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
