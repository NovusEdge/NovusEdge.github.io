export const isWinter = (d: Date) => {
  const m = d.getMonth()
  return m >= 10 || m <= 2
}

export const stoatCoat = (d: Date) => (isWinter(d) ? 'winter' : 'summer')
