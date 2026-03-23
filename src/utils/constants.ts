export const WEBSITES = [
  'ab2d.cms.gov',
  'bcda.cms.gov',
  'bluebutton.cms.gov',
  'dpc.cms.gov',
] as const

export type Website = (typeof WEBSITES)[number]

export const WEBSITE_COLORS: Record<Website, string> = {
  'ab2d.cms.gov': '#2563eb',       // blue-600
  'bcda.cms.gov': '#d97706',       // amber-600
  'bluebutton.cms.gov': '#059669', // emerald-600
  'dpc.cms.gov': '#7c3aed',       // violet-600
}

export const DATE_PRESETS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '12M', days: 365 },
  { label: 'All', days: null },
] as const

export type DatePreset = (typeof DATE_PRESETS)[number]
