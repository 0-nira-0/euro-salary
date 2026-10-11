import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Toggle } from '../ui/Toggle'
import { Slider } from '../ui/Slider'
import { useCalculatorStore } from '../../store/calculatorStore'
import { useDebounce } from '../../hooks/useDebounce'
import { useFormat } from '../../hooks/useFormat'
import { MAX_GROSS } from '../../config'
import type { Direction } from '../../tax-engine/types'
import type { Period } from '../../lib/shareUrl'

const SLIDER_MIN = 15_000
const SLIDER_MAX = 250_000

function parseAmount(raw: string, monthly: boolean): number {
  const digits = raw.replace(/\D/g, '')
  const value = Math.min(Number(digits) || 0, MAX_GROSS)
  return monthly ? value * 12 : value
}

export function SalaryInput() {
  const { t } = useTranslation()
  const fmt = useFormat()
  const input = useCalculatorStore((s) => s.input)
  const setInput = useCalculatorStore((s) => s.setInput)
  const period = useCalculatorStore((s) => s.period)
  const setPeriod = useCalculatorStore((s) => s.setPeriod)
  const monthly = period === 'monthly'

  const display = (annual: number) =>
    annual > 0 ? fmt.integer(monthly ? annual / 12 : annual) : ''

  const [raw, setRaw] = useState(() => display(input.grossAnnual))
  const debouncedRaw = useDebounce(raw, 250)

  // Store → field: slider, share link, period switch… whatever changed the
  // salary elsewhere is reflected here. Typing is left alone (it already matches).
  useEffect(() => {
    if (parseAmount(raw, monthly) !== input.grossAnnual) setRaw(display(input.grossAnnual))
  }, [input.grossAnnual, monthly]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-group digits when the UI language (and so the separator) changes.
  useEffect(() => {
    setRaw(display(input.grossAnnual))
  }, [fmt.locale]) // eslint-disable-line react-hooks/exhaustive-deps

  // Field → store (debounced). Ignore a stale debounce if the field moved on.
  useEffect(() => {
    if (debouncedRaw !== raw) return
    const annual = parseAmount(debouncedRaw, monthly)
    if (annual !== input.grossAnnual) setInput({ grossAnnual: annual })
  }, [debouncedRaw]) // eslint-disable-line react-hooks/exhaustive-deps

  const empty = input.grossAnnual <= 0

  return (
    <div className="bg-white rounded border border-slate-200 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <span className="font-headline text-base font-semibold text-primary">
          {t('input.salary_label')}
        </span>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Toggle
            ariaLabel={t('input.direction_label')}
            options={[
              { value: 'gross_to_net', label: t('input.gross') },
              { value: 'net_to_gross', label: t('input.net') },
            ]}
            value={input.direction}
            onChange={(v) => setInput({ direction: v as Direction })}
          />
          <Toggle
            ariaLabel={t('input.period_label')}
            options={[
              { value: 'annual', label: t('input.annual') },
              { value: 'monthly', label: t('input.monthly') },
            ]}
            value={period}
            onChange={(v) => setPeriod(v as Period)}
          />
        </div>
      </div>

      <div className="relative">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral font-body text-xl font-medium select-none"
          aria-hidden="true"
        >
          €
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={() => setRaw(display(parseAmount(raw, monthly)))}
          className={`w-full pl-10 pr-4 py-3 sm:py-4 text-2xl sm:text-3xl font-headline font-bold text-primary border rounded focus:outline-none focus:ring-2 transition-colors ${
            empty
              ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
              : 'border-slate-200 focus:ring-tertiary focus:border-tertiary'
          }`}
          placeholder={fmt.integer(60_000)}
          aria-label={t('input.salary_label')}
          aria-invalid={empty}
          autoComplete="off"
        />
      </div>
      {empty && (
        <p role="status" className="mt-2 text-xs font-body text-red-600 animate-fade-in-up">
          {t('input.empty_hint')}
        </p>
      )}

      <div className="mt-3">
        <Slider
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={1000}
          value={input.grossAnnual}
          ariaLabel={t('input.salary_label')}
          onChange={(annual) => setInput({ grossAnnual: annual })}
          formatLabel={(v) => fmt.money(monthly ? v / 12 : v)}
        />
      </div>
    </div>
  )
}
