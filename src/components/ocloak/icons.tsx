// Lucide icons (ISC-licensed), vendored inline for the ØCLOAK interactive.
// Stroke-based on currentColor, so callers set color and size via className.
type P = { className?: string; strokeWidth?: number }

const base = (strokeWidth = 1.75) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export function HouseWifi({ className, strokeWidth }: P) {
  return (
    <svg {...base(strokeWidth)} className={className} aria-hidden>
      <path d="M9.5 13.866a4 4 0 0 1 5 .01" />
      <path d="M12 17h.01" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M7 10.754a8 8 0 0 1 10 0" />
    </svg>
  )
}

export function UserSearch({ className, strokeWidth }: P) {
  return (
    <svg {...base(strokeWidth)} className={className} aria-hidden>
      <circle cx="10" cy="7" r="4" />
      <path d="M10.3 15H7a4 4 0 0 0-4 4v2" />
      <circle cx="17" cy="17" r="3" />
      <path d="m21 21-1.9-1.9" />
    </svg>
  )
}

export function Building2({ className, strokeWidth }: P) {
  return (
    <svg {...base(strokeWidth)} className={className} aria-hidden>
      <path d="M10 12h4" />
      <path d="M10 8h4" />
      <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
      <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
    </svg>
  )
}

export function Store({ className, strokeWidth }: P) {
  return (
    <svg {...base(strokeWidth)} className={className} aria-hidden>
      <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" />
      <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
      <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
    </svg>
  )
}

export function Briefcase({ className, strokeWidth }: P) {
  return (
    <svg {...base(strokeWidth)} className={className} aria-hidden>
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  )
}

export function Footprints({ className, strokeWidth }: P) {
  return (
    <svg {...base(strokeWidth)} className={className} aria-hidden>
      <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" />
      <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" />
      <path d="M16 17h4" />
      <path d="M4 13h4" />
    </svg>
  )
}
