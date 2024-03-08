import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '../../store/calculatorStore'
import { ResultCard } from './ResultCard'
import type { Country } from '../../tax-engine/types'

const COUNTRIES: { code: Country; flag: string; name: string }[] = [
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: 'BE', flag: '🇧🇪', name: 'Belgium' },
  { code: 'PL', flag: '🇵🇱', name: 'Poland' },
]

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function CompareMode() {
  const { t } = useTranslation()
  const { result, compareResult, compareInput, setCompareCountry, input } = useCalculatorStore()

  if (!result) return null

  // Bar chart SVG — comparing two results
  const maxNet = Math.max(result.netAnnual, compareResult?.netAnnual ?? 0)
  const BAR_MAX_W = 180

  function barWidth(value: number) {
    return maxNet > 0 ? (value / maxNet) * BAR_MAX_W : 0
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-body text-neutral mb-2 font-medium">
            {COUNTRIES.find((c) => c.code === input.country)?.flag}{' '}
            {t(`country.${input.country}`)}
          </p>
          <ResultCard result={result} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-body text-neutral font-medium">
              {t('nav.compare')}:
            </p>
            <select
              value={compareInput?.country ?? 'DE'}
              onChange={(e) => setCompareCountry(e.target.value as Country)}
              className="text-xs border border-slate-200 rounded px-2 py-1 font-body text-primary focus:outline-none focus:border-tertiary"
            >
              {COUNTRIES.filter((c) => c.code !== input.country).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
          {compareResult ? (
            <ResultCard result={compareResult} highlight />
          ) : (
            <div className="bg-white rounded border border-slate-200 p-5 text-center text-neutral text-sm font-body">
              Select a country to compare
            </div>
          )}
        </div>
      </div>

      {/* Bar chart */}
      {compareResult && (
        <div className="bg-white rounded border border-slate-200 p-5">
          <h3 className="font-headline text-sm font-semibold text-primary mb-4">
            Annual comparison
          </h3>

          <svg viewBox={`0 0 ${BAR_MAX_W * 2 + 120} 160`} className="w-full max-w-lg mx-auto">
            {/* Country 1 bars */}
            {[
              { label: t('input.net'), v1: result.netAnnual, v2: compareResult.netAnnual, color1: '#059669', color2: '#10B981', y: 20 },
              { label: t('result.employee_contributions'), v1: result.totalEmployeeDeductions, v2: compareResult.totalEmployeeDeductions, color1: '#2563EB', color2: '#60A5FA', y: 65 },
              { label: t('result.income_tax'), v1: result.totalIncomeTax, v2: compareResult.totalIncomeTax, color1: '#DC2626', color2: '#F87171', y: 110 },
            ].map((row) => (
              <g key={row.label}>
                <text x="0" y={row.y + 10} fontSize="9" fill="#64748B" fontFamily="Inter, sans-serif">
                  {row.label.length > 18 ? row.label.slice(0, 16) + '…' : row.label}
                </text>
                <rect x="110" y={row.y} width={barWidth(row.v1)} height="18" fill={row.color1} rx="2" />
                <text x={110 + barWidth(row.v1) + 4} y={row.y + 12} fontSize="9" fill="#002366" fontFamily="Inter, sans-serif">
                  €{fmt(row.v1)}
                </text>
                <rect x="110" y={row.y + 22} width={barWidth(row.v2)} height="18" fill={row.color2} rx="2" />
                <text x={110 + barWidth(row.v2) + 4} y={row.y + 34} fontSize="9" fill="#002366" fontFamily="Inter, sans-serif">
                  €{fmt(row.v2)}
                </text>
              </g>
            ))}
          </svg>

          <div className="flex gap-4 justify-center mt-2 text-xs font-body text-neutral">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block bg-[#002366]" />
              {t(`country.${input.country}`)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block bg-[#059669]" />
              {t(`country.${compareInput?.country ?? 'DE'}`)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
