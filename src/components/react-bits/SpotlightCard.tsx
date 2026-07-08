import { useRef, useState } from 'react'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(107, 140, 174, 0.15)',
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const { left, top } = cardRef.current.getBoundingClientRect()
    setCoords({
      x: e.clientX - left,
      y: e.clientY - top,
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-sm border border-charcoal/10 bg-bone-tint/25 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 dark:border-bone/10 dark:bg-charcoal-tint/20 dark:hover:border-gold/40 ${className}`}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
