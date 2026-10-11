import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '../store/calculatorStore'
import { buildShareUrl } from '../lib/shareUrl'

// Clipboard API needs a secure context; fall back to execCommand elsewhere.
async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      document.body.removeChild(area)
    }
  }
}

export function useShareUrl() {
  const { i18n } = useTranslation()
  const input = useCalculatorStore((s) => s.input)
  const period = useCalculatorStore((s) => s.period)

  const getShareUrl = useCallback(
    () =>
      buildShareUrl(
        input,
        period,
        i18n.language,
        `${window.location.origin}${window.location.pathname}`
      ),
    [input, period, i18n.language]
  )

  const copyToClipboard = useCallback(
    () => writeToClipboard(getShareUrl()),
    [getShareUrl]
  )

  return { getShareUrl, copyToClipboard }
}
