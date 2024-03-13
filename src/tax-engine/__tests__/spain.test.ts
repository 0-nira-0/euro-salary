import { describe, it, expect } from 'vitest'
import { calculateSpain } from '../countries/spain'
import type { CalculatorInput } from '../types'

const baseInput: CalculatorInput = {
  country: 'ES',
  grossAnnual: 60_000,
  direction: 'gross_to_net',
  employmentType: 'employee',
  familyStatus: 'single',
  numChildren: 0,
}

describe('Spain — golden tests', () => {
  it('soltero sin hijos, 60 000 € bruto', () => {
    const result = calculateSpain(baseInput)
    expect(result.netMonthly).toBeGreaterThan(2_800)
    expect(result.netMonthly).toBeLessThan(3_600)
    expect(result.country).toBe('ES')
    expect(result.year).toBe(2024)
  })

  it('tipo efectivo entre 20% y 40%', () => {
    const result = calculateSpain(baseInput)
    expect(result.effectiveTaxRate).toBeGreaterThan(0.20)
    expect(result.effectiveTaxRate).toBeLessThan(0.40)
  })

  it('neto < bruto y coste empresa > bruto', () => {
    const result = calculateSpain(baseInput)
    expect(result.netAnnual).toBeLessThan(result.grossAnnual)
    expect(result.employerCostAnnual).toBeGreaterThan(result.grossAnnual)
  })

  it('todas las líneas tienen legalReference', () => {
    const result = calculateSpain(baseInput)
    const all = [...result.employeeContributions, ...result.employerContributions, ...result.incomeTaxLines]
    for (const line of all) {
      expect(line.legalReference.length).toBeGreaterThan(0)
    }
  })
})
