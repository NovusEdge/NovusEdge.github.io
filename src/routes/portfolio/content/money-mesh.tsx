import type { ProjectContent } from './types'

/* The page body lives in detail-money-mesh.tsx. This entry exists so the
   project registers as having a page, which is what makes the index card link
   inward instead of out to a repo that is private. */
export const moneyMesh: ProjectContent = {
  lede: 'Agents that pick their own way of making money, run the code themselves, and buy their own peers out of one pot seeded at the start. Split a slice, spawn a node. The pot never grows, so the thing cannot run away from you.',
  sections: [],
}
