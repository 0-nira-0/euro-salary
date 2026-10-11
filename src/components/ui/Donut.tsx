import { useEffect, useState } from 'react'

export interface DonutSlice {
  value: number
  color: string
  title: string
}

interface DonutProps {
  slices: DonutSlice[]
  label: string
  className?: string
}

const R = 38
const C = 2 * Math.PI * R
const GAP = 0.8

// Ring chart. Each segment is a stroked circle, so changes to the dash values
// are animated by plain CSS transitions (and the first render "draws" the ring).
export function Donut({ slices, label, className = 'w-28 h-28' }: DonutProps) {
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const total = slices.reduce((sum, s) => sum + Math.max(0, s.value), 0)
  let offset = 0

  return (
    <svg viewBox="0 0 100 100" className={`shrink-0 ${className}`} role="img" aria-label={label}>
      <g transform="rotate(-90 50 50)">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#e2e8f0" strokeWidth="16" />
        {slices.map((slice) => {
          const fraction = total > 0 && drawn ? Math.max(0, slice.value) / total : 0
          const length = Math.max(0, fraction * C - (fraction > 0 && fraction < 1 ? GAP : 0))
          const start = offset
          offset += fraction * C
          return (
            <circle
              key={slice.color}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={slice.color}
              strokeWidth="16"
              style={{
                strokeDasharray: `${length} ${C - length}`,
                strokeDashoffset: -start,
                transition: 'stroke-dasharray 700ms cubic-bezier(.22,1,.36,1), stroke-dashoffset 700ms cubic-bezier(.22,1,.36,1)',
              }}
            >
              <title>{slice.title}</title>
            </circle>
          )
        })}
      </g>
    </svg>
  )
}
