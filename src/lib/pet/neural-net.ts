export type Net = { nodes: { x: number; y: number }[]; edges: [number, number][] }

export const NET: Net = {
  nodes: [
    { x: 2, y: 3 },
    { x: 2, y: 9 },
    { x: 12, y: 1 },
    { x: 12, y: 6 },
    { x: 12, y: 11 },
    { x: 22, y: 6 },
  ],
  edges: [
    [0, 2], [0, 3], [0, 4],
    [1, 2], [1, 3], [1, 4],
    [2, 5], [3, 5], [4, 5],
  ],
}

export function pulseLevel(prev: number, typing: boolean, dt: number) {
  const next = typing ? prev + dt / 150 : prev - dt / 400
  return Math.min(1, Math.max(0, next))
}

// A bright spot travels along each edge; the index offset keeps edges out of step.
export function edgeGlow(level: number, edgeIndex: number, t: number) {
  const phase = ((t / 700 + edgeIndex * 0.37) % 1 + 1) % 1
  return level * (0.25 + 0.75 * Math.max(0, Math.sin(phase * Math.PI)))
}
