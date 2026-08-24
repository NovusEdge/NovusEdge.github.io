import { lazy, Suspense } from 'react'

const PixelBlast = lazy(() => import('../../components/react-bits/bg/PixelBlast.jsx'))

// viewport-tall band; a mask fades the effect's alpha to transparent toward the
// foot so the page shows through with no color seam or hard edge
const MASK = 'linear-gradient(to bottom, #000 0%, #000 30%, rgba(0,0,0,0.5) 62%, transparent 92%)'
const bandStyle = { WebkitMaskImage: MASK, maskImage: MASK } as const
const BAND = 'pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[min(96vh,1040px)] overflow-hidden md:block'

export function HeroBackground() {
  return (
    <div className={BAND} style={bandStyle}>
      <Suspense fallback={null}>
        <PixelBlast
          color="#d4a03c"
          variant="diamond"
          pixelSize={2}
          patternScale={6}
          patternDensity={0.85}
          speed={0.85}
          pixelSizeJitter={0.95}
        />
      </Suspense>
    </div>
  )
}
