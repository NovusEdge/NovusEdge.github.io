import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markdown } from './markdown'

const render = (md: string) => renderToStaticMarkup(<Markdown>{md}</Markdown>)

describe('Markdown', () => {
  it('renders status:<tone> inline code as a pill and leaves unknown tones as code', () => {
    const html = render('`status:wait Lean, pending` and `status:nope x`')
    expect(html).toContain('rounded-full')
    expect(html).toContain('>Lean, pending</span>')
    expect(html).toContain('<code>status:nope x</code>')
  })

  it('styles a blockquote opening with a curly quote as a pull quote, and plain ones as normal', () => {
    expect(render('> “Flew, and danced.”\n>\n> — Alpöge')).toMatch(/<blockquote class="[^"]*border-gold/)
    expect(render('> plain quote')).toContain('<blockquote>')
  })
})
