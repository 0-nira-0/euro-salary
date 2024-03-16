import { useEffect } from 'react'
import { useCalculatorStore } from '../store/calculatorStore'
import { useDebounce } from './useDebounce'
import type { CalculatorInput } from '../tax-engine/types'

// Convenience hook: debounces the gross amount before updating the store
export function useCalculator() {
  const { input, result, setInput } = useCalculatorStore()

  const debouncedGross = useDebounce(input.grossAnnual, 300)

  useEffect(() => {
    // Trigger recalculation when debounced gross differs from last computed result
    if (result && Math.abs(result.grossAnnual - debouncedGross) > 0.01) {
      setInput({ grossAnnual: debouncedGross })
    }
  }, [debouncedGross]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = <K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) => {
    setInput({ [key]: value } as Partial<CalculatorInput>)
  }

  return { input, result, updateField }
}
