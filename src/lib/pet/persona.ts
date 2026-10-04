import { useLocation } from 'react-router'
import { stripLocale } from '../../i18n/paths'
import { posts, type Post } from '../posts'
import type { Mode, PetEvent } from './pet-brain'

export type Persona = 'desk' | 'desk-right' | 'thinking' | 'scientist'
type DistributiveOmit<T, K extends string> = T extends unknown ? Omit<T, K> : never
export type RouteEvent = DistributiveOmit<PetEvent, 'now'>

const POST_PERSONAS: Persona[] = ['thinking', 'scientist']

export const PERSONA_CLIPS = {
  thinking: { loop: 'think', beat: 'think_q' },
  scientist: { loop: 'lab', beat: 'lab_squint' },
} as const

export function personaFor(pathname: string, list: Pick<Post, 'slug' | 'pixel'>[] = posts): Persona {
  const path = stripLocale(pathname).replace(/\/+$/, '') || '/'
  if (path === '/research') return 'scientist'
  if (path === '/portfolio' || path.startsWith('/portfolio/')) return 'desk-right'
  const slug = path.match(/^\/blog\/([^/]+)$/)?.[1]
  const pixel = slug ? list.find((p) => p.slug === slug)?.pixel : undefined
  return POST_PERSONAS.includes(pixel as Persona) ? (pixel as Persona) : 'desk'
}

export const atDesk = (p: Persona) => p === 'desk' || p === 'desk-right'

export const usePersona = () => personaFor(useLocation().pathname)

export function stoatOnRoute(was: Persona, next: Persona, mode: Mode, width: number, off: number, target: number): RouteEvent[] {
  if (next === 'thinking') return [{ type: 'leave', width, off }]
  if (was === 'thinking') return [{ type: 'return', width, off, target }]
  // a napping stoat is drawn inside the desk, so it has to wake before the desk moves or goes
  const wake: RouteEvent[] = mode === 'desk_nap' && was !== next ? [{ type: 'input' }] : []
  return [...wake, { type: 'go', target }]
}
