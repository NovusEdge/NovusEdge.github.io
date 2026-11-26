import { useSyncExternalStore } from 'react'

// Same model and inputs as /assets/blog/consumer-chat-demand.py; the post's tables cite the sources.
export const DC_AVG_MW = 485e6 / 8760 // IEA: 485 TWh of data-centre electricity in 2025

export type Inputs = { wau: number; msgs: number; wh: number; mult: number; peak: number }

export const PRESETS: { name: string; v: Inputs }[] = [
  { name: 'Low', v: { wau: 900, msgs: 3.67, wh: 0.24, mult: 1.5, peak: 1.66 } },
  { name: 'Central', v: { wau: 900, msgs: 5.5, wh: 0.34, mult: 2, peak: 1.66 } },
  { name: 'My high case', v: { wau: 900, msgs: 11, wh: 1, mult: 3, peak: 2 } },
  { name: 'GPT-5, minimal reasoning', v: { wau: 900, msgs: 5.5, wh: 2.33, mult: 2, peak: 1.66 } },
  { name: 'GPT-5, high reasoning', v: { wau: 900, msgs: 5.5, wh: 17.15, mult: 2, peak: 1.66 } },
]

const CENTRAL = PRESETS[1].v

export function power(v: Inputs) {
  const avg = ((v.wau * 1e6 * v.msgs * v.wh) / 24 / 1e6) * v.mult
  return { avg, peak: avg * v.peak }
}

export function fmtMW(mw: number) {
  return mw >= 1000 ? `${(mw / 1000).toFixed(mw >= 10_000 ? 0 : 1)} GW` : `${Math.round(mw)} MW`
}

export const fmtWh = (wh: number) => `${wh < 1 ? wh.toFixed(2) : wh.toFixed(1)} Wh`

// The calculator lives inside the markdown and the rail outside it. State held
// by the page would re-render the markdown on every slider tick and remount
// the calculator mid-drag, so both subscribe to this store instead.
let current = CENTRAL
const listeners = new Set<() => void>()

export function setInputs(next: Inputs) {
  current = next
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useInputs(): Inputs {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => CENTRAL,
  )
}
