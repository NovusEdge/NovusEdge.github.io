export function HueDiagram() {
  // 6 segments of the color wheel
  const segments = [
    { label: 'R→Y', start: 0, color: '#ff0000' },
    { label: 'Y→G', start: 1, color: '#ffff00' },
    { label: 'G→C', start: 2, color: '#00ff00' },
    { label: 'C→B', start: 3, color: '#00ffff' },
    { label: 'B→M', start: 4, color: '#0000ff' },
    { label: 'M→R', start: 5, color: '#ff00ff' },
  ]

  // Generate RGB curves (triangle waves)
  const points = 100
  const curves = {
    r: Array.from({ length: points }, (_, i) => {
      const t = (i / points) * 6
      return Math.max(0, Math.min(1, 2 - Math.abs((t + 0) % 6 - 3)))
    }),
    g: Array.from({ length: points }, (_, i) => {
      const t = (i / points) * 6
      return Math.max(0, Math.min(1, 2 - Math.abs((t + 4) % 6 - 3)))
    }),
    b: Array.from({ length: points }, (_, i) => {
      const t = (i / points) * 6
      return Math.max(0, Math.min(1, 2 - Math.abs((t + 2) % 6 - 3)))
    }),
  }

  const toPath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / points) * 300} ${60 - v * 50}`).join(' ')

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-charcoal/20 dark:border-bone/20">
      <div className="border-b border-charcoal/20 bg-charcoal/5 px-3 py-1.5 font-mono text-xs text-charcoal/60 dark:border-bone/20 dark:bg-bone/5 dark:text-bone/60">
        hue → 6 segments
      </div>
      <div className="bg-charcoal/5 p-4 dark:bg-bone/5">
        {/* Color bar */}
        <div className="mb-4 flex h-6 overflow-hidden rounded">
          {segments.map((s, i) => (
            <div
              key={i}
              className="flex flex-1 items-center justify-center font-mono text-[10px] text-white/80"
              style={{ background: `linear-gradient(90deg, ${s.color}, ${segments[(i + 1) % 6].color})` }}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* RGB curves */}
        <svg viewBox="0 0 300 70" className="w-full">
          <path d={toPath(curves.r)} fill="none" stroke="#ef4444" strokeWidth="2" />
          <path d={toPath(curves.g)} fill="none" stroke="#22c55e" strokeWidth="2" />
          <path d={toPath(curves.b)} fill="none" stroke="#3b82f6" strokeWidth="2" />
        </svg>

        <div className="mt-2 flex justify-between font-mono text-[10px] text-charcoal/50 dark:text-bone/50">
          <span>0 (red)</span>
          <span>1 (yellow)</span>
          <span>2 (green)</span>
          <span>3 (cyan)</span>
          <span>4 (blue)</span>
          <span>5 (magenta)</span>
          <span>6 (red)</span>
        </div>
      </div>
    </div>
  )
}
