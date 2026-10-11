import { useTranslation } from 'react-i18next'
import { Donut, type DonutSlice } from '../ui/Donut'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { useFormat } from '../../hooks/useFormat'
import type { TaxResult } from '../../tax-engine/types'

interface ResultCardProps {
  result: TaxResult
  highlight?: boolean
  compact?: boolean
}

export function ResultCard({ result, highlight = false, compact = false }: ResultCardProps) {
  const { t } = useTranslation()
  const fmt = useFormat()

  const values = [
    { value: result.netAnnual, color: '#059669', label: t('input.net') },
    { value: result.totalEmployeeDeductions, color: '#2563EB', label: t('result.employee_contributions') },
    { value: result.totalIncomeTax, color: '#DC2626', label: t('result.income_tax') },
  ]
  const total = values.reduce((sum, v) => sum + v.value, 0)
  const share = (value: number) => (total > 0 ? value / total : 0)

  const slices: DonutSlice[] = values.map((v) => ({
    value: v.value,
    color: v.color,
    title: t('result.slice_title', {
      label: v.label,
      value: fmt.money(v.value),
      percent: fmt.percent(share(v.value), 0),
    }),
  }))

  const money = fmt.money
  const perMonth = t('result.per_month')
  const border = highlight ? 'border-secondary shadow-md' : 'border-slate-200 shadow-sm'

  const legend = (
    <ul className="space-y-1.5 text-xs font-body">
      {values.map((v) => (
        <li key={v.color} className="flex items-center gap-1.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: v.color }} />
          <span className="text-neutral truncate">{v.label}</span>
          <span className="ml-auto font-medium text-primary tabular-nums">
            {fmt.percent(share(v.value), 0)}
          </span>
        </li>
      ))}
    </ul>
  )

  if (compact) {
    return (
      <div className={`bg-white rounded border ${border} p-3 transition-shadow`}>
        <div className="flex justify-center mb-3">
          <Donut slices={slices} label={t('result.title')} className="w-24 h-24" />
        </div>
        <div className="text-center mb-3">
          <p className="text-xs font-body text-neutral mb-0.5">{t('result.net_monthly')}</p>
          <p className="font-headline text-2xl font-bold text-secondary tabular-nums">
            <AnimatedNumber value={result.netMonthly} format={money} />
          </p>
        </div>
        <dl className="space-y-1.5 text-xs font-body">
          <div className="flex justify-between gap-2">
            <dt className="text-neutral">{t('result.gross_annual')}</dt>
            <dd className="font-semibold text-primary tabular-nums">
              <AnimatedNumber value={result.grossAnnual} format={money} />
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-neutral">{t('result.net_annual')}</dt>
            <dd className="font-semibold text-primary tabular-nums">
              <AnimatedNumber value={result.netAnnual} format={money} />
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-neutral">{t('result.employer_cost')}</dt>
            <dd className="font-semibold text-primary tabular-nums">
              <AnimatedNumber value={result.employerCostMonthly} format={money} />
              <span className="text-neutral font-normal">{perMonth}</span>
            </dd>
          </div>
          <div className="flex justify-between gap-2 pt-1 border-t border-slate-100">
            <dt className="text-neutral">{t('result.effective_rate')}</dt>
            <dd className="font-bold text-primary tabular-nums">
              <AnimatedNumber value={result.effectiveTaxRate} format={(n) => fmt.percent(n, 1)} />
            </dd>
          </div>
        </dl>
        <div className="mt-3">{legend}</div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded border ${border} p-4 sm:p-5`}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start mb-5">
        <Donut slices={slices} label={t('result.title')} />

        <div className="flex-1 min-w-0 w-full">
          <div className="mb-3 text-center sm:text-left">
            <p className="text-xs font-body text-neutral mb-0.5">{t('result.net_monthly')}</p>
            <p className="font-headline text-3xl font-bold text-secondary tabular-nums">
              <AnimatedNumber value={result.netMonthly} format={money} />
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
            {[
              { label: t('result.gross_annual'), value: result.grossAnnual, suffix: '' },
              { label: t('result.net_annual'), value: result.netAnnual, suffix: '' },
              { label: t('result.gross_monthly'), value: result.grossMonthly, suffix: '' },
              { label: t('result.employer_cost'), value: result.employerCostMonthly, suffix: perMonth },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-body text-neutral mb-0.5">{item.label}</dt>
                <dd className="font-headline text-base sm:text-lg font-semibold text-primary tabular-nums">
                  <AnimatedNumber value={item.value} format={money} />
                  {item.suffix && (
                    <span className="text-xs text-neutral font-normal">{item.suffix}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded">
        <span className="text-xs font-body text-neutral">{t('result.effective_rate')}</span>
        <span className="font-headline font-bold text-primary text-sm tabular-nums">
          <AnimatedNumber value={result.effectiveTaxRate} format={(n) => fmt.percent(n, 1)} />
        </span>
      </div>

      <div className="mt-3">{legend}</div>
    </div>
  )
}
