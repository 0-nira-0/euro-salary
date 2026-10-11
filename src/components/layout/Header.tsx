import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../../lib/languages'
import { LanguageMenu } from '../ui/LanguageMenu'

export function Header() {
  const { t, i18n } = useTranslation()

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-headline text-2xl font-bold tracking-tight">{t('app.title')}</h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-0.5 font-body">{t('app.tagline')}</p>
        </div>

        {/* Tablet & phone: dropdown. Desktop: all languages at once. */}
        <LanguageMenu className="md:hidden shrink-0" />
        <div
          role="group"
          aria-label={t('a11y.language')}
          className="hidden md:flex items-center gap-1.5"
        >
          {LANGUAGES.map((lang) => {
            const active = i18n.language === lang.code
            return (
              <button
                key={lang.code}
                type="button"
                lang={lang.code}
                title={lang.name}
                aria-pressed={active}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`px-2.5 py-1 rounded text-sm font-body font-medium transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  active ? 'bg-white text-primary' : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {lang.short}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
