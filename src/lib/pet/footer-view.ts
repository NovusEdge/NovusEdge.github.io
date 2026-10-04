import { useSyncExternalStore } from 'react'

let inView = false
const listeners = new Set<() => void>()

export const footerInView = () => inView

export const setFooterInView = (v: boolean) => {
  if (v === inView) return
  inView = v
  listeners.forEach((l) => l())
}

export const useFooterInView = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => inView,
    () => false,
  )
