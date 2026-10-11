interface ToggleProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}

export function Toggle({ options, value, onChange, ariaLabel }: ToggleProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex rounded border border-slate-200 overflow-hidden"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`px-3 py-1.5 text-sm font-body font-medium transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tertiary ${
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
