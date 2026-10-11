import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import es from './locales/es.json'
import it from './locales/it.json'
import pl from './locales/pl.json'
import { isLanguage, type Language } from './lib/languages'

const STORAGE_KEY = 'euro-salary:lang'

// Priority: ?l= in a shared link → saved choice → browser language → English.
function detectLanguage(): Language {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('l')
    if (isLanguage(fromUrl)) return fromUrl
  } catch { /* no window / blocked */ }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isLanguage(saved)) return saved
  } catch { /* storage unavailable */ }
  const preferred = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : []
  for (const tag of preferred) {
    const code = tag?.slice(0, 2).toLowerCase()
    if (isLanguage(code)) return code
  }
  return 'en'
}

// Keep <html lang>, the tab title and the meta description in sync with the UI language.
function syncDocument(lng: string) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lng
  document.title = `${i18n.t('app.title')} — ${i18n.t('app.subtitle')}`
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', i18n.t('app.description'))
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
    it: { translation: it },
    pl: { translation: pl },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  initAsync: false,
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, lng)
  } catch { /* storage unavailable */ }
  syncDocument(lng)
})
syncDocument(i18n.language)

export default i18n
