'use client'

interface DataPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: DataPoint[]
  color?: string
  height?: number
}

export function LineChart({ data, color = 'rgb(251, 113, 133)', height = 200 }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value), 1)
  const minValue = Math.min(...data.map(d => d.value), 0)
  const range = maxValue - minValue || 1

  // Calculate points for SVG path
  const padding = 20
  const chartWidth = 100 // percentage
  const chartHeight = height - padding * 2

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * chartWidth
    const y = ((maxValue - d.value) / range) * chartHeight + padding
    return `${x},${y}`
  }).join(' ')

  // Create path for the line
  const pathData = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * chartWidth
    const y = ((maxValue - d.value) / range) * chartHeight + padding
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')

  // Create area fill path
  const areaPathData = data.length > 0
    ? `${pathData} L ${chartWidth} ${height - padding} L 0 ${height - padding} Z`
    : ''

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={padding + ratio * chartHeight}
            x2={chartWidth}
            y2={padding + ratio * chartHeight}
            stroke="currentColor"
            strokeWidth="0.2"
            className="text-zinc-200 dark:text-zinc-700"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Area fill */}
        <path
          d={areaPathData}
          fill={color}
          fillOpacity="0.1"
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1 || 1)) * chartWidth
          const y = ((maxValue - d.value) / range) * chartHeight + padding
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="1.5"
                fill={color}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={x}
                cy={y}
                r="0.8"
                fill="white"
                className="dark:fill-zinc-900"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )
        })}
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-zinc-600 dark:text-zinc-400">
        <span>{data[0]?.label || ''}</span>
        <span>{data[Math.floor(data.length / 2)]?.label || ''}</span>
        <span>{data[data.length - 1]?.label || ''}</span>
      </div>
    </div>
  )
}
