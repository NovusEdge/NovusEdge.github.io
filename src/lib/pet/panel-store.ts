import { useSyncExternalStore } from 'react'

let open = false
const listeners = new Set<() => void>()
const set = (v: boolean) => {
  open = v
  listeners.forEach((l) => l())
}

let opener: HTMLElement | null = null

export const openPetPanel = () => {
  if (!open) opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  set(true)
}
export const closePetPanel = () => {
  set(false)
  // switching the friends off unmounts the desk button that opened the panel
  ;(opener?.isConnected ? opener : document.querySelector<HTMLElement>('[data-pet-paw]'))?.focus()
  opener = null
}

export const usePetPanelOpen = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => open,
    () => false,
  )
