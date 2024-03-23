import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Toggle } from '../ui/Toggle'
import { useCalculatorStore } from '../../store/calculatorStore'
import { useDebounce } from '../../hooks/useDebounce'
import type { Direction } from '../../tax-engine/types'

const SLIDER_MIN = 15_000
const SLIDER_MAX = 250_000

function formatAmount(value: number, monthly: boolean): string {
  const v = monthly ? value / 12 : value
  return Math.round(v).toLocaleString('fr-FR')
}

function parseAmount(raw: string, monthly: boolean): number {
  const cleaned = raw.replace(/[^0-9]/g, '')
  const val = Number(cleaned) || 0
  return monthly ? val * 12 : val
}

export function SalaryInput() {
  const { t } = useTranslation()
  const { input, setInput } = useCalculatorStore()
  const [monthly, setMonthly] = useState(false)
  const [rawValue, setRawValue] = useState(() =>
    formatAmount(input.grossAnnual, false)
  )
  const debouncedRaw = useDebounce(rawValue, 300)

  // Sync external store changes (e.g. URL restore) back to display
  useEffect(() => {
    setRawValue(formatAmount(input.grossAnnual, monthly))
  }, [input.country]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const annual = parseAmount(debouncedRaw, monthly)
    if (annual > 0 && annual !== input.grossAnnual) {
      setInput({ grossAnnual: annual })
    }
  }, [debouncedRaw]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDirectionChange = (val: string) => {
    setInput({ direction: val as Direction })
  }

  const handlePeriodChange = (val: string) => {
    const isMonthly = val === 'monthly'
    setMonthly(isMonthly)
    setRawValue(formatAmount(input.grossAnnual, isMonthly))
  }

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const annual = Number(e.target.value)
    setInput({ grossAnnual: annual })
    setRawValue(formatAmount(annual, monthly))
  }

  const sliderPercent = ((input.grossAnnual - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100

  return (
    <div className="bg-white rounded border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="font-headline text-base font-semibold text-primary">
          {t('input.salary_label')}
        </span>
        <div className="flex items-center gap-3">
          <Toggle
            options={[
              { value: 'gross_to_net', label: t('input.gross') },
              { value: 'net_to_gross', label: t('input.net') },
            ]}
            value={input.direction}
            onChange={handleDirectionChange}
          />
          <Toggle
            options={[
              { value: 'annual', label: t('input.annual') },
              { value: 'monthly', label: t('input.monthly') },
            ]}
            value={monthly ? 'monthly' : 'annual'}
            onChange={handlePeriodChange}
          />
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral font-body text-xl font-medium select-none">
          €
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={rawValue}
          onChange={(e) => setRawValue(e.target.value)}
          className="w-full pl-10 pr-4 py-4 text-3xl font-headline font-bold text-primary border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary transition-colors"
          placeholder="60 000"
          aria-label={t('input.salary_label')}
          autoComplete="off"
        />
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={1000}
          value={Math.min(Math.max(input.grossAnnual, SLIDER_MIN), SLIDER_MAX)}
          onChange={handleSlider}
          className="w-full h-1.5 rounded appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #002366 ${sliderPercent}%, #e2e8f0 ${sliderPercent}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-neutral font-body mt-1">
          <span>€{(SLIDER_MIN / 1000).toFixed(0)}k</span>
          <span>€{(SLIDER_MAX / 1000).toFixed(0)}k</span>
        </div>
      </div>
    </div>
  )
}
