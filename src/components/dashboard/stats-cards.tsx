import type { ResponsesSchema } from '@/utils/responses-schema'

type SingleResponse = ResponsesSchema['included'][number]

export function StatsCards({ responses }: { responses: SingleResponse[] }) {
  const total = responses.length
  const positive = responses.filter((r) => r.attributes.answer_01 === '1').length
  const negative = responses.filter((r) => r.attributes.answer_01 === '0').length
  const uniquePages = new Set(
    responses.map((r) => `${r.attributes.hostname}::${r.attributes.page}`),
  ).size

  const positivePct = total > 0 ? Math.round((positive / total) * 100) : 0
  const negativePct = total > 0 ? Math.round((negative / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card label="Total Responses" value={total} />
      <Card label="Positive" value={positive} suffix={`(${positivePct}%)`} />
      <Card label="Negative" value={negative} suffix={`(${negativePct}%)`} />
      <Card label="Unique Pages" value={uniquePages} />
    </div>
  )
}

function Card({
  label,
  value,
  suffix,
}: {
  label: string
  value: number
  suffix?: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">
        {value.toLocaleString()}
        {suffix && (
          <span className="text-sm font-normal text-gray-500 ml-1">
            {suffix}
          </span>
        )}
      </p>
    </div>
  )
}
