import { useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Calculator } from './pages/Calculator'
import { useCalculatorStore } from './store/calculatorStore'
import { parseShareUrl } from './hooks/useShareUrl'

export default function App() {
  const { setInput } = useCalculatorStore()

  // Restore state from URL on mount
  useEffect(() => {
    const parsed = parseShareUrl()
    if (parsed) setInput(parsed)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-body">
      <Header />
      <main className="flex-1">
        <Calculator />
      </main>
      <Footer />
    </div>
  )
}
