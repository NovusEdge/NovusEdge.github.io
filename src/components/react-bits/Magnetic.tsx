import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface MagneticProps {
  children: React.ReactElement
  range?: number
}

export default function Magnetic({ children, range = 60 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2
    const distanceX = clientX - centerX
    const distanceY = clientY - centerY

    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

    if (distance < range) {
      setPosition({ x: distanceX * 0.35, y: distanceY * 0.35 })
    } else {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  )
}
