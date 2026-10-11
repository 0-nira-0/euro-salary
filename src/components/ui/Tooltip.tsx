import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  align?: 'center' | 'start'
}

export function Tooltip({ content, children, align = 'center' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const id = useId()

  useEffect(() => {
    if (!visible) return
    const onPointerDown = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setVisible(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [visible])

  const position = align === 'start' ? 'left-0' : 'left-1/2 -translate-x-1/2'
  const arrow = align === 'start' ? 'left-2' : 'left-1/2 -translate-x-1/2'

  return (
    <span ref={ref} className="relative inline-block">
      <span
        role="button"
        tabIndex={0}
        aria-describedby={visible ? id : undefined}
        aria-expanded={visible}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary"
      >
        {children}
      </span>
      {visible && (
        <span
          id={id}
          role="tooltip"
          className={`absolute z-20 bottom-full mb-2 w-64 max-w-[calc(100vw-2rem)] animate-pop-in bg-slate-800 text-white text-xs rounded p-2.5 font-body shadow-lg ${position}`}
        >
          {content}
          <span className={`absolute top-full border-4 border-transparent border-t-slate-800 ${arrow}`} />
        </span>
      )}
    </span>
  )
}
