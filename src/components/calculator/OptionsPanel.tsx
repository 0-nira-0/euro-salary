import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Collapse } from '../ui/Collapse'
import { useCalculatorStore } from '../../store/calculatorStore'
import { SUPPORTED_OPTIONS } from '../../tax-engine/support'
import { FAMILY_STATUSES, type FamilyStatus } from '../../tax-engine/types'
import { MAX_CHILDREN } from '../../config'

const CHILDREN_OPTIONS = Array.from({ length: MAX_CHILDREN + 1 }, (_, i) => i)

export function OptionsPanel() {
  const { t } = useTranslation()
  const input = useCalculatorStore((s) => s.input)
  const setInput = useCalculatorStore((s) => s.setInput)
  const [open, setOpen] = useState(false)
  const panelId = useId()

  const support = SUPPORTED_OPTIONS[input.country]

  return (
    <div className="bg-white rounded border border-slate-200 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 font-body text-sm font-medium text-neutral hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tertiary"
      >
        <span className="font-headline font-semibold text-primary text-sm">{t('options.title')}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Collapse open={open} id={panelId}>
        <div className="px-4 sm:px-5 pb-5 border-t border-slate-100 pt-4 grid gap-4 sm:grid-cols-2">
          <div className={support.family ? '' : 'opacity-60'}>
            <label
              htmlFor={`${panelId}-family`}
              className="block text-xs font-body font-medium text-neutral mb-1.5"
            >
              {t('options.family_status')}
            </label>
            <select
              id={`${panelId}-family`}
              value={input.familyStatus}
              disabled={!support.family}
              onChange={(e) => setInput({ familyStatus: e.target.value as FamilyStatus })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded font-body text-primary bg-white focus:outline-none focus:border-tertiary disabled:cursor-not-allowed"
            >
              {FAMILY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`options.${status}`)}
                </option>
              ))}
            </select>
            {!support.family && (
              <p className="mt-1.5 text-xs font-body text-neutral">
                {t('options.not_modelled')}
              </p>
            )}
          </div>

          <div className={support.children ? '' : 'opacity-60'}>
            <span
              id={`${panelId}-children`}
              className="block text-xs font-body font-medium text-neutral mb-1.5"
            >
              {t('options.children')}
            </span>
            <div className="flex gap-1.5" role="group" aria-labelledby={`${panelId}-children`}>
              {CHILDREN_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={!support.children}
                  aria-pressed={input.numChildren === n}
                  onClick={() => setInput({ numChildren: n })}
                  className={`flex-1 py-2 text-sm rounded border font-body font-medium transition-all active:scale-95 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary ${
                    input.numChildren === n
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-neutral border-slate-200 enabled:hover:border-primary enabled:hover:text-primary'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {!support.children && (
              <p className="mt-1.5 text-xs font-body text-neutral">
                {t('options.not_modelled')}
              </p>
            )}
          </div>
        </div>
      </Collapse>
    </div>
  )
}
