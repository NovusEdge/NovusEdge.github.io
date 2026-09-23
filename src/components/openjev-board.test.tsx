import { describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../i18n'
import { OpenJevBoard, OpenJevStatic } from './openjev-board'

function render(node: ReactNode) {
  return renderToStaticMarkup(<I18nextProvider i18n={i18nFor('en')}>{node}</I18nextProvider>)
}

function group(html: string, id: string): string {
  return html.match(new RegExp(`<g data-row="${id}"[^>]*>(.*?)</g>`))![0]
}

describe('OpenJevBoard', () => {
  it('shows the first claim and hides the email row at the start', () => {
    const html = render(<OpenJevBoard state={0} animate={false} />)
    expect(group(html, 'claim')).toContain('opacity="1"')
    expect(group(html, 'email')).toContain('opacity="0"')
  })

  it('draws humans as a tick with no bar', () => {
    const html = group(render(<OpenJevBoard state={5} animate={false} />), 'humans')
    expect(html).not.toContain('data-bar')
    expect(html).toContain('~chance')
  })

  it('carries no baked-in colours, so the theme toggle repaints it', () => {
    expect(render(<OpenJevBoard state={4} animate={false} />)).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it('renders the final board with the takeaway caption and a data table', () => {
    const html = render(<OpenJevStatic />)
    expect(html).toContain('The claim worth making is 90.3%.')
    expect(html).toContain('no public data')
    expect(html).toContain('<table')
  })
})
