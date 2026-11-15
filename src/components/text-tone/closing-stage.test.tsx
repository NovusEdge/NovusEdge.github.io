import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { MotionContext } from './loop-pause'
import { ClosingStage } from './closing-stage'

vi.mock('./loop-pause', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./loop-pause')>()),
  useLoop: () => ({ paused: false, toggle: () => {}, running: true }),
}))

describe('ClosingStage with a running loop', () => {
  it('puts the pause button after the image role closes', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <MotionContext value="full"><ClosingStage /></MotionContext>
      </I18nextProvider>,
    )
    const img = html.indexOf('role="img"')
    const imgEnd = html.indexOf('</p></div>', img)
    const button = html.indexOf('<button')
    expect(img).toBeGreaterThan(-1)
    expect(imgEnd).toBeGreaterThan(img)
    expect(button).toBeGreaterThan(imgEnd)
  })
})
