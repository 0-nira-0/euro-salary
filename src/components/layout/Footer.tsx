import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '../../store/calculatorStore'
import { DATA_YEAR, REPO_URL } from '../../config'

export function Footer() {
  const { t } = useTranslation()
  const country = useCalculatorStore((s) => s.input.country)
  const year = useCalculatorStore((s) => s.result?.year ?? DATA_YEAR)

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-3 text-xs font-body">
        <p className="text-neutral">{t(`legal.disclaimer_${country}`)}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400">
          <span>{t('country.data_year', { year })}</span>
          <span aria-hidden="true">·</span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded underline-offset-2 hover:text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary"
          >
            {t('footer.github')}
          </a>
        </p>
      </div>
    </footer>
  )
}
