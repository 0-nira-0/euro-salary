import { describe, it, expect } from 'vitest'
import { calculateBelgium } from '../countries/belgium'
import type { CalculatorInput } from '../types'

const baseInput: CalculatorInput = {
  country: 'BE',
  grossAnnual: 60_000,
  direction: 'gross_to_net',
  employmentType: 'employee',
  familyStatus: 'single',
  numChildren: 0,
}

describe('Belgium — golden tests', () => {
  it('célibataire sans enfant, 60 000 € brut', () => {
    const result = calculateBelgium(baseInput)
    expect(result.netMonthly).toBeGreaterThan(2_400)
    expect(result.netMonthly).toBeLessThan(3_200)
    expect(result.country).toBe('BE')
    expect(result.year).toBe(2024)
  })

  it('ONSS 13.07% sans plafond représente une charge significative', () => {
    const result = calculateBelgium(baseInput)
    const onss = result.employeeContributions.find((c) => c.labelKey === 'contribution.social_security')
    expect(onss).toBeDefined()
    expect(onss!.rate).toBeCloseTo(0.1307, 4)
  })

  it('taux effectif entre 30% et 55%', () => {
    const result = calculateBelgium(baseInput)
    expect(result.effectiveTaxRate).toBeGreaterThan(0.30)
    expect(result.effectiveTaxRate).toBeLessThan(0.55)
  })

  it('net < brut et coût employeur > brut', () => {
    const result = calculateBelgium(baseInput)
    expect(result.netAnnual).toBeLessThan(result.grossAnnual)
    expect(result.employerCostAnnual).toBeGreaterThan(result.grossAnnual)
  })
})
