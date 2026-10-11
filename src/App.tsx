import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Tabs, panelId, tabId } from './components/ui/Tabs'
import { Calculator } from './pages/Calculator'
import { About } from './pages/About'

type Page = 'calculator' | 'about'

export default function App() {
  const { t } = useTranslation()
  const [page, setPage] = useState<Page>('calculator')

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-body">
      <Header />

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Tabs<Page>
            idPrefix="page"
            ariaLabel={t('a11y.pages')}
            value={page}
            onChange={setPage}
            tabs={[
              { key: 'calculator', label: t('nav.calculator') },
              { key: 'about', label: t('nav.about') },
            ]}
          />
        </div>
      </nav>

      <main
        key={page}
        id={panelId('page', page)}
        role="tabpanel"
        aria-labelledby={tabId('page', page)}
        className="flex-1 animate-fade-in-up"
      >
        {page === 'calculator' ? <Calculator /> : <About />}
      </main>

      <Footer />
    </div>
  )
}
