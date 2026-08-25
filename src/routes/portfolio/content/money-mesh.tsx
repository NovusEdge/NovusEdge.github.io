import type { ProjectContent } from './types'

/* The page body lives in detail-money-mesh.tsx. This entry exists so the
   project registers as having a page, which is what makes the index card link
   inward instead of out to a repo that is private. */
export const moneyMesh: ProjectContent = {
  lede: 'money-mesh runs agents that pick their own way of making money and pay for their own peers out of one budget seeded at the start. Spawning divides a slice and mints nothing, so the spend cap holds by arithmetic and needs nobody watching. One node runs today, and no stranger has paid it yet.',
  sections: [],
}
