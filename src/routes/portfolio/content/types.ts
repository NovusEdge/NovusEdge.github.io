import type { ReactNode } from 'react'

// Layouts arrange sections, so page content stays data rather than one JSX blob.
// Any section body can still be arbitrary JSX.
export type ProjectSection = {
  id: string
  title: string
  jp?: string
  body: ReactNode
}

export type ProjectContent = {
  lede: ReactNode
  sections: ProjectSection[]
}
