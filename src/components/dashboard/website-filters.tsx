import { WEBSITES, WEBSITE_COLORS, type Website } from '@/utils/constants'

export function WebsiteFilters({
  activeWebsites,
  onToggle,
}: {
  activeWebsites: Set<string>
  onToggle: (website: Website) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {WEBSITES.map((website) => {
        const isActive = activeWebsites.has(website)
        const color = WEBSITE_COLORS[website]
        return (
          <button
            key={website}
            onClick={() => onToggle(website)}
            aria-pressed={isActive}
            className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors border"
            style={
              isActive
                ? { backgroundColor: color, borderColor: color, color: '#fff' }
                : { backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#6b7280' }
            }
          >
            {website}
          </button>
        )
      })}
    </div>
  )
}
