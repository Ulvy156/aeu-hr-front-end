// counts working days between start and end (inclusive), excluding Sundays and public holidays
export function countWorkingDays(
  startDate: string,
  endDate: string,
  isDurationHalfDay = false,
  holidayDates: Set<string> = new Set(),
): number {
  if (!startDate || !endDate) return 0

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > end) return 0

  let count = 0
  const current = new Date(start)

  while (current <= end) {
    const day = current.getDay()
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, '0')
    const d = String(current.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`
    if (day !== 0 && !holidayDates.has(dateStr)) count++
    current.setDate(current.getDate() + 1)
  }

  return isDurationHalfDay ? 0.5 : count
}