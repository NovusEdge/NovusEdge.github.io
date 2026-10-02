// opentype.js 2.0 ships no types; this covers the calls the pen text makes.
declare module 'opentype.js' {
  export type PathCommand =
    | { type: 'M' | 'L'; x: number; y: number }
    | { type: 'Q'; x1: number; y1: number; x: number; y: number }
    | { type: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
    | { type: 'Z' }
  export interface Path {
    commands: PathCommand[]
  }
  export interface Font {
    unitsPerEm: number
    ascender: number
    descender: number
    hasChar(c: string): boolean
    getPaths(text: string, x: number, y: number, fontSize: number): Path[]
    getAdvanceWidth(text: string, fontSize: number): number
  }
  export function parse(buffer: ArrayBuffer): Font
}
