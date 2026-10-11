import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CountrySelector } from '../components/layout/CountrySelector'
import { SalaryInput } from '../components/calculator/SalaryInput'
import { OptionsPanel } from '../components/calculator/OptionsPanel'
import { ResultCard } from '../components/calculator/ResultCard'
import { BreakdownTable } from '../components/calculator/BreakdownTable'
import { CompareMode } from '../components/calculator/CompareMode'
import { Tabs, panelId, tabId } from '../components/ui/Tabs'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import { useCalculatorStore } from '../store/calculatorStore'
import { useShareUrl } from '../hooks/useShareUrl'
import { useFormat } from '../hooks/useFormat'
import { prefersReducedMotion } from '../hooks/useAnimatedNumber'

type Tab = 'result' | 'breakdown' | 'compare'
type ShareState = 'idle' | 'copied' | 'error'

export function Calculator() {
  const { t } = useTranslation()
  const fmt = useFormat()
  const result = useCalculatorStore((s) => s.result)
  const { copyToClipboard } = useShareUrl()
  const [tab, setTab] = useState<Tab>('result')
  const [share, setShare] = useState<ShareState>('idle')
  const [resultsBelow, setResultsBelow] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const shareTimer = useRef<number>()

  useEffect(() => () => window.clearTimeout(shareTimer.current), [])

  // On phones the results sit under the inputs: show a floating summary while
  // they are still below the fold.
  useEffect(() => {
    const el = resultsRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setResultsBelow(!entry.isIntersecting && entry.boundingClientRect.top > 0),
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleShare = async () => {
    const ok = await copyToClipboard()
    setShare(ok ? 'copied' : 'error')
    window.clearTimeout(shareTimer.current)
    shareTimer.current = window.setTimeout(() => setShare('idle'), 2000)
  }

  const scrollToResults = () =>
    resultsRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'result', label: t('result.title') },
    { key: 'breakdown', label: t('result.breakdown') },
    { key: 'compare', label: t('nav.compare') },
  ]

  const shareLabel =
    share === 'copied' ? t('share.copied') : share === 'error' ? t('share.error') : t('share.button')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 lg:pb-8">
      <div className="mb-6">
        <CountrySelector />
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-4">
          <SalaryInput />
          <OptionsPanel />

          <button
            type="button"
            onClick={handleShare}
            aria-live="polite"
            className={`flex items-center gap-2 rounded text-sm font-body transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary ${
              share === 'copied'
                ? 'text-secondary'
                : share === 'error'
                  ? 'text-red-600'
                  : 'text-neutral hover:text-primary'
            }`}
          >
            {share === 'copied' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
            {shareLabel}
          </button>
        </div>

        <div ref={resultsRef} className="scroll-mt-4">
          <Tabs<Tab>
            idPrefix="result"
            ariaLabel={t('a11y.result_tabs')}
            value={tab}
            onChange={setTab}
            tabs={tabs}
            className="border-b border-slate-200 mb-4"
          />

          <div
            key={tab}
            id={panelId('result', tab)}
            role="tabpanel"
            aria-labelledby={tabId('result', tab)}
            className="animate-fade-in-up"
          >
            {!result ? (
              <div className="bg-white rounded border border-slate-200 p-8 text-center">
                <p className="text-neutral font-body text-sm">{t('result.empty')}</p>
              </div>
            ) : tab === 'result' ? (
              <ResultCard result={result} highlight />
            ) : tab === 'breakdown' ? (
              <BreakdownTable result={result} />
            ) : (
              <CompareMode />
            )}
          </div>
        </div>
      </div>

      {result && (
        <button
          type="button"
          onClick={scrollToResults}
          aria-label={t('a11y.to_results')}
          tabIndex={resultsBelow ? 0 : -1}
          className={`lg:hidden fixed inset-x-4 bottom-4 z-10 flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-white shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${
            resultsBelow ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
          }`}
        >
          <span className="text-xs font-body text-blue-200">{t('result.net_monthly')}</span>
          <span className="flex items-center gap-2 font-headline text-lg font-bold tabular-nums">
            <AnimatedNumber value={result.netMonthly} format={fmt.money} />
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}
