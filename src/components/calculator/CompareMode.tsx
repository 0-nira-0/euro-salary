import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '../../store/calculatorStore'
import { ResultCard } from './ResultCard'
import { COUNTRIES, type Country } from '../../tax-engine/types'
import { COUNTRY_FLAGS } from '../../lib/countries'
import { useFormat } from '../../hooks/useFormat'
import type { TaxResult } from '../../tax-engine/types'

const COLOR_A = '#002366'
const COLOR_B = '#0D9488'

interface MetricRowProps {
  label: string
  a: number
  b: number
  max: number
  nameA: string
  nameB: string
}

function Bar({ value, max, color, name }: { value: number; max: number; color: string; name: string }) {
  const fmt = useFormat()
  const width = max > 0 ? Math.max(0, (value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 shrink-0 text-[10px] font-medium text-neutral" aria-hidden="true">{name}</span>
      <div className="relative h-4 flex-1 rounded-sm bg-slate-100">
        <div
          className="h-full rounded-sm transition-[width] duration-700 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-xs font-medium text-primary tabular-nums">
        {fmt.money(value)}
      </span>
    </div>
  )
}

function MetricRow({ label, a, b, max, nameA, nameB }: MetricRowProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-neutral">{label}</p>
      <Bar value={a} max={max} color={COLOR_A} name={nameA} />
      <Bar value={b} max={max} color={COLOR_B} name={nameB} />
    </div>
  )
}

function metrics(r: TaxResult, t: (k: string) => string) {
  return [
    { label: t('input.net'), value: r.netAnnual },
    { label: t('result.employee_contributions'), value: r.totalEmployeeDeductions },
    { label: t('result.income_tax'), value: r.totalIncomeTax },
  ]
}

export function CompareMode() {
  const { t } = useTranslation()
  const fmt = useFormat()
  const result = useCalculatorStore((s) => s.result)
  const compareResult = useCalculatorStore((s) => s.compareResult)
  const compareCountry = useCalculatorStore((s) => s.compareCountry)
  const setCompareCountry = useCalculatorStore((s) => s.setCompareCountry)
  const country = useCalculatorStore((s) => s.input.country)

  if (!result) return null

  const rowsA = metrics(result, t)
  const rowsB = compareResult ? metrics(compareResult, t) : []
  const max = Math.max(...rowsA.map((r) => r.value), ...rowsB.map((r) => r.value))
  const diff = compareResult ? compareResult.netMonthly - result.netMonthly : 0

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-body text-neutral mb-2 font-medium h-7 flex items-center">
            <span aria-hidden="true" className="mr-1.5">{COUNTRY_FLAGS[country]}</span>
            {t(`country.${country}`)}
          </p>
          <ResultCard result={result} compact />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2 h-7">
            <label htmlFor="compare-country" className="text-xs font-body text-neutral font-medium">
              {t('nav.compare')}:
            </label>
            <select
              id="compare-country"
              value={compareCountry}
              onChange={(e) => setCompareCountry(e.target.value as Country)}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white font-body text-primary focus:outline-none focus:border-tertiary"
            >
              {COUNTRIES.filter((c) => c !== country).map((c) => (
                <option key={c} value={c}>
                  {COUNTRY_FLAGS[c]} {t(`country.${c}`)}
                </option>
              ))}
            </select>
          </div>
          {compareResult ? (
            <ResultCard result={compareResult} compact highlight />
          ) : (
            <div className="bg-white rounded border border-slate-200 p-5 text-center text-neutral text-sm font-body">
              {t('result.empty')}
            </div>
          )}
        </div>
      </div>

      {compareResult && (
        <div className="bg-white rounded border border-slate-200 p-4 sm:p-5 font-body">
          <h3 className="font-headline text-sm font-semibold text-primary mb-1">
            {t('compare.annual')}
          </h3>
          <p className="text-xs text-neutral mb-4" aria-live="polite">
            {Math.abs(diff) < 1
              ? t('compare.diff_equal')
              : t('compare.diff_more', {
                  country: t(`country.${diff > 0 ? compareCountry : country}`),
                  amount: fmt.money(Math.abs(diff)),
                })}
          </p>

          <div className="space-y-4">
            {rowsA.map((row, i) => (
              <MetricRow
                key={row.label}
                label={row.label}
                a={row.value}
                b={rowsB[i].value}
                max={max}
                nameA={country}
                nameB={compareCountry}
              />
            ))}
          </div>

          <div className="flex gap-4 justify-center mt-4 text-xs text-neutral">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: COLOR_A }} />
              {t(`country.${country}`)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: COLOR_B }} />
              {t(`country.${compareCountry}`)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
