import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StagePet } from './stage-pet'

describe('StagePet', () => {
  it('reserves the stoat-sized box on the server without drawing', () => {
    const html = renderToStaticMarkup(<StagePet clip="confused" scale={3} />)
    expect(html).toContain('width:96px')
    expect(html).toContain('height:60px')
    expect(html).not.toContain('<canvas')
  })
})
