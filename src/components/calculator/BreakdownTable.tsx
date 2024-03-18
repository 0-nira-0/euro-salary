import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from '../ui/Tooltip'
import type { TaxResult, ContributionLine } from '../../tax-engine/types'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function pct(n: number) {
  return (n * 100).toFixed(2) + '%'
}

interface SectionProps {
  title: string
  lines: ContributionLine[]
  total: number
  accentColor: string
}

function Section({ title, lines, total, accentColor }: SectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border border-slate-200 rounded overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="font-headline text-sm font-semibold text-primary">{title}</span>
        <div className="flex items-center gap-3">
          <span className="font-headline text-sm font-bold" style={{ color: accentColor }}>
            −€{fmt(total)}
          </span>
          <svg
            className={`w-4 h-4 text-neutral transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <table className="w-full text-xs font-body">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 text-primary">
                  <div className="flex items-center gap-1.5">
                    <span>{t(line.labelKey)}</span>
                    {line.legalReference && (
                      <Tooltip content={line.legalReference}>
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold cursor-help">
                          §
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-neutral text-right whitespace-nowrap">
                  €{fmt(line.baseAmount)}
                </td>
                <td className="px-3 py-2.5 text-neutral text-right whitespace-nowrap">
                  {pct(line.rate)}
                </td>
                <td className="px-4 py-2.5 text-right font-medium text-primary whitespace-nowrap">
                  €{fmt(line.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

interface BreakdownTableProps {
  result: TaxResult
}

export function BreakdownTable({ result }: BreakdownTableProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded border border-slate-200 mb-1">
        <span className="text-xs font-body text-neutral font-medium flex-1">Label</span>
        <span className="text-xs font-body text-neutral font-medium w-24 text-right hidden sm:block">Base</span>
        <span className="text-xs font-body text-neutral font-medium w-16 text-right hidden sm:block">Rate</span>
        <span className="text-xs font-body text-neutral font-medium w-20 text-right">Amount</span>
      </div>

      <Section
        title={t('result.employee_contributions')}
        lines={result.employeeContributions}
        total={result.totalEmployeeDeductions}
        accentColor="#2563EB"
      />

      <Section
        title={t('result.income_tax')}
        lines={result.incomeTaxLines}
        total={result.totalIncomeTax}
        accentColor="#DC2626"
      />

      <Section
        title={t('result.employer_contributions')}
        lines={result.employerContributions}
        total={result.totalEmployerContributions}
        accentColor="#64748B"
      />

      <div className="flex items-center justify-between px-4 py-3 bg-primary text-white rounded font-headline text-sm font-bold">
        <span>{t('result.net_monthly')}</span>
        <span className="text-secondary text-lg">€{fmt(result.netMonthly)}</span>
      </div>
    </div>
  )
}
