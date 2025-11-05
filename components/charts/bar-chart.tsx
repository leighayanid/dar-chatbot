'use client'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: DataPoint[]
  height?: number
  showValues?: boolean
}

export function BarChart({ data, height = 200, showValues = true }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="w-full space-y-3" style={{ minHeight: height }}>
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
            {showValues && (
              <span className="font-bold text-zinc-900 dark:text-zinc-50">{item.value}</span>
            )}
          </div>
          <div className="relative h-8 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-lg bg-gradient-to-r transition-all duration-500"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                background: item.color || 'linear-gradient(to right, rgb(251, 113, 133), rgb(251, 146, 60))',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
