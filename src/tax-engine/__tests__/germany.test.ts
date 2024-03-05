import { describe, it, expect } from 'vitest'
import { calculateGermany } from '../countries/germany'
import type { CalculatorInput } from '../types'

const baseInput: CalculatorInput = {
  country: 'DE',
  grossAnnual: 60_000,
  direction: 'gross_to_net',
  employmentType: 'employee',
  familyStatus: 'single',
  numChildren: 0,
}

describe('Germany — golden tests', () => {
  it('Steuerklasse I, 60 000 € Brutto', () => {
    const result = calculateGermany(baseInput)

    // Netto monatlich ca. 3 000–3 500 € (Steuerklasse I)
    expect(result.netMonthly).toBeGreaterThan(2_800)
    expect(result.netMonthly).toBeLessThan(3_600)

    expect(result.country).toBe('DE')
    expect(result.year).toBe(2024)
  })

  it('Effektivsteuersatz liegt zwischen 25% und 45%', () => {
    const result = calculateGermany(baseInput)
    expect(result.effectiveTaxRate).toBeGreaterThan(0.25)
    expect(result.effectiveTaxRate).toBeLessThan(0.45)
  })

  it('Verheiratet Steuerklasse III, 80 000 €', () => {
    const result = calculateGermany({
      ...baseInput,
      grossAnnual: 80_000,
      familyStatus: 'married_1income',
    })
    // Klasse III hat günstigeren Steuersatz
    const singleResult = calculateGermany({ ...baseInput, grossAnnual: 80_000 })
    expect(result.totalIncomeTax).toBeLessThan(singleResult.totalIncomeTax)
  })

  it('alle Beitragszeilen haben legalReference', () => {
    const result = calculateGermany(baseInput)
    const allLines = [
      ...result.employeeContributions,
      ...result.employerContributions,
      ...result.incomeTaxLines,
    ]
    for (const line of allLines) {
      expect(line.legalReference.length).toBeGreaterThan(0)
    }
  })

  it('Netto < Brutto', () => {
    const result = calculateGermany(baseInput)
    expect(result.netAnnual).toBeLessThan(result.grossAnnual)
  })
})
