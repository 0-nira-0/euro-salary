interface ToggleProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function Toggle({ options, value, onChange }: ToggleProps) {
  return (
    <div className="inline-flex rounded border border-slate-200 overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm font-body font-medium transition-colors ${
            value === opt.value
              ? 'bg-primary text-white'
              : 'bg-white text-neutral hover:bg-slate-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
