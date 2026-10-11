import type { ReactNode } from 'react'

interface CollapseProps {
  open: boolean
  id?: string
  children: ReactNode
}

// Animates height without measuring: grid rows go 0fr → 1fr.
export function Collapse({ open, id, children }: CollapseProps) {
  return (
    <div
      id={id}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
      aria-hidden={!open}
      // `inert` keeps collapsed content out of the tab order
      {...(!open ? { inert: '' } : {})}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}
