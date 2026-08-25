import type { ProjectContent } from './types'
import { stoat } from './stoat'
import { engrammic } from './engrammic'
import { veil } from './veil'
import { ocloak } from './ocloak'
import { palpatine } from './palpatine'
import { moneyMesh } from './money-mesh'

// A project appears here once it has a written page. The portfolio index reads
// the same map to decide which cards link out instead of flipping.
export const PROJECT_PAGES: Record<string, ProjectContent> = {
  stoat,
  engrammic,
  veil,
  ocloak,
  palpatine,
  'money-mesh': moneyMesh,
}

export const hasPage = (slug: string) => slug in PROJECT_PAGES
