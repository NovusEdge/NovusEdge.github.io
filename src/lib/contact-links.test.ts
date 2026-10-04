import { describe, expect, it } from 'vitest'
import { CONTACT_LINKS, opensNewTab } from './contact-links'

describe('CONTACT_LINKS', () => {
  it('lists the six links in card order with unique ids', () => {
    expect(CONTACT_LINKS.map((l) => l.id)).toEqual(['email', 'x', 'github', 'linkedin', 'huggingface', 'kofi'])
    expect(new Set(CONTACT_LINKS.map((l) => l.id)).size).toBe(6)
  })

  it('calls Twitter X and points at x.com', () => {
    const x = CONTACT_LINKS.find((l) => l.id === 'x')!
    expect(x).toEqual({ id: 'x', name: 'X', href: 'https://x.com/0kaliasgar' })
  })

  it('opens every link but email in a new tab', () => {
    expect(CONTACT_LINKS.filter(opensNewTab).map((l) => l.id)).toEqual(['x', 'github', 'linkedin', 'huggingface', 'kofi'])
  })
})
