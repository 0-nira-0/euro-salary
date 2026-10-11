import { useTranslation } from 'react-i18next'
import { COUNTRIES } from '../tax-engine/types'
import { COUNTRY_FLAGS } from '../lib/countries'
import { DATA_YEAR } from '../config'

const HOW_IT_WORKS = ['how_1', 'how_2', 'how_3', 'how_4'] as const

export function About() {
  const { t } = useTranslation()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h2 className="font-headline text-2xl font-bold text-primary mb-3">{t('about.title')}</h2>
      <p className="font-body text-neutral mb-8 leading-relaxed">{t('about.intro')}</p>

      <h3 className="font-headline text-lg font-semibold text-primary mb-4">
        {t('about.countries_title')}
      </h3>
      <div className="grid sm:grid-cols-2 gap-3 mb-10">
        {COUNTRIES.map((code) => (
          <div key={code} className="bg-white rounded border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-hidden="true">{COUNTRY_FLAGS[code]}</span>
              <span className="font-headline font-semibold text-primary">{t(`country.${code}`)}</span>
            </div>
            <p className="text-xs font-body text-neutral">{t(`about.notes.${code}`)}</p>
          </div>
        ))}
      </div>

      <h3 className="font-headline text-lg font-semibold text-primary mb-3">{t('about.how_title')}</h3>
      <ul className="font-body text-sm text-neutral space-y-2 list-disc list-inside mb-8">
        {HOW_IT_WORKS.map((key) => (
          <li key={key}>{t(`about.${key}`)}</li>
        ))}
      </ul>

      <p className="text-xs text-neutral font-body border-t border-slate-200 pt-4">
        {t('about.note', { year: DATA_YEAR })}
      </p>
    </div>
  )
}
