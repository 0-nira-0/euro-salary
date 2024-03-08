import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '../../store/calculatorStore'

export function Footer() {
  const { t } = useTranslation()
  const { result } = useCalculatorStore()

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {result && (
          <p className="text-xs text-neutral font-body mb-3">
            {result.disclaimer}
          </p>
        )}
        <p className="text-xs text-slate-400 font-body">
          © 2024 EuroSalary — {t('app.subtitle')}. Data: {result?.year ?? 2024}.
        </p>
      </div>
    </footer>
  )
}
