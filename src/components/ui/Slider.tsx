interface SliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  formatLabel?: (value: number) => string
}

export function Slider({ min, max, step, value, onChange, formatLabel }: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #002366 ${percent}%, #e2e8f0 ${percent}%)`,
        }}
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
