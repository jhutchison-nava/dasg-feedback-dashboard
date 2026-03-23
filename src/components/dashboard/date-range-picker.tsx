import { DATE_PRESETS, type DatePreset } from '@/utils/constants'
import { Calendar } from 'lucide-react'

function toInputDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DateRangePicker({
  activePreset,
  start,
  end,
  onPreset,
  onCustomRange,
  disabled = false,
}: {
  activePreset: DatePreset | null
  start: Date | null
  end: Date
  onPreset: (preset: DatePreset) => void
  onCustomRange: (start: Date, end: Date) => void
  disabled?: boolean
}) {
  const startValue = start ? toInputDate(start) : ''
  const endValue = toInputDate(end)

  function handleStartChange(e: React.ChangeEvent<HTMLInputElement>) {
    const s = e.target.value
    if (s && endValue) {
      const startDate = new Date(s + 'T00:00:00')
      const endDate = new Date(endValue + 'T23:59:59')
      if (startDate <= endDate) {
        onCustomRange(startDate, endDate)
      }
    }
  }

  function handleEndChange(e: React.ChangeEvent<HTMLInputElement>) {
    const ev = e.target.value
    if (startValue && ev) {
      const startDate = new Date(startValue + 'T00:00:00')
      const endDate = new Date(ev + 'T23:59:59')
      if (startDate <= endDate) {
        onCustomRange(startDate, endDate)
      }
    } else if (!startValue && ev) {
      const endDate = new Date(ev + 'T23:59:59')
      onCustomRange(new Date(ev + 'T00:00:00'), endDate)
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {DATE_PRESETS.map((preset) => {
        const isActive = activePreset?.label === preset.label
        return (
          <button
            key={preset.label}
            onClick={() => onPreset(preset)}
            disabled={disabled}
            aria-pressed={isActive}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {preset.label}
          </button>
        )
      })}
      <span className="mx-1 text-gray-300">|</span>
      <div
        className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm ${
          activePreset === null
            ? 'border-gray-900 ring-1 ring-gray-900'
            : 'border-gray-300'
        }`}
      >
        <Calendar size={14} className="text-gray-400 shrink-0" />
        <input
          type="date"
          value={startValue}
          onChange={handleStartChange}
          disabled={disabled}
          className="bg-transparent outline-none text-gray-700 w-[7.5rem]"
          aria-label="Start date"
        />
        <span className="text-gray-400">&ndash;</span>
        <input
          type="date"
          value={endValue}
          onChange={handleEndChange}
          disabled={disabled}
          className="bg-transparent outline-none text-gray-700 w-[7.5rem]"
          aria-label="End date"
        />
      </div>
    </div>
  )
}
