import { create } from 'zustand'
import type { CalculatorInput, Country, TaxResult } from '../tax-engine/types'
import { calculateFromInput } from '../tax-engine/engine'
import { parseShareParams, type Period } from '../lib/shareUrl'

interface CalculatorState {
  input: CalculatorInput
  result: TaxResult | null
  // The comparison always mirrors `input` (salary, family, direction…) and only
  // swaps the country, so it can never go stale.
  compareCountry: Country
  compareResult: TaxResult | null
  period: Period
  setInput: (patch: Partial<CalculatorInput>) => void
  setCompareCountry: (country: Country) => void
  setPeriod: (period: Period) => void
}

export const DEFAULT_INPUT: CalculatorInput = {
  country: 'FR',
  grossAnnual: 55_000,
  direction: 'gross_to_net',
  employmentType: 'employee',
  familyStatus: 'single',
  numChildren: 0,
}

function safeCalculate(input: CalculatorInput): TaxResult | null {
  try {
    if (input.grossAnnual <= 0) return null
    return calculateFromInput(input)
  } catch {
    return null
  }
}

// Never compare a country with itself.
export function pickCompareCountry(main: Country, preferred: Country): Country {
  if (preferred !== main) return preferred
  return main === 'DE' ? 'FR' : 'DE'
}

function derive(input: CalculatorInput, preferredCompare: Country) {
  const compareCountry = pickCompareCountry(input.country, preferredCompare)
  return {
    input,
    result: safeCalculate(input),
    compareCountry,
    compareResult: safeCalculate({ ...input, country: compareCountry }),
  }
}

// A share link is applied here, before the first render, so the page never
// flashes the default values.
const shared = typeof window !== 'undefined' ? parseShareParams(window.location.search) : null

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  ...derive({ ...DEFAULT_INPUT, ...shared?.input }, 'DE'),
  period: shared?.period ?? 'annual',

  setInput: (patch) => {
    set(derive({ ...get().input, ...patch }, get().compareCountry))
  },

  setCompareCountry: (country) => {
    set(derive(get().input, country))
  },

  setPeriod: (period) => set({ period }),
}))
