import { describe, it, expect } from 'vitest'
import { buildShareUrl, parseShareParams } from '../shareUrl'
import type { CalculatorInput } from '../../tax-engine/types'

const input: CalculatorInput = {
  country: 'DE',
  grossAnnual: 72_500,
  direction: 'net_to_gross',
  employmentType: 'employee',
  familyStatus: 'married',
  numChildren: 2,
}

describe('share URL', () => {
  it('round-trips every shared field', () => {
    const url = buildShareUrl(input, 'monthly', 'fr', 'https://example.com/app/')
    const parsed = parseShareParams(url.slice(url.indexOf('?')))
    expect(parsed.input).toEqual({
      country: 'DE',
      grossAnnual: 72_500,
      direction: 'net_to_gross',
      familyStatus: 'married',
      numChildren: 2,
    })
    expect(parsed.period).toBe('monthly')
    expect(url).toContain('l=fr')
  })

  it('ignores unknown or malformed values field by field', () => {
    const parsed = parseShareParams('?c=XX&g=abc&d=sideways&f=complicated&k=99&p=weekly')
    expect(parsed.input).toEqual({})
    expect(parsed.period).toBeUndefined()
  })

  it('keeps valid fields when others are broken', () => {
    const parsed = parseShareParams('?c=PL&g=-5&k=3')
    expect(parsed.input).toEqual({ country: 'PL', numChildren: 3 })
  })

  it('clamps absurd salaries and rejects non-positive ones', () => {
    expect(parseShareParams('?g=999999999999').input.grossAnnual).toBe(10_000_000)
    expect(parseShareParams('?g=0').input.grossAnnual).toBeUndefined()
    expect(parseShareParams('?g=Infinity').input.grossAnnual).toBeUndefined()
  })

  it('returns an empty state without query params', () => {
    expect(parseShareParams('')).toEqual({ input: {}, period: undefined })
  })
})
