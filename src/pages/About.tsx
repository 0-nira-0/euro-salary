import { useTranslation } from 'react-i18next'

const COUNTRIES = [
  { flag: '🇫🇷', name: 'France', note: 'URSSAF cotisations, IR barème 2024, quotient familial' },
  { flag: '🇩🇪', name: 'Germany', note: 'Lohnsteuer Grundtabelle 2024, SV Beiträge, SolZ' },
  { flag: '🇪🇸', name: 'Spain', note: 'IRPF estatal, cotizaciones SS, reducción rendimientos' },
  { flag: '🇮🇹', name: 'Italy', note: 'IRPEF, contributi INPS, addizionali regionali/comunali' },
  { flag: '🇧🇪', name: 'Belgium', note: 'IPP/PB, ONSS 13.07%, centimes additionnels communaux' },
  { flag: '🇵🇱', name: 'Poland', note: 'PIT 12/32%, ZUS składki, składka zdrowotna 9%' },
]

export function About() {
  const { t } = useTranslation()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h2 className="font-headline text-2xl font-bold text-primary mb-3">
        {t('nav.about')} — EuroSalary
      </h2>
      <p className="font-body text-neutral mb-8 leading-relaxed">
        EuroSalary calculates gross-to-net (and net-to-gross) salaries for 6 European countries
        using 2024 official tax rates. All formulas run client-side — no data leaves your browser.
      </p>

      <h3 className="font-headline text-lg font-semibold text-primary mb-4">Covered countries</h3>
      <div className="grid sm:grid-cols-2 gap-3 mb-10">
        {COUNTRIES.map((c) => (
          <div key={c.name} className="bg-white rounded border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{c.flag}</span>
              <span className="font-headline font-semibold text-primary">{c.name}</span>
            </div>
            <p className="text-xs font-body text-neutral">{c.note}</p>
          </div>
        ))}
      </div>

      <h3 className="font-headline text-lg font-semibold text-primary mb-3">How it works</h3>
      <ul className="font-body text-sm text-neutral space-y-2 list-disc list-inside mb-8">
        <li>Gross → Net: direct formula evaluation per country module</li>
        <li>Net → Gross: binary search (50 iterations, 1-cent tolerance)</li>
        <li>Share: all parameters encoded in the URL query string</li>
        <li>All monetary calculations in integer cents to avoid float errors</li>
      </ul>

      <p className="text-xs text-neutral font-body border-t border-slate-200 pt-4">
        Data year: 2024. For informational purposes only — not tax advice.
      </p>
    </div>
  )
}
