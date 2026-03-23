import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { WEBSITE_COLORS, type Website } from '@/utils/constants'
import type { ChartDataPoint } from '@/utils/dashboard'
import { X } from 'lucide-react'

export function FeedbackChart({
  data,
  activeWebsites,
  selectedPage,
  onClearPage,
}: {
  data: ChartDataPoint[]
  activeWebsites: Set<string>
  selectedPage: { page: string; hostname: string } | null
  onClearPage: () => void
}) {
  const websites = Array.from(activeWebsites) as Website[]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {selectedPage && (
        <div className="mb-3 flex items-center gap-2 bg-blue-50 text-blue-800 rounded-md px-3 py-2 text-sm">
          <span>
            Filtered by: <strong>{selectedPage.hostname}{selectedPage.page}</strong>
          </span>
          <button
            onClick={onClearPage}
            className="ml-auto p-0.5 rounded hover:bg-blue-100"
            aria-label="Clear page filter"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div
        role="img"
        aria-label={`Bar chart showing feedback responses over time${selectedPage ? ` for ${selectedPage.hostname}${selectedPage.page}` : ''}`}
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip />
            <Legend />
            {websites.map((website) => (
              <Bar
                key={website}
                dataKey={website}
                fill={WEBSITE_COLORS[website]}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
