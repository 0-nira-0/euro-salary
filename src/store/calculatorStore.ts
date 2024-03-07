import { create } from 'zustand'
import type { CalculatorInput, TaxResult, Country } from '../tax-engine/types'
import { calculateFromInput } from '../tax-engine/engine'

interface CalculatorState {
  input: CalculatorInput
  result: TaxResult | null
  compareInput: CalculatorInput | null
  compareResult: TaxResult | null
  compareMode: boolean
  setInput: (patch: Partial<CalculatorInput>) => void
  setCompareInput: (patch: Partial<CalculatorInput>) => void
  toggleCompareMode: () => void
  setCompareCountry: (country: Country) => void
}

const DEFAULT_INPUT: CalculatorInput = {
  country: 'FR',
  grossAnnual: 60_000,
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

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  input: DEFAULT_INPUT,
  result: safeCalculate(DEFAULT_INPUT),
  compareInput: null,
  compareResult: null,
  compareMode: false,

  setInput: (patch) => {
    const newInput = { ...get().input, ...patch }
    set({ input: newInput, result: safeCalculate(newInput) })
  },

  setCompareInput: (patch) => {
    const base = get().compareInput ?? { ...get().input, country: 'DE' as Country }
    const newInput = { ...base, ...patch }
    set({ compareInput: newInput, compareResult: safeCalculate(newInput) })
  },

  toggleCompareMode: () => {
    const { compareMode, input } = get()
    if (!compareMode) {
      const compareInput = { ...input, country: 'DE' as Country }
      set({
        compareMode: true,
        compareInput,
        compareResult: safeCalculate(compareInput),
      })
    } else {
      set({ compareMode: false, compareInput: null, compareResult: null })
    }
  },

  setCompareCountry: (country) => {
    const { input, compareInput } = get()
    const base = compareInput ?? { ...input }
    const newInput = { ...base, country }
    set({ compareInput: newInput, compareResult: safeCalculate(newInput) })
  },
}))
