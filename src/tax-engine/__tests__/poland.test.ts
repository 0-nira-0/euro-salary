import { describe, it, expect } from 'vitest'
import { calculatePoland } from '../countries/poland'
import type { CalculatorInput } from '../types'

const baseInput: CalculatorInput = {
  country: 'PL',
  grossAnnual: 120_000,
  direction: 'gross_to_net',
  employmentType: 'employee',
  familyStatus: 'single',
  numChildren: 0,
}

describe('Poland — golden tests', () => {
  it('singiel bez dzieci, 120 000 PLN brutto', () => {
    const result = calculatePoland(baseInput)
    expect(result.netMonthly).toBeGreaterThan(5_000)
    expect(result.netMonthly).toBeLessThan(8_500)
    expect(result.country).toBe('PL')
    expect(result.year).toBe(2024)
  })

  it('kwota wolna 30 000 PLN — niski podatek przy niskim dochodzie', () => {
    const lowResult = calculatePoland({ ...baseInput, grossAnnual: 30_000 })
    expect(lowResult.totalIncomeTax).toBeLessThan(500)
  })

  it('netto < brutto i koszt pracodawcy > brutto', () => {
    const result = calculatePoland(baseInput)
    expect(result.netAnnual).toBeLessThan(result.grossAnnual)
    expect(result.employerCostAnnual).toBeGreaterThan(result.grossAnnual)
  })
})
