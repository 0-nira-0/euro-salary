import { describe, it, expect } from 'vitest'
import { calculateFrance } from '../countries/france'
import type { CalculatorInput } from '../types'

const baseInput: CalculatorInput = {
  country: 'FR',
  grossAnnual: 60_000,
  direction: 'gross_to_net',
  employmentType: 'employee',
  familyStatus: 'single',
  numChildren: 0,
}

describe('France — golden tests', () => {
  it('célibataire sans enfant, 60 000 € brut', () => {
    const result = calculateFrance(baseInput)

    // Net mensuel attendu ~3 200–3 400 € selon URSSAF estimateur
    expect(result.netMonthly).toBeGreaterThan(3_000)
    expect(result.netMonthly).toBeLessThan(3_600)

    // Taux effectif entre 30 et 40%
    expect(result.effectiveTaxRate).toBeGreaterThan(0.30)
    expect(result.effectiveTaxRate).toBeLessThan(0.42)

    expect(result.country).toBe('FR')
    expect(result.year).toBe(2024)
  })

  it('marié 2 enfants, 80 000 € brut', () => {
    const result = calculateFrance({
      ...baseInput,
      grossAnnual: 80_000,
      familyStatus: 'married',
      numChildren: 2,
    })

    expect(result.netAnnual).toBeGreaterThan(45_000)
    expect(result.netAnnual).toBeLessThan(65_000)
    // Quotient familial réduit l'IR
    expect(result.totalIncomeTax).toBeGreaterThan(0)
  })

  it('SMIC annuel ~21 203 €, faible imposition', () => {
    const result = calculateFrance({
      ...baseInput,
      grossAnnual: 21_203,
    })

    // Très peu ou pas d'IR au SMIC
    expect(result.totalIncomeTax).toBeLessThan(1_000)
    expect(result.netMonthly).toBeGreaterThan(1_300)
  })

  it('toutes les lignes ont un legalReference', () => {
    const result = calculateFrance(baseInput)
    const allLines = [
      ...result.employeeContributions,
      ...result.employerContributions,
      ...result.incomeTaxLines,
    ]
    for (const line of allLines) {
      expect(line.legalReference.length).toBeGreaterThan(0)
    }
  })

  it('net < gross', () => {
    const result = calculateFrance(baseInput)
    expect(result.netAnnual).toBeLessThan(result.grossAnnual)
  })

  it('employer cost > gross', () => {
    const result = calculateFrance(baseInput)
    expect(result.employerCostAnnual).toBeGreaterThan(result.grossAnnual)
  })
})
