import { describe, it, expect } from 'vitest'
import { calculateFromInput, netToGross } from '../engine'
import type { CalculatorInput } from '../types'

const base: CalculatorInput = {
  country: 'FR',
  grossAnnual: 0,
  direction: 'gross_to_net',
  employmentType: 'employee',
  familyStatus: 'single',
  numChildren: 0,
}

describe('Edge cases', () => {
  it('zero gross returns zero net', () => {
    const result = calculateFromInput({ ...base, grossAnnual: 0 })
    expect(result.netAnnual).toBe(0)
    expect(result.effectiveTaxRate).toBe(0)
  })

  it('very high salary still computes (1 000 000 €)', () => {
    const countries: CalculatorInput['country'][] = ['FR', 'DE', 'ES', 'IT', 'BE', 'PL']
    for (const country of countries) {
      const result = calculateFromInput({ ...base, country, grossAnnual: 1_000_000 })
      expect(result.netAnnual).toBeGreaterThan(0)
      expect(result.effectiveTaxRate).toBeLessThan(1)
    }
  })

  it('net-to-gross round-trips within 1 € for all countries', () => {
    const countries: CalculatorInput['country'][] = ['FR', 'DE', 'ES', 'IT', 'BE', 'PL']
    for (const country of countries) {
      const forward = calculateFromInput({ ...base, country, grossAnnual: 50_000 })
      const inferredGross = netToGross(forward.netAnnual, { ...base, country })
      const roundTrip = calculateFromInput({ ...base, country, grossAnnual: inferredGross })
      expect(Math.abs(roundTrip.netAnnual - forward.netAnnual)).toBeLessThan(1)
    }
  })

  it('4 children lowers French IR vs 0 children', () => {
    const noKids = calculateFromInput({ ...base, grossAnnual: 80_000 })
    const fourKids = calculateFromInput({ ...base, grossAnnual: 80_000, numChildren: 4 })
    expect(fourKids.totalIncomeTax).toBeLessThan(noKids.totalIncomeTax)
  })
})
