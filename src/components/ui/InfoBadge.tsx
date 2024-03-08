import { Tooltip } from './Tooltip'

interface InfoBadgeProps {
  text: string
}

export function InfoBadge({ text }: InfoBadgeProps) {
  return (
    <Tooltip content={text}>
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold cursor-help hover:bg-tertiary/20 transition-colors">
        i
      </span>
    </Tooltip>
  )
}
