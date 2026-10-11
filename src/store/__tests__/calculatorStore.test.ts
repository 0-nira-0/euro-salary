import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_INPUT, pickCompareCountry, useCalculatorStore } from '../calculatorStore'

const reset = () =>
  useCalculatorStore.setState({ ...useCalculatorStore.getState() }, true)

describe('calculator store', () => {
  beforeEach(() => {
    reset()
    useCalculatorStore.getState().setInput({ ...DEFAULT_INPUT })
    useCalculatorStore.getState().setCompareCountry('DE')
  })

  it('keeps the comparison in sync when the salary changes', () => {
    const { setInput } = useCalculatorStore.getState()
    setInput({ grossAnnual: 90_000 })
    const s = useCalculatorStore.getState()
    expect(s.compareResult?.grossAnnual).toBe(90_000)
    expect(s.compareResult?.country).toBe('DE')
  })

  it('keeps the comparison in sync with family options', () => {
    const { setInput } = useCalculatorStore.getState()
    const before = useCalculatorStore.getState().compareResult?.netAnnual
    setInput({ familyStatus: 'married_1income', numChildren: 3 })
    expect(useCalculatorStore.getState().compareResult?.netAnnual).not.toBe(before)
  })

  it('never compares a country with itself', () => {
    const { setInput } = useCalculatorStore.getState()
    setInput({ country: 'DE' })
    const s = useCalculatorStore.getState()
    expect(s.compareCountry).not.toBe('DE')
    expect(s.compareResult?.country).toBe(s.compareCountry)
    expect(pickCompareCountry('FR', 'FR')).toBe('DE')
  })

  it('has no result for an empty salary', () => {
    const { setInput } = useCalculatorStore.getState()
    setInput({ grossAnnual: 0 })
    const s = useCalculatorStore.getState()
    expect(s.result).toBeNull()
    expect(s.compareResult).toBeNull()
  })

  it('exposes the gross salary implied by a net-to-gross request', () => {
    const { setInput } = useCalculatorStore.getState()
    setInput({ direction: 'net_to_gross', grossAnnual: 36_000 })
    const result = useCalculatorStore.getState().result
    expect(result?.netAnnual).toBeCloseTo(36_000, 0)
    expect(result?.grossAnnual).toBeGreaterThan(36_000)
  })
})
