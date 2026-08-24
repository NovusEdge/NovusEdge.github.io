// Vendored React Bits background components ship as untyped .jsx; declare them
// so the TS build accepts the imports. They are lazy-loaded in hero-bg.tsx.
declare module '*.jsx' {
  import type { ComponentType } from 'react'
  const Component: ComponentType<Record<string, unknown>>
  export default Component
}
