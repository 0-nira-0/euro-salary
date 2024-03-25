import { useTranslation } from 'react-i18next'
import type { TaxResult } from '../../tax-engine/types'

interface PieSlice {
  value: number
  color: string
  label: string
}

function PieChart({ slices }: { slices: PieSlice[] }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0)
  if (total === 0) return null

  let cumAngle = -Math.PI / 2
  const cx = 60
  const cy = 60
  const r = 54

  const paths = slices.map((sl) => {
    const angle = (sl.value / total) * 2 * Math.PI
    const x1 = cx + r * Math.cos(cumAngle)
    const y1 = cy + r * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx + r * Math.cos(cumAngle)
    const y2 = cy + r * Math.sin(cumAngle)
    const largeArc = angle > Math.PI ? 1 : 0
    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: sl.color,
      label: sl.label,
      value: sl.value,
    }
  })

  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

function fmt(n: number, currency = true) {
  const s = Math.abs(n).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return currency ? s : s
}

interface ResultCardProps {
  result: TaxResult
  highlight?: boolean
}

export function ResultCard({ result, highlight = false }: ResultCardProps) {
  const { t } = useTranslation()

  const pieSlices: PieSlice[] = [
    { value: result.netAnnual, color: '#059669', label: t('input.net') },
    { value: result.totalEmployeeDeductions, color: '#2563EB', label: t('result.employee_contributions') },
    { value: result.totalIncomeTax, color: '#DC2626', label: t('result.income_tax') },
  ]

  return (
    <div className={`bg-white rounded border ${highlight ? 'border-secondary shadow-md' : 'border-slate-200 shadow-sm'} p-5`}>
      <div className="flex items-start gap-4 mb-5">
        <PieChart slices={pieSlices} />

        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <p className="text-xs font-body text-neutral mb-0.5">{t('result.net_monthly')}</p>
            <p className="font-headline text-3xl font-bold text-secondary">
              €{fmt(result.netMonthly)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-body text-neutral mb-0.5">{t('result.net_annual')}</p>
              <p className="font-headline text-lg font-semibold text-primary">
                €{fmt(result.netAnnual)}
              </p>
            </div>
            <div>
              <p className="text-xs font-body text-neutral mb-0.5">{t('result.employer_cost')}</p>
              <p className="font-headline text-lg font-semibold text-primary">
                €{fmt(result.employerCostMonthly)}
                <span className="text-xs text-neutral font-normal">/mo</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded">
        <span className="text-xs font-body text-neutral">{t('result.effective_rate')}</span>
        <span className="font-headline font-bold text-primary text-sm">
          {(result.effectiveTaxRate * 100).toFixed(1)}%
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs font-body">
        {pieSlices.map((sl) => (
          <div key={sl.label} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: sl.color }} />
            <span className="text-neutral truncate">{sl.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
