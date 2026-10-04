import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StageCat } from './stage-cat'

describe('StageCat', () => {
  it('reserves its box on the server without drawing', () => {
    const html = renderToStaticMarkup(<StageCat clip="confused" scale={3} />)
    expect(html).toContain('width:96px')
    expect(html).toContain('height:96px')
    expect(html).not.toContain('<canvas')
  })
})
