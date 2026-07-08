import type { SVGProps } from 'react'

// lucide icons, inlined (MIT) — no dep for a couple of glyphs. 24x24, stroke, round caps.
function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Base>
  )
}

export function ArrowDown(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </Base>
  )
}

export function Github(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </Base>
  )
}

export function Globe(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </Base>
  )
}

export function Package(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="m7.5 4.27 9 5.15" />
    </Base>
  )
}

export function FileText(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </Base>
  )
}

export function RotateCw(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </Base>
  )
}

export function Mail(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </Base>
  )
}

export function AtSign(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </Base>
  )
}

export function Linkedin(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </Base>
  )
}

export function X(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Base>
  )
}
