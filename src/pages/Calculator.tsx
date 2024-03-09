import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CountrySelector } from '../components/layout/CountrySelector'
import { SalaryInput } from '../components/calculator/SalaryInput'
import { OptionsPanel } from '../components/calculator/OptionsPanel'
import { ResultCard } from '../components/calculator/ResultCard'
import { BreakdownTable } from '../components/calculator/BreakdownTable'
import { CompareMode } from '../components/calculator/CompareMode'
import { useCalculatorStore } from '../store/calculatorStore'
import { useShareUrl } from '../hooks/useShareUrl'

type Tab = 'result' | 'breakdown' | 'compare'

export function Calculator() {
  const { t } = useTranslation()
  const { result, compareMode, toggleCompareMode } = useCalculatorStore()
  const { copyToClipboard } = useShareUrl()
  const [tab, setTab] = useState<Tab>('result')
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    await copyToClipboard()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'result', label: t('result.net_monthly') },
    { key: 'breakdown', label: t('result.breakdown') },
    { key: 'compare', label: t('nav.compare') },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <CountrySelector />
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: input */}
        <div className="space-y-4">
          <SalaryInput />
          <OptionsPanel />

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-body text-neutral hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {copied ? t('share.copied') : t('share.button')}
          </button>
        </div>

        {/* Right: results */}
        <div>
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-4">
            {tabs.map((tab_item) => (
              <button
                key={tab_item.key}
                onClick={() => {
                  setTab(tab_item.key)
                  if (tab_item.key === 'compare' && !compareMode) toggleCompareMode()
                  if (tab_item.key !== 'compare' && compareMode) toggleCompareMode()
                }}
                className={`px-4 py-2.5 text-sm font-body font-medium border-b-2 -mb-px transition-colors ${
                  tab === tab_item.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral hover:text-primary'
                }`}
              >
                {tab_item.label}
              </button>
            ))}
          </div>

          {!result ? (
            <div className="bg-white rounded border border-slate-200 p-8 text-center">
              <p className="text-neutral font-body text-sm">Enter a salary to see results</p>
            </div>
          ) : (
            <>
              {tab === 'result' && <ResultCard result={result} highlight />}
              {tab === 'breakdown' && <BreakdownTable result={result} />}
              {tab === 'compare' && <CompareMode />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
