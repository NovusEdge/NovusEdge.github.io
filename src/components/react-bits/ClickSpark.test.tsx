import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import ClickSpark from './ClickSpark'

afterEach(() => vi.unstubAllGlobals())

describe('click spark hydration', () => {
  it.each(['(max-width: 768px)', '(pointer: coarse)', '(prefers-reduced-motion: reduce)'])(
    'keeps the initial markup stable when the browser matches %s',
    matched => {
      const page = <ClickSpark><main>Page content</main></ClickSpark>
      const server = renderToString(page)
      vi.stubGlobal('matchMedia', (query: string) => ({ matches: query === matched }))
      expect(renderToString(page)).toBe(server)
    },
  )
})
