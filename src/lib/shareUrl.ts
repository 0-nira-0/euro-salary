import { isLanguage } from './languages'
import { MAX_CHILDREN, MAX_GROSS } from '../config'
import {
  COUNTRIES,
  DIRECTIONS,
  FAMILY_STATUSES,
  type CalculatorInput,
} from '../tax-engine/types'

export type Period = 'annual' | 'monthly'

export interface SharedState {
  input: Partial<CalculatorInput>
  period?: Period
}

function oneOf<T extends string>(list: readonly T[], value: string | null): T | undefined {
  return list.find((item) => item === value)
}

// Reads a share link defensively: every field is validated on its own, so a
// broken parameter is dropped instead of breaking the whole calculator.
export function parseShareParams(search: string): SharedState {
  const params = new URLSearchParams(search)
  const input: Partial<CalculatorInput> = {}

  const country = oneOf(COUNTRIES, params.get('c'))
  if (country) input.country = country

  const rawGross = params.get('g')
  const gross = rawGross === null ? NaN : Number(rawGross)
  if (Number.isFinite(gross) && gross > 0) input.grossAnnual = Math.min(Math.round(gross), MAX_GROSS)

  const direction = oneOf(DIRECTIONS, params.get('d'))
  if (direction) input.direction = direction

  const family = oneOf(FAMILY_STATUSES, params.get('f'))
  if (family) input.familyStatus = family

  const rawKids = params.get('k')
  const kids = rawKids === null ? NaN : Number(rawKids)
  if (Number.isInteger(kids) && kids >= 0 && kids <= MAX_CHILDREN) input.numChildren = kids

  return { input, period: oneOf(['annual', 'monthly'] as const, params.get('p')) }
}

export function buildShareUrl(
  input: CalculatorInput,
  period: Period,
  language: string,
  base: string
): string {
  const params = new URLSearchParams({
    c: input.country,
    g: String(Math.round(input.grossAnnual)),
    d: input.direction,
    f: input.familyStatus,
    k: String(input.numChildren),
    p: period,
  })
  if (isLanguage(language)) params.set('l', language)
  return `${base}?${params.toString()}`
}
