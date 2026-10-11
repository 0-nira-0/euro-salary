import { useEffect, useRef, useState } from 'react'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// Eases the displayed number towards `target`. If the target changes mid-flight
// the animation continues from the value currently on screen.
export function useAnimatedNumber(target: number, duration = 450): number {
  const [value, setValue] = useState(target)
  const current = useRef(target)

  useEffect(() => {
    if (prefersReducedMotion() || current.current === target) {
      current.current = target
      setValue(target)
      return
    }
    const from = current.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      current.current = from + (target - from) * eased
      setValue(current.current)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
