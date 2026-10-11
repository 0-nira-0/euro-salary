import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '../../store/calculatorStore'
import { COUNTRIES } from '../../tax-engine/types'
import { COUNTRY_FLAGS } from '../../lib/countries'

export function CountrySelector() {
  const { t } = useTranslation()
  const country = useCalculatorStore((s) => s.input.country)
  const setInput = useCalculatorStore((s) => s.setInput)

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('a11y.select_country')}>
      {COUNTRIES.map((code) => {
        const active = country === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => setInput({ country: code })}
            role="radio"
            aria-checked={active}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded border font-body text-sm font-medium transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-1 ${
              active
                ? 'bg-primary text-white border-primary shadow-md sm:scale-105'
                : 'bg-white text-neutral border-slate-200 hover:border-primary hover:text-primary'
            }`}
          >
            <span className="text-xl leading-none" aria-hidden="true">{COUNTRY_FLAGS[code]}</span>
            <span>{t(`country.${code}`)}</span>
          </button>
        )
      })}
    </div>
  )
}
