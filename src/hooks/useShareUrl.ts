import { useCallback } from 'react'
import { useCalculatorStore } from '../store/calculatorStore'

export function useShareUrl() {
  const { input } = useCalculatorStore()

  const getShareUrl = useCallback(() => {
    const params = new URLSearchParams({
      c: input.country,
      g: String(input.grossAnnual),
      d: input.direction,
      f: input.familyStatus,
      k: String(input.numChildren),
      et: input.employmentType,
    })
    if (input.regionCode) params.set('r', input.regionCode)
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }, [input])

  const copyToClipboard = useCallback(async () => {
    const url = getShareUrl()
    await navigator.clipboard.writeText(url)
    return url
  }, [getShareUrl])

  return { getShareUrl, copyToClipboard }
}

export function parseShareUrl(): Partial<import('../tax-engine/types').CalculatorInput> | null {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('c')) return null
  return {
    country: params.get('c') as import('../tax-engine/types').Country,
    grossAnnual: Number(params.get('g') ?? 60000),
    direction: (params.get('d') ?? 'gross_to_net') as import('../tax-engine/types').Direction,
    familyStatus: (params.get('f') ?? 'single') as import('../tax-engine/types').CalculatorInput['familyStatus'],
    numChildren: Number(params.get('k') ?? 0),
    employmentType: (params.get('et') ?? 'employee') as import('../tax-engine/types').EmploymentType,
    regionCode: params.get('r') ?? undefined,
  }
}
