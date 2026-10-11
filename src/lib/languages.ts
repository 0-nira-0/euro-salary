export const LANGUAGES = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'fr', short: 'FR', name: 'Français' },
  { code: 'de', short: 'DE', name: 'Deutsch' },
  { code: 'es', short: 'ES', name: 'Español' },
  { code: 'it', short: 'IT', name: 'Italiano' },
  { code: 'pl', short: 'PL', name: 'Polski' },
] as const

export type Language = (typeof LANGUAGES)[number]['code']

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((l) => l.code === value)
}
