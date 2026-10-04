import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import cat from '../../assets/sprites/cat.json'
import { PixelSprite } from './pixel-sprite'
import type { Sprite } from '../../lib/pet/sprite'

describe('PixelSprite', () => {
  it('renders a hidden canvas sized to the clip at the given scale', () => {
    const html = renderToStaticMarkup(<PixelSprite sprite={cat as Sprite} clip="idle" scale={2} />)
    expect(html).toContain('<canvas')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('width:64px')
    expect(html).toContain('height:64px')
  })
})
