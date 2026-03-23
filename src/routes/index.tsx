import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { Dashboard } from '@/components/dashboard/dashboard'
import { WEBSITES } from '@/utils/constants'
import * as z from 'zod'

const DEFAULT_WEBSITES = WEBSITES.join(',')

function toLocalDateStr(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function defaultStart(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return toLocalDateStr(d)
}

function defaultEnd(): string {
  return toLocalDateStr(new Date())
}

const searchSchema = z.object({
  start: z.string().date().optional().default(defaultStart),
  end: z.string().date().optional().default(defaultEnd),
  websites: z.string().optional().default(DEFAULT_WEBSITES),
  page: z.string().optional(),
  hostname: z.string().optional(),
})

const searchDefaults: SearchParams = {
  start: defaultStart(),
  end: defaultEnd(),
  websites: DEFAULT_WEBSITES,
}

export type SearchParams = z.infer<typeof searchSchema>

export const Route = createFileRoute('/')({
  component: App,
  validateSearch: searchSchema,
  search: {
    middlewares: [stripSearchParams(searchDefaults)],
  },
})

function App() {
  return <Dashboard />
}
