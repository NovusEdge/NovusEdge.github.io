export type Frame = { ms: number; px: string[]; typing?: boolean }
export type Clip = {
  loop: boolean
  frames: Frame[]
  travel?: number
  w?: number
  h?: number
  catSlot?: [number, number, number, number]
}
export type Sprite = {
  w: number
  h: number
  palette: Record<string, string>
  palettes?: Record<string, Record<string, string>>
  animations: Record<string, Clip>
}

export const paletteFor = (s: Sprite, variant?: string) => ({ ...s.palette, ...(variant ? s.palettes?.[variant] : undefined) })

export const clipSize = (s: Sprite, c: Clip) => ({ w: c.w ?? s.w, h: c.h ?? s.h })

// The engine ships before every clip is drawn, so a missing clip plays idle.
export function resolveClip(s: Sprite, name: string) {
  const clip = s.animations[name]
  return clip ? { name, clip, fallback: false } : { name: 'idle', clip: s.animations.idle, fallback: true }
}

export function validateSprite(s: Sprite): string[] {
  const errors: string[] = []
  for (const [variant, pal] of Object.entries(s.palettes ?? {})) {
    for (const k of Object.keys(s.palette)) if (!(k in pal)) errors.push(`palette ${variant} lacks ${k}`)
  }
  for (const [name, clip] of Object.entries(s.animations)) {
    const { w, h } = clipSize(s, clip)
    clip.frames.forEach((f, i) => {
      if (f.px.length !== h) errors.push(`${name}[${i}] has ${f.px.length} rows, want ${h}`)
      f.px.forEach((row, y) => {
        if (row.length !== w) errors.push(`${name}[${i}] row ${y} is ${row.length} wide, want ${w}`)
        for (const ch of row) if (ch !== '.' && !(ch in s.palette)) errors.push(`${name}[${i}] uses letter ${ch} not in palette`)
      })
    })
  }
  return errors
}
