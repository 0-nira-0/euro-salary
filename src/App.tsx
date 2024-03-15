import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Calculator } from './pages/Calculator'
import { About } from './pages/About'
import { useCalculatorStore } from './store/calculatorStore'
import { parseShareUrl } from './hooks/useShareUrl'

type Page = 'calculator' | 'about'

export default function App() {
  const { setInput } = useCalculatorStore()
  const { t } = useTranslation()
  const [page, setPage] = useState<Page>('calculator')

  useEffect(() => {
    const parsed = parseShareUrl()
    if (parsed) setInput(parsed)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-body">
      <Header />

      {/* Page nav */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
          {(['calculator', 'about'] as Page[]).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2.5 text-sm font-body font-medium border-b-2 -mb-px transition-colors ${
                page === p
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral hover:text-primary'
              }`}
            >
              {t(`nav.${p}`)}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1">
        {page === 'calculator' && <Calculator />}
        {page === 'about' && <About />}
      </main>

      <Footer />
    </div>
  )
}
