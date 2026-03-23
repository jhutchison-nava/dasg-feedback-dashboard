import type { ResponsesSchema } from '@/utils/responses-schema'

type SingleResponse = ResponsesSchema['included'][number]

export function filterByDateRange(
  responses: SingleResponse[],
  start: Date | null,
  end: Date,
): SingleResponse[] {
  if (!start) return responses
  return responses.filter((r) => {
    const d = new Date(r.attributes.created_at)
    return d >= start && d <= end
  })
}

export function filterByWebsites(
  responses: SingleResponse[],
  activeWebsites: Set<string>,
): SingleResponse[] {
  return responses.filter((r) => activeWebsites.has(r.attributes.hostname))
}

export function filterByPage(
  responses: SingleResponse[],
  page: string,
  hostname: string,
): SingleResponse[] {
  return responses.filter(
    (r) => r.attributes.page === page && r.attributes.hostname === hostname,
  )
}

export type BucketSize = 'daily' | 'weekly' | 'monthly'

export function determineBucketSize(start: Date | null, end: Date): BucketSize {
  if (!start) return 'monthly'
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (days <= 14) return 'daily'
  if (days <= 90) return 'weekly'
  return 'monthly'
}

function formatBucketLabel(date: Date, bucketSize: BucketSize): string {
  if (bucketSize === 'monthly') {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getBucketKey(date: Date, bucketSize: BucketSize): string {
  if (bucketSize === 'daily') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  if (bucketSize === 'weekly') {
    // Start of week (Monday)
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  // monthly
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function generateBucketKeys(
  start: Date,
  end: Date,
  bucketSize: BucketSize,
): { key: string; label: string }[] {
  const keys: { key: string; label: string }[] = []
  const current = new Date(start)

  if (bucketSize === 'daily') {
    current.setHours(0, 0, 0, 0)
    while (current <= end) {
      keys.push({
        key: getBucketKey(current, bucketSize),
        label: formatBucketLabel(current, bucketSize),
      })
      current.setDate(current.getDate() + 1)
    }
  } else if (bucketSize === 'weekly') {
    // Align to Monday
    const day = current.getDay()
    const diff = current.getDate() - day + (day === 0 ? -6 : 1)
    current.setDate(diff)
    current.setHours(0, 0, 0, 0)
    while (current <= end) {
      keys.push({
        key: getBucketKey(current, bucketSize),
        label: formatBucketLabel(current, bucketSize),
      })
      current.setDate(current.getDate() + 7)
    }
  } else {
    // monthly
    current.setDate(1)
    current.setHours(0, 0, 0, 0)
    while (current <= end) {
      keys.push({
        key: getBucketKey(current, bucketSize),
        label: formatBucketLabel(current, bucketSize),
      })
      current.setMonth(current.getMonth() + 1)
    }
  }

  return keys
}

export type ChartDataPoint = {
  date: string
  [website: string]: number | string
}

export function bucketResponses(
  responses: SingleResponse[],
  start: Date | null,
  end: Date,
  activeWebsites: Set<string>,
): ChartDataPoint[] {
  const bucketSize = determineBucketSize(start, end)
  const effectiveStart = start ?? getEarliestDate(responses) ?? end

  const bucketKeys = generateBucketKeys(effectiveStart, end, bucketSize)

  // Initialize empty buckets
  const bucketMap = new Map<string, ChartDataPoint>()
  for (const { key, label } of bucketKeys) {
    const point: ChartDataPoint = { date: label }
    for (const ws of activeWebsites) {
      point[ws] = 0
    }
    bucketMap.set(key, point)
  }

  // Fill buckets
  for (const r of responses) {
    if (!activeWebsites.has(r.attributes.hostname)) continue
    const d = new Date(r.attributes.created_at)
    const key = getBucketKey(d, bucketSize)
    const bucket = bucketMap.get(key)
    if (bucket) {
      bucket[r.attributes.hostname] =
        (bucket[r.attributes.hostname] as number) + 1
    }
  }

  return bucketKeys.map((bk) => bucketMap.get(bk.key)!)
}

function getEarliestDate(responses: SingleResponse[]): Date | null {
  if (responses.length === 0) return null
  let earliest = new Date(responses[0].attributes.created_at)
  for (const r of responses) {
    const d = new Date(r.attributes.created_at)
    if (d < earliest) earliest = d
  }
  return earliest
}

export type PageAggregate = {
  page: string
  hostname: string
  total: number
  yes: number
  no: number
}

export function aggregateByPage(responses: SingleResponse[]): PageAggregate[] {
  const map = new Map<string, PageAggregate>()

  for (const r of responses) {
    const key = `${r.attributes.hostname}::${r.attributes.page}`
    let entry = map.get(key)
    if (!entry) {
      entry = {
        page: r.attributes.page,
        hostname: r.attributes.hostname,
        total: 0,
        yes: 0,
        no: 0,
      }
      map.set(key, entry)
    }
    entry.total++
    if (r.attributes.answer_01 === '1') entry.yes++
    else if (r.attributes.answer_01 === '0') entry.no++
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}
