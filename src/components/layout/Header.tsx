import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
]

export function Header() {
  const { t, i18n } = useTranslation()

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            {t('app.title')}
          </h1>
          <p className="text-blue-200 text-sm mt-0.5 font-body hidden sm:block">
            {t('app.tagline')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`px-2.5 py-1 rounded text-sm font-body font-medium transition-colors ${
                i18n.language === lang.code
                  ? 'bg-white text-primary'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
