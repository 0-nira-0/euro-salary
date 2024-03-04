// Italy tax module — 2024
// Sources:
//   - INPS contributi: https://www.inps.it/prestazioni-servizi/lavoratori-dipendenti-privati-aliquote-contributive
//   - IRPEF: Legge 30 dicembre 2023 n.213 (Legge di bilancio 2024) confermata 2024
//   - Detrazioni lavoro dipendente: Art. 13 TUIR

import type { CalculatorInput, ContributionLine, TaxResult } from '../types'

const MONTHS = 12

// Massimale INPS 2024: non esiste massimale per dipendenti privati ordinari per la quota principale
// Però c'è un'aliquota aggiuntiva 1% oltre €52 190
const INPS_SOGLIA_AGGIUNTIVA = 52_190

// Scaglioni IRPEF 2024
const IRPEF_TRANCHES = [
  { min: 0,      max: 28_000,  rate: 0.23 },
  { min: 28_000, max: 50_000,  rate: 0.35 },
  { min: 50_000, max: Infinity, rate: 0.43 },
]

function calcIRPEF(base: number): number {
  let tax = 0
  for (const t of IRPEF_TRANCHES) {
    if (base <= t.min) break
    tax += (Math.min(base, t.max) - t.min) * t.rate
  }
  return tax
}

// Detrazione per lavoro dipendente — Art. 13 TUIR (2024)
function getDetrazionelavoro(redditoComplessivo: number): number {
  if (redditoComplessivo <= 15_000) return 1_880
  if (redditoComplessivo <= 28_000) return 1_910 + 1_190 * (28_000 - redditoComplessivo) / 13_000
  if (redditoComplessivo <= 50_000) return 1_910 * (50_000 - redditoComplessivo) / 22_000
  return 0
}

export function calculateItaly(input: CalculatorInput): TaxResult {
  const gross = input.grossAnnual

  // ── INPS contributi dipendente ──────────────────────────────────────────

  // Aliquota principale 9.19% su tutto il reddito
  const inpsBase1 = gross
  const inps1Amount = Math.round(inpsBase1 * 0.0919 * 100) / 100
  const inps1: ContributionLine = {
    label: 'Contributi INPS (9,19%)',
    labelKey: 'contribution.social_security',
    rate: 0.0919,
    baseAmount: inpsBase1,
    amount: inps1Amount,
    payer: 'employee',
    category: 'pension',
    optional: false,
    legalReference: 'Art. 1 D.L. 338/1989 — aliquota IVS 9,19%',
  }

  // Aliquota aggiuntiva 1% oltre €52 190
  const inpsBase2 = Math.max(0, gross - INPS_SOGLIA_AGGIUNTIVA)
  const inps2Amount = Math.round(inpsBase2 * 0.01 * 100) / 100
  const inps2: ContributionLine = {
    label: 'Contributi INPS aggiuntivi (1%)',
    labelKey: 'contribution.social_security_extra',
    rate: 0.01,
    baseAmount: inpsBase2,
    amount: inps2Amount,
    payer: 'employee',
    category: 'pension',
    optional: false,
    legalReference: 'Art. 3-ter D.L. 384/1992 — contributo aggiuntivo 1% oltre €52 190',
  }

  const employeeContributions: ContributionLine[] = [inps1, inps2]
  const totalEmployeeDeductions_inps = employeeContributions.reduce((s, c) => s + c.amount, 0)

  // ── IRPEF ────────────────────────────────────────────────────────────────

  const redditoImponibile = Math.max(0, gross - totalEmployeeDeductions_inps)
  const irpefLordo = calcIRPEF(redditoImponibile)
  const detrazione = getDetrazionelavoro(redditoImponibile)

  // Addizionale regionale media: 1.73% (media nazionale 2024)
  const addRegionale = Math.round(redditoImponibile * 0.0173 * 100) / 100
  // Addizionale comunale media: 0.5%
  const addComunale = Math.round(redditoImponibile * 0.005 * 100) / 100

  const irpef = Math.round(Math.max(0, irpefLordo - detrazione) * 100) / 100

  const irpefLine: ContributionLine = {
    label: 'IRPEF',
    labelKey: 'contribution.income_tax',
    rate: gross > 0 ? irpef / gross : 0,
    baseAmount: redditoImponibile,
    amount: irpef,
    payer: 'employee',
    category: 'tax',
    optional: false,
    legalReference: 'Art. 11 TUIR — scaglioni IRPEF 2024',
  }

  const addRegLine: ContributionLine = {
    label: 'Addizionale regionale (media)',
    labelKey: 'contribution.regional_tax',
    rate: 0.0173,
    baseAmount: redditoImponibile,
    amount: addRegionale,
    payer: 'employee',
    category: 'tax',
    optional: false,
    legalReference: 'D.Lgs. 360/1998 — addizionale regionale IRPEF',
  }

  const addComLine: ContributionLine = {
    label: 'Addizionale comunale (media)',
    labelKey: 'contribution.municipal_tax',
    rate: 0.005,
    baseAmount: redditoImponibile,
    amount: addComunale,
    payer: 'employee',
    category: 'tax',
    optional: false,
    legalReference: 'Art. 1 D.Lgs. 360/1998 — addizionale comunale IRPEF',
  }

  const incomeTaxLines: ContributionLine[] = [irpefLine, addRegLine, addComLine]
  const totalIncomeTax = irpef + addRegionale + addComunale

  // ── Contributi datore di lavoro ─────────────────────────────────────────

  const erInpsAmount = Math.round(gross * 0.2396 * 100) / 100
  const erInps: ContributionLine = {
    label: 'INPS datore di lavoro',
    labelKey: 'contribution.er_social_security',
    rate: 0.2396,
    baseAmount: gross,
    amount: erInpsAmount,
    payer: 'employer',
    category: 'pension',
    optional: false,
    legalReference: 'Circ. INPS n. 1/2024 — aliquota IVS datore 23,81% + altri',
  }

  const erInailAmount = Math.round(gross * 0.005 * 100) / 100
  const erInail: ContributionLine = {
    label: 'INAIL (tasso medio)',
    labelKey: 'contribution.er_accident',
    rate: 0.005,
    baseAmount: gross,
    amount: erInailAmount,
    payer: 'employer',
    category: 'other',
    optional: false,
    legalReference: 'D.P.R. 1124/1965 — tasso INAIL variabile per settore',
  }

  const employerContributions: ContributionLine[] = [erInps, erInail]
  const totalEmployerContributions = employerContributions.reduce((s, c) => s + c.amount, 0)
  const totalEmployeeDeductions = totalEmployeeDeductions_inps

  const netAnnual = Math.round((gross - totalEmployeeDeductions - totalIncomeTax) * 100) / 100
  const employerCostAnnual = Math.round((gross + totalEmployerContributions) * 100) / 100
  const effectiveTaxRate = gross > 0 ? (totalEmployeeDeductions + totalIncomeTax) / gross : 0

  return {
    country: 'IT',
    grossAnnual: gross,
    grossMonthly: Math.round((gross / MONTHS) * 100) / 100,
    netAnnual,
    netMonthly: Math.round((netAnnual / MONTHS) * 100) / 100,
    employerCostAnnual,
    employerCostMonthly: Math.round((employerCostAnnual / MONTHS) * 100) / 100,
    effectiveTaxRate,
    employeeContributions,
    employerContributions,
    incomeTaxLines,
    totalEmployeeDeductions,
    totalEmployerContributions,
    totalIncomeTax,
    year: 2024,
    disclaimer: 'Simulazione indicativa basata sul baremo IRPEF 2024. Non costituisce consulenza fiscale.',
  }
}
