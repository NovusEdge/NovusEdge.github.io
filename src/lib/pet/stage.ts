import { useEffect, useSyncExternalStore } from 'react'

let claims = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const stageClaimed = () => claims > 0

// A micro-moment cat claims the stage so the wandering cat hides; never two cats.
export function claimStage() {
  claims++
  emit()
  let released = false
  return () => {
    if (released) return
    released = true
    claims--
    emit()
  }
}

export const useStageClaimed = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    stageClaimed,
    () => false,
  )

export function useStageClaim(active: boolean) {
  useEffect(() => (active ? claimStage() : undefined), [active])
}
