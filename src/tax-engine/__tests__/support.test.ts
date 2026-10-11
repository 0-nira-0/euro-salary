import { describe, it, expect } from 'vitest'
import { calculateFromInput } from '../engine'
import { SUPPORTED_OPTIONS } from '../support'
import { COUNTRIES, type CalculatorInput } from '../types'

const base: CalculatorInput = {
  country: 'FR',
  grossAnnual: 70_000,
  direction: 'gross_to_net',
  employmentType: 'employee',
  familyStatus: 'single',
  numChildren: 0,
}

// The UI greys out options an engine ignores — make sure that claim stays true.
describe('SUPPORTED_OPTIONS matches the engine', () => {
  for (const country of COUNTRIES) {
    it(`${country}: family status`, () => {
      const a = calculateFromInput({ ...base, country, familyStatus: 'single' })
      const b = calculateFromInput({ ...base, country, familyStatus: 'married_1income' })
      expect(a.netAnnual !== b.netAnnual).toBe(SUPPORTED_OPTIONS[country].family)
    })

    it(`${country}: children`, () => {
      const a = calculateFromInput({ ...base, country, numChildren: 0 })
      const b = calculateFromInput({ ...base, country, numChildren: 2 })
      expect(a.netAnnual !== b.netAnnual).toBe(SUPPORTED_OPTIONS[country].children)
    })
  }
})
