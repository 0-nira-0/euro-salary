import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '../../store/calculatorStore'

const CHILDREN_OPTIONS = [0, 1, 2, 3, 4]

export function OptionsPanel() {
  const { t } = useTranslation()
  const { input, setInput } = useCalculatorStore()
  const [open, setOpen] = useState(false)

  const familyOptions = [
    { value: 'single', label: t('options.single') },
    { value: 'married', label: t('options.married') },
    { value: 'married_1income', label: t('options.married_1income') },
    { value: 'single_parent', label: t('options.single_parent') },
  ] as const

  return (
    <div className="bg-white rounded border border-slate-200 shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 font-body text-sm font-medium text-neutral hover:text-primary transition-colors"
      >
        <span className="font-headline font-semibold text-primary text-sm">
          {t('options.title')}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-body font-medium text-neutral mb-1.5">
              {t('options.family_status')}
            </label>
            <select
              value={input.familyStatus}
              onChange={(e) =>
                setInput({ familyStatus: e.target.value as typeof input.familyStatus })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded font-body text-primary focus:outline-none focus:border-tertiary"
            >
              {familyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-neutral mb-1.5">
              {t('options.children')}
            </label>
            <div className="flex gap-1.5">
              {CHILDREN_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setInput({ numChildren: n })}
                  className={`flex-1 py-2 text-sm rounded border font-body font-medium transition-colors ${
                    input.numChildren === n
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-neutral border-slate-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
