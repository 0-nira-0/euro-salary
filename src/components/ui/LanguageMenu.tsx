import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../../lib/languages'

// Compact language picker for phones and tablets, where six pills do not fit.
export function LanguageMenu({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: Event) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('a11y.language')}: ${current.name}`}
        className="flex items-center gap-1.5 rounded border border-white/30 px-2.5 py-1.5 text-sm font-body font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-2.4 3.8-5.4 3.8-9S14.5 5.4 12 3m0 18c-2.5-2.4-3.8-5.4-3.8-9S9.5 5.4 12 3M3.6 9h16.8M3.6 15h16.8" />
        </svg>
        {current.short}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="menu"
          aria-label={t('a11y.language')}
          className="absolute right-0 z-30 mt-2 w-44 origin-top-right animate-pop-in overflow-hidden rounded border border-slate-200 bg-white py-1 shadow-lg"
        >
          {LANGUAGES.map((lang) => {
            const active = lang.code === i18n.language
            return (
              <li key={lang.code} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  lang={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code)
                    setOpen(false)
                    button.current?.focus()
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-body transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none ${
                    active ? 'font-semibold text-primary' : 'text-neutral'
                  }`}
                >
                  <span>{lang.name}</span>
                  <span className="text-xs text-slate-400">{lang.short}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
