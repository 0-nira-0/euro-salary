import { describe, it, expect } from 'vitest'
import { calculateFromInput, netToGross } from '../engine'
import type { CalculatorInput } from '../types'

const baseInput: CalculatorInput = {
  country: 'FR',
  grossAnnual: 60_000,
  direction: 'gross_to_net',
  employmentType: 'employee',
  familyStatus: 'single',
  numChildren: 0,
}

describe('engine — all countries', () => {
  const countries: CalculatorInput['country'][] = ['FR', 'DE', 'ES', 'IT', 'BE', 'PL']

  for (const country of countries) {
    it(`${country}: net < gross and employer cost > gross`, () => {
      const result = calculateFromInput({ ...baseInput, country })
      expect(result.netAnnual).toBeLessThan(result.grossAnnual)
      expect(result.employerCostAnnual).toBeGreaterThan(result.grossAnnual)
    })

    it(`${country}: effective rate > 0`, () => {
      const result = calculateFromInput({ ...baseInput, country })
      expect(result.effectiveTaxRate).toBeGreaterThan(0)
      expect(result.effectiveTaxRate).toBeLessThan(1)
    })
  }
})

describe('net → gross reverse calculation', () => {
  it('round-trips correctly for France', () => {
    const forwardResult = calculateFromInput(baseInput)
    const netTarget = forwardResult.netAnnual

    const inferredGross = netToGross(netTarget, baseInput)
    expect(inferredGross).toBeCloseTo(60_000, 0)
  })

  it('round-trips correctly for Germany', () => {
    const result = calculateFromInput({ ...baseInput, country: 'DE' })
    const inferredGross = netToGross(result.netAnnual, { ...baseInput, country: 'DE' })
    expect(inferredGross).toBeCloseTo(60_000, 0)
  })
})
