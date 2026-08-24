import type { ComponentType } from 'react'
import type { LayoutProps } from './layouts'
import Stoat from './detail-stoat'
import Ocloak from './detail-ocloak'

// Per-project fully-custom detail pages. A slug present here overrides the
// shared Dossier layout; absent slugs keep the dossier.
export const CUSTOM_PAGES: Record<string, ComponentType<LayoutProps>> = {
  stoat: Stoat,
  ocloak: Ocloak,
}
