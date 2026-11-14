import { useEffect, useState } from 'react'

const C = 200
const hours = Array.from({ length: 13 }, (_, i) => i + 6)
const polar = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180
  return [C + r * Math.sin(a), C - r * Math.cos(a)]
}

export default function SundialDial() {
  // Null until mount: the server has no visitor timezone, so it renders a neutral dial.
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const t = now ? now.getHours() + now.getMinutes() / 60 : 12
  const daylight = t >= 6 && t <= 18
  const angle = (Math.min(18, Math.max(6, t)) - 12) * 15

  return (
    <svg className="sd-dial" viewBox="0 0 400 400" role="img" aria-label="A sundial whose shadow follows the time of day where you are">
      <circle className="sd-ring" cx={C} cy={C} r="150" />
      <circle className="sd-ring sd-ring-in" cx={C} cy={C} r="138" />
      <path className="sd-night" d={`M ${C - 150} ${C} A 150 150 0 0 0 ${C + 150} ${C}`} />
      {hours.map((h) => {
        const deg = (h - 12) * 15
        const [x1, y1] = polar(deg, 138)
        const [x2, y2] = polar(deg, h % 3 === 0 ? 112 : 124)
        const [lx, ly] = polar(deg, 172)
        return (
          <g key={h}>
            <line className="sd-hour" x1={x1} y1={y1} x2={x2} y2={y2} />
            <text className="sd-num" x={lx} y={ly} textAnchor="middle" dominantBaseline="central">{h}</text>
          </g>
        )
      })}
      <g
        className="sd-shadow"
        style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${C}px ${C}px`, opacity: now ? (daylight ? 1 : 0.18) : 0 }}
      >
        <polygon points={`${C - 5},${C} ${C + 5},${C} ${C + 2},${C - 132} ${C - 2},${C - 132}`} />
      </g>
      <polygon className="sd-gnomon" points={`${C - 9},${C + 6} ${C + 9},${C + 6} ${C},${C - 16}`} />
      <circle className="sd-pivot" cx={C} cy={C} r="3" />
    </svg>
  )
}
