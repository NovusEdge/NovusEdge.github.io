import type { ProjectContent } from './types'

/* The page body lives in detail-money-mesh.tsx. This entry exists so the
   project registers as having a page, which is what makes the index card link
   inward instead of out to a repo that is private. */
export const moneyMesh: ProjectContent = {
  lede: 'A leaderless mesh of earning agents, each carrying the same immutable core and a slice of one conserved pot. Spawning a peer divides a slice and mints nothing, so the global spend cap holds by arithmetic rather than by supervision. One node runs today, and no stranger has paid it yet.',
  sections: [],
}
