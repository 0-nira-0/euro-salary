import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from '../ui/Tooltip'
import { Collapse } from '../ui/Collapse'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { useFormat } from '../../hooks/useFormat'
import type { TaxResult, ContributionLine } from '../../tax-engine/types'

// One grid for the header and every row keeps the columns aligned.
// On phones Base/Rate collapse into a sub-line under the label.
const ROW = 'grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_6rem_4.5rem_6rem] items-center gap-x-3'

interface SectionProps {
  title: string
  lines: ContributionLine[]
  total: number
  sign: '−' | '+'
  accentColor: string
}

function Section({ title, lines, total, sign, accentColor }: SectionProps) {
  const { t } = useTranslation()
  const fmt = useFormat()
  const [open, setOpen] = useState(true)
  const id = useId()

  return (
    <div className="border border-slate-200 rounded overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tertiary"
      >
        <span className="font-headline text-sm font-semibold text-primary text-left">{title}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-headline text-sm font-bold tabular-nums" style={{ color: accentColor }}>
            {sign}
            <AnimatedNumber value={total} format={fmt.money} />
          </span>
          <svg
            className={`w-4 h-4 text-neutral transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <Collapse open={open} id={id}>
        <ul className="text-xs font-body">
          {lines.map((line, i) => (
            <li
              key={`${line.labelKey}-${i}`}
              className={`${ROW} border-t border-slate-100 px-4 py-2.5 hover:bg-slate-50 transition-colors`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-primary">
                  <span>{t(line.labelKey)}</span>
                  {line.legalReference && (
                    <Tooltip content={line.legalReference} align="start">
                      <span
                        aria-label={line.legalReference}
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold cursor-help"
                      >
                        §
                      </span>
                    </Tooltip>
                  )}
                </div>
                <p className="sm:hidden mt-0.5 text-neutral tabular-nums">
                  {fmt.money(line.baseAmount)} × {fmt.percent(line.rate, 2)}
                </p>
              </div>
              <span className="hidden sm:block text-right text-neutral tabular-nums">
                {fmt.money(line.baseAmount)}
              </span>
              <span className="hidden sm:block text-right text-neutral tabular-nums">
                {fmt.percent(line.rate, 2)}
              </span>
              <span className="text-right font-medium text-primary tabular-nums whitespace-nowrap">
                {fmt.money(line.amount)}
              </span>
            </li>
          ))}
        </ul>
      </Collapse>
    </div>
  )
}

export function BreakdownTable({ result }: { result: TaxResult }) {
  const { t } = useTranslation()
  const fmt = useFormat()

  return (
    <div className="space-y-3">
      <div
        className={`${ROW} px-4 py-2 bg-slate-100 rounded border border-slate-200 text-xs font-body text-neutral font-medium`}
        aria-hidden="true"
      >
        <span>{t('table.label')}</span>
        <span className="hidden sm:block text-right">{t('table.base')}</span>
        <span className="hidden sm:block text-right">{t('table.rate')}</span>
        <span className="text-right">{t('table.amount')}</span>
      </div>

      <Section
        title={t('result.employee_contributions')}
        lines={result.employeeContributions}
        total={result.totalEmployeeDeductions}
        sign="−"
        accentColor="#2563EB"
      />
      <Section
        title={t('result.income_tax')}
        lines={result.incomeTaxLines}
        total={result.totalIncomeTax}
        sign="−"
        accentColor="#DC2626"
      />
      <Section
        title={t('result.employer_contributions')}
        lines={result.employerContributions}
        total={result.totalEmployerContributions}
        sign="+"
        accentColor="#64748B"
      />

      <div className="flex items-center justify-between px-4 py-3 bg-primary text-white rounded font-headline text-sm font-bold">
        <span>{t('result.net_monthly')}</span>
        <span className="text-emerald-300 text-lg tabular-nums">
          <AnimatedNumber value={result.netMonthly} format={fmt.money} />
        </span>
      </div>
    </div>
  )
}
