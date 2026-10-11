interface SliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  ariaLabel: string
  formatLabel?: (value: number) => string
}

export function Slider({ min, max, step, value, onChange, ariaLabel, formatLabel }: SliderProps) {
  const clamped = Math.min(Math.max(value, min), max)
  const percent = ((clamped - min) / (max - min)) * 100

  return (
    <div className="w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range w-full cursor-pointer"
        style={{ ['--percent' as string]: `${percent}%` }}
      />
      {formatLabel && (
        <div className="flex justify-between text-xs text-neutral font-body mt-1">
          <span>{formatLabel(min)}</span>
          <span>{formatLabel(max)}</span>
        </div>
      )}
    </div>
  )
}
