import { useMemo, useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Route, type SearchParams } from '@/routes/index'
import { useFeedbackData } from '@/hooks/use-feedback-data'
import { DATE_PRESETS, type DatePreset, type Website } from '@/utils/constants'
import {
  filterByDateRange,
  filterByWebsites,
  filterByPage,
  bucketResponses,
  aggregateByPage,
} from '@/utils/dashboard'
import { DateRangePicker } from './date-range-picker'
import { WebsiteFilters } from './website-filters'
import { StatsCards } from './stats-cards'
import { FeedbackChart } from './feedback-chart'
import { PagesTable } from './pages-table'
import type { ResponsesSchema } from '@/utils/responses-schema'

type SingleResponse = ResponsesSchema['included'][number]

function toDateStr(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getEarliestDateStr(responses: SingleResponse[]): string | null {
  if (responses.length === 0) return null
  let earliest = responses[0].attributes.created_at
  for (const r of responses) {
    if (r.attributes.created_at < earliest) earliest = r.attributes.created_at
  }
  return earliest.slice(0, 10)
}

/** Check which preset (if any) matches the current start/end dates. */
function detectPreset(
  startStr: string,
  endStr: string,
  earliestDateStr: string | null,
): DatePreset | null {
  const today = toDateStr(new Date())
  if (endStr !== today) return null

  if (earliestDateStr && startStr === earliestDateStr) {
    return DATE_PRESETS.find((p) => p.days === null) ?? null
  }

  for (const preset of DATE_PRESETS) {
    if (preset.days === null) continue
    const expected = new Date()
    expected.setDate(expected.getDate() - preset.days)
    if (startStr === toDateStr(expected)) return preset
  }
  return null
}

export function Dashboard() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/' })
  const queryClient = useQueryClient()

  const [apiKey, setApiKey] = useState('')

  const hasKey = !!apiKey

  const { data, isLoading, isError } = useFeedbackData(apiKey)

  const earliestDateStr = useMemo(
    () => getEarliestDateStr(data),
    [data],
  )

  const start = useMemo(() => new Date(search.start + 'T00:00:00'), [search.start])
  const end = useMemo(() => new Date(search.end + 'T23:59:59'), [search.end])
  const activePreset = useMemo(
    () => detectPreset(search.start, search.end, earliestDateStr),
    [search.start, search.end, earliestDateStr],
  )

  const activeWebsites = useMemo(
    () => new Set<string>(search.websites.split(',')),
    [search.websites],
  )

  const selectedPage = useMemo(() => {
    if (search.page && search.hostname) {
      return { page: search.page, hostname: search.hostname }
    }
    return null
  }, [search.page, search.hostname])

  const setSearch = useCallback(
    (updater: (prev: SearchParams) => Partial<SearchParams>) => {
      navigate({
        search: (prev) => ({ ...prev, ...updater(prev as SearchParams) }),
        replace: true,
      })
    },
    [navigate],
  )

  const handlePreset = useCallback(
    (preset: DatePreset) => {
      const endDate = new Date()
      let startStr: string
      if (preset.days === null) {
        startStr = earliestDateStr ?? toDateStr(endDate)
      } else {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - preset.days)
        startStr = toDateStr(startDate)
      }
      setSearch(() => ({
        start: startStr,
        end: toDateStr(endDate),
      }))
    },
    [setSearch, earliestDateStr],
  )

  const handleCustomRange = useCallback(
    (s: Date, e: Date) => {
      setSearch(() => ({
        start: toDateStr(s),
        end: toDateStr(e),
      }))
    },
    [setSearch],
  )

  const handleToggleWebsite = useCallback(
    (website: Website) => {
      setSearch((prev) => {
        const current = new Set(prev.websites?.split(','))
        if (current.has(website)) {
          if (current.size > 1) current.delete(website)
        } else {
          current.add(website)
        }
        return { websites: [...current].sort().join(',') }
      })
    },
    [setSearch],
  )

  const handleSelectPage = useCallback(
    (page: { page: string; hostname: string } | null) => {
      setSearch(() =>
        page
          ? { page: page.page, hostname: page.hostname }
          : { page: undefined, hostname: undefined },
      )
    },
    [setSearch],
  )

  const dateFiltered = useMemo(
    () => filterByDateRange(data, start, end),
    [data, start, end],
  )

  const websiteFiltered = useMemo(
    () => filterByWebsites(dateFiltered, activeWebsites),
    [dateFiltered, activeWebsites],
  )

  const chartSourceData = useMemo(() => {
    if (selectedPage) {
      return filterByPage(
        websiteFiltered,
        selectedPage.page,
        selectedPage.hostname,
      )
    }
    return websiteFiltered
  }, [websiteFiltered, selectedPage])

  const chartData = useMemo(
    () => bucketResponses(chartSourceData, start, end, activeWebsites),
    [chartSourceData, start, end, activeWebsites],
  )

  const pagesData = useMemo(
    () => aggregateByPage(websiteFiltered),
    [websiteFiltered],
  )

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Failed to load feedback data.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl font-semibold text-gray-900">
              Feedback Dashboard
            </h1>
            <DateRangePicker
              activePreset={activePreset}
              start={start}
              end={end}
              onPreset={handlePreset}
              onCustomRange={handleCustomRange}
              disabled={isLoading || !hasKey}
            />
          </div>


        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {!Boolean(data.length > 0) ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 mx-auto">
            <div className="mx-auto max-w-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  const next = String(fd.get('apiKey') ?? '').trim()
                  if (!next) return

                  setApiKey(next)
                  console.log('INVALIDATING KEY')
                  queryClient.invalidateQueries({ queryKey: ['forms'] })
                  queryClient.invalidateQueries({ queryKey: ['form'] })
                }}
              >
                <label className="text-sm text-gray-600 font-bold mb-1 inline-block" htmlFor="api-key">
                  Touchpoints API key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="api-key"
                    type="password"
                    name='apiKey'
                    placeholder="Paste API key to load data"
                    className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoComplete="off"
                    required
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-3 py-2 text-sm font-medium rounded-md bg-gray-900 text-white disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {isLoading && (
                      <span
                        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        aria-hidden="true"
                      />
                    )}
                    <span>{isLoading ? 'Loading…' : 'Load Data'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            <StatsCards responses={websiteFiltered} />
            <WebsiteFilters
              activeWebsites={activeWebsites}
              onToggle={handleToggleWebsite}
            />
            <FeedbackChart
              data={chartData}
              activeWebsites={activeWebsites}
              selectedPage={selectedPage}
              onClearPage={() => handleSelectPage(null)}
            />
            <PagesTable
              pages={pagesData}
              selectedPage={selectedPage}
              onSelectPage={handleSelectPage}
            />
          </>
        )}
      </main>
    </div>
  )
}
