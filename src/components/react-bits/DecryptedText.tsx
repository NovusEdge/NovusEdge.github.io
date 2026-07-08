import { useEffect, useState } from 'react'

interface DecryptedTextProps {
  text: string
  speed?: number
  delay?: number
  className?: string
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#@%&'

export default function DecryptedText({ text, speed = 30, delay = 50, className = '' }: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      let currentIteration = 0
      const interval = setInterval(() => {
        if (!active) {
          clearInterval(interval)
          return
        }

        const nextText = text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < currentIteration) {
              return text[index]
            }
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')

        setDisplayText(nextText)

        if (currentIteration >= text.length) {
          clearInterval(interval)
        }
        currentIteration += 1 / 2
      }, speed)

      return () => clearInterval(interval)
    }, delay)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [text, speed, delay])

  return <span className={className}>{displayText || text}</span>
}
