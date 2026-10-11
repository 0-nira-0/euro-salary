import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const LOCALES: Record<string, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  pl: 'pl-PL',
}

// One place for number formatting so every figure follows the UI language.
export function useFormat() {
  const { i18n } = useTranslation()
  const locale = LOCALES[i18n.language] ?? 'en-GB'

  return useMemo(() => {
    const money = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    })
    const integer = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
    const percents = new Map<number, Intl.NumberFormat>()

    return {
      locale,
      money: (n: number) => money.format(Math.round(n)),
      integer: (n: number) => integer.format(Math.round(n)),
      percent: (n: number, digits = 1) => {
        let fmt = percents.get(digits)
        if (!fmt) {
          fmt = new Intl.NumberFormat(locale, {
            style: 'percent',
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
          })
          percents.set(digits, fmt)
        }
        return fmt.format(n)
      },
    }
  }, [locale])
}
