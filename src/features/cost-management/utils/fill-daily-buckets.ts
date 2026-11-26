const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/
const MAX_FILLED_DAYS = 400

export type DailyCostPoint = { cost: number; day: string }

/**
 * The summary endpoint only returns days that had calls. Plotting those as
 * evenly spaced categories hides gaps (11-07 sits right next to 11-15), so
 * every missing day between the first and last bucket is filled with 0.
 * Keys that aren't `YYYY-MM-DD` are returned untouched.
 */
export function fillDailyBuckets(points: DailyCostPoint[]): DailyCostPoint[] {
  if (points.length < 2 || !points.every((point) => DAY_KEY.test(point.day))) {
    return points
  }

  const costByDay = new Map<string, number>()
  for (const point of points) {
    costByDay.set(point.day, (costByDay.get(point.day) ?? 0) + point.cost)
  }

  const days = [...costByDay.keys()].sort()
  const start = new Date(`${days[0]}T00:00:00Z`)
  const end = new Date(`${days[days.length - 1]}T00:00:00Z`)
  const filled: DailyCostPoint[] = []

  for (
    let cursor = start;
    cursor <= end && filled.length < MAX_FILLED_DAYS;
    cursor = new Date(cursor.getTime() + 86_400_000)
  ) {
    const day = cursor.toISOString().slice(0, 10)
    filled.push({ cost: costByDay.get(day) ?? 0, day })
  }

  return filled
}

/** `2026-11-05` → `05/11`. */
export function formatDayTick(day: string): string {
  if (!DAY_KEY.test(day)) return day
  const [, month, date] = day.split("-")
  return `${date}/${month}`
}
