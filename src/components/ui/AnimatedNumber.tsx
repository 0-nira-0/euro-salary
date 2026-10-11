import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'

interface AnimatedNumberProps {
  value: number
  format: (n: number) => string
}

export function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  const shown = useAnimatedNumber(value)
  return <>{format(shown)}</>
}
