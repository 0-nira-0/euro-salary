import type { CalculatorInput, TaxResult } from './types'
import { calculateFrance } from './countries/france'
import { calculateGermany } from './countries/germany'
import { calculateSpain } from './countries/spain'
import { calculateItaly } from './countries/italy'
import { calculateBelgium } from './countries/belgium'
import { calculatePoland } from './countries/poland'

const calculators: Record<string, (input: CalculatorInput) => TaxResult> = {
  FR: calculateFrance,
  DE: calculateGermany,
  ES: calculateSpain,
  IT: calculateItaly,
  BE: calculateBelgium,
  PL: calculatePoland,
}

export function calculate(input: CalculatorInput): TaxResult {
  const calc = calculators[input.country]
  if (!calc) throw new Error(`No calculator for country: ${input.country}`)
  return calc(input)
}

// Binary search for net → gross
export function netToGross(targetNet: number, input: CalculatorInput): number {
  let lo = targetNet
  let hi = targetNet * 2.5
  const TOLERANCE = 0.01
  const MAX_ITER = 50

  for (let i = 0; i < MAX_ITER; i++) {
    const mid = (lo + hi) / 2
    const result = calculate({ ...input, grossAnnual: mid, direction: 'gross_to_net' })
    const diff = result.netAnnual - targetNet
    if (Math.abs(diff) < TOLERANCE) return mid
    if (diff < 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export function calculateFromInput(input: CalculatorInput): TaxResult {
  if (input.direction === 'net_to_gross') {
    const grossAnnual = netToGross(input.grossAnnual, input)
    return calculate({ ...input, grossAnnual, direction: 'gross_to_net' })
  }
  return calculate(input)
}
