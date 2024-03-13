import { describe, it, expect } from 'vitest'
import { calculateItaly } from '../countries/italy'
import type { CalculatorInput } from '../types'

const baseInput: CalculatorInput = {
  country: 'IT',
  grossAnnual: 60_000,
  direction: 'gross_to_net',
  employmentType: 'employee',
  familyStatus: 'single',
  numChildren: 0,
}

describe('Italy — golden tests', () => {
  it('single senza figli, 60 000 € lordo', () => {
    const result = calculateItaly(baseInput)
    expect(result.netMonthly).toBeGreaterThan(2_500)
    expect(result.netMonthly).toBeLessThan(3_400)
    expect(result.country).toBe('IT')
    expect(result.year).toBe(2024)
  })

  it('aliquota effettiva tra 25% e 45%', () => {
    const result = calculateItaly(baseInput)
    expect(result.effectiveTaxRate).toBeGreaterThan(0.25)
    expect(result.effectiveTaxRate).toBeLessThan(0.45)
  })

  it('netto < lordo e costo datore > lordo', () => {
    const result = calculateItaly(baseInput)
    expect(result.netAnnual).toBeLessThan(result.grossAnnual)
    expect(result.employerCostAnnual).toBeGreaterThan(result.grossAnnual)
  })
})
