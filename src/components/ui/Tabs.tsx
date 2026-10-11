import { useRef, type KeyboardEvent } from 'react'

export interface TabItem<K extends string> {
  key: K
  label: string
}

interface TabsProps<K extends string> {
  tabs: TabItem<K>[]
  value: K
  onChange: (key: K) => void
  ariaLabel: string
  idPrefix: string
  className?: string
}

export const tabId = (prefix: string, key: string) => `${prefix}-tab-${key}`
export const panelId = (prefix: string, key: string) => `${prefix}-panel-${key}`

export function Tabs<K extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  idPrefix,
  className = '',
}: TabsProps<K>) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const last = tabs.length - 1
    let next = index
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    else return
    e.preventDefault()
    onChange(tabs[next].key)
    refs.current[tabs[next].key]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {tabs.map((tab, i) => {
        const active = tab.key === value
        return (
          <button
            key={tab.key}
            ref={(el) => {
              refs.current[tab.key] = el
            }}
            role="tab"
            id={tabId(idPrefix, tab.key)}
            aria-selected={active}
            aria-controls={panelId(idPrefix, tab.key)}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.key)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-body font-medium border-b-2 -mb-px transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-inset ${
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
