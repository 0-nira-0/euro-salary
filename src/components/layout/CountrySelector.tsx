import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '../../store/calculatorStore'
import type { Country } from '../../tax-engine/types'

const COUNTRIES: { code: Country; flag: string }[] = [
  { code: 'FR', flag: '🇫🇷' },
  { code: 'DE', flag: '🇩🇪' },
  { code: 'ES', flag: '🇪🇸' },
  { code: 'IT', flag: '🇮🇹' },
  { code: 'BE', flag: '🇧🇪' },
  { code: 'PL', flag: '🇵🇱' },
]

export function CountrySelector() {
  const { t } = useTranslation()
  const { input, setInput } = useCalculatorStore()

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select country">
      {COUNTRIES.map(({ code, flag }) => (
        <button
          key={code}
          onClick={() => setInput({ country: code })}
          role="radio"
          aria-checked={input.country === code}
          className={`flex items-center gap-2 px-4 py-2.5 rounded border font-body text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-1 ${
            input.country === code
              ? 'bg-primary text-white border-primary shadow-md scale-105'
              : 'bg-white text-neutral border-slate-200 hover:border-primary hover:text-primary'
          }`}
        >
          <span className="text-xl leading-none">{flag}</span>
          <span>{t(`country.${code}`)}</span>
        </button>
      ))}
    </div>
  )
}
