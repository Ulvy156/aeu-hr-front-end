// counts working days between start and end (inclusive), excluding Sundays
export function countWorkingDays(startDate: string, endDate: string, isDurationHalfDay = false): number {
  if (!startDate || !endDate) return 0

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > end) return 0

  let count = 0
  const current = new Date(start)

  while (current <= end) {
    const day = current.getDay()
    if (day !== 0) count++ // skip Sunday
    current.setDate(current.getDate() + 1)
  }

  return isDurationHalfDay ? 0.5 : count
}