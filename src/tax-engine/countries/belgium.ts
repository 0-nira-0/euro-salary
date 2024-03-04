// Belgium tax module — 2024
// Sources:
//   - ONSS cotisations: https://www.onss.be/cotisations/travailleurs-salaries
//   - IPP/PB: SPF Finances — barème fédéral 2024
//   - Cotisation spéciale sécurité sociale: AR 18 juillet 2002

import type { CalculatorInput, ContributionLine, TaxResult } from '../types'

const MONTHS = 12

// Barème IPP fédéral 2024
const IPP_TRANCHES = [
  { min: 0,      max: 15_820,  rate: 0.25 },
  { min: 15_820, max: 27_920,  rate: 0.40 },
  { min: 27_920, max: 48_320,  rate: 0.45 },
  { min: 48_320, max: Infinity, rate: 0.50 },
]

function calcIPP(base: number): number {
  let tax = 0
  for (const t of IPP_TRANCHES) {
    if (base <= t.min) break
    tax += (Math.min(base, t.max) - t.min) * t.rate
  }
  return tax
}

// Quote-part conjoint : déduction pour conjoint sans revenus
// Forfait frais professionnels — barème dégressif 2024
function getForfaitFraisPro(revenuBrut: number): number {
  // Max 5 520 €
  if (revenuBrut <= 21_000) return Math.min(revenuBrut * 0.30, 5_520)
  return Math.min(revenuBrut * 0.30, 5_520)
}

// Cotisation spéciale de sécurité sociale (CSSS) 2024
function getCSSSAnnual(netMonthlyTaxable: number): number {
  const m = netMonthlyTaxable
  if (m <= 1_945.38) return 0
  if (m <= 2_190.18) return (m - 1_945.38) * 0.076
  if (m <= 6_038.82) return 18.60 + (m - 2_190.18) * 0.01321
  return 69.49
}

export function calculateBelgium(input: CalculatorInput): TaxResult {
  const gross = input.grossAnnual

  // ── ONSS travailleur : 13.07% sans plafond ──────────────────────────────
  const onssAmount = Math.round(gross * 0.1307 * 100) / 100
  const onss: ContributionLine = {
    label: 'Cotisation ONSS',
    labelKey: 'contribution.social_security',
    rate: 0.1307,
    baseAmount: gross,
    amount: onssAmount,
    payer: 'employee',
    category: 'health',
    optional: false,
    legalReference: 'Art. 23 AR du 28 nov. 1969 — cotisation personnelle ONSS 13,07%',
  }

  // CSSS — calculé sur revenu mensuel net imposable approximatif
  const netMensuelApprox = (gross - onssAmount) / MONTHS
  const csssMonthly = getCSSSAnnual(netMensuelApprox)
  const csssAmount = Math.round(csssMonthly * MONTHS * 100) / 100
  const csss: ContributionLine = {
    label: 'Cotisation spéciale SS',
    labelKey: 'contribution.special_ss',
    rate: csssAmount / (gross || 1),
    baseAmount: gross - onssAmount,
    amount: csssAmount,
    payer: 'employee',
    category: 'other',
    optional: false,
    legalReference: 'AR 18 juil. 2002 — cotisation spéciale de sécurité sociale',
  }

  const employeeContributions: ContributionLine[] = [onss, csss]
  const totalEmployeeDeductions_ss = onssAmount + csssAmount

  // ── IPP/PB ──────────────────────────────────────────────────────────────

  const revenuProfessionnel = gross - onssAmount
  const forfait = getForfaitFraisPro(revenuProfessionnel)
  const revenuImposable = Math.max(0, revenuProfessionnel - forfait)

  // Quotité exemptée de base: 10 160 € (2024)
  const quotiteExemptee = 10_160
  const baseIPP = Math.max(0, revenuImposable - quotiteExemptee)
  let ipp = Math.max(0, calcIPP(baseIPP))

  // Réduction pour enfants à charge (simplifié)
  const reductionEnfants = input.numChildren * 1_690
  ipp = Math.max(0, ipp - reductionEnfants)
  ipp = Math.round(ipp * 100) / 100

  // Centimes additionnels communaux: ~7.5% moyenne nationale
  const addCommunaux = Math.round(ipp * 0.075 * 100) / 100

  const ippLine: ContributionLine = {
    label: 'IPP/PB fédéral',
    labelKey: 'contribution.income_tax',
    rate: gross > 0 ? ipp / gross : 0,
    baseAmount: baseIPP,
    amount: ipp,
    payer: 'employee',
    category: 'tax',
    optional: false,
    legalReference: 'Art. 130 CIR 92 — barème IPP fédéral 2024',
  }

  const addCommLine: ContributionLine = {
    label: 'Centimes additionnels communaux',
    labelKey: 'contribution.municipal_tax',
    rate: 0.075,
    baseAmount: ipp,
    amount: addCommunaux,
    payer: 'employee',
    category: 'tax',
    optional: false,
    legalReference: 'Art. 465 CIR 92 — taxe communale additionnelle ~7,5% moyenne',
  }

  const incomeTaxLines: ContributionLine[] = [ippLine, addCommLine]
  const totalIncomeTax = ipp + addCommunaux

  // ── ONSS patronal ───────────────────────────────────────────────────────

  const erOnssAmount = Math.round(gross * 0.2700 * 100) / 100
  const erOnss: ContributionLine = {
    label: 'Cotisations patronales ONSS',
    labelKey: 'contribution.er_social_security',
    rate: 0.27,
    baseAmount: gross,
    amount: erOnssAmount,
    payer: 'employer',
    category: 'health',
    optional: false,
    legalReference: 'Art. 38 §3bis L. 29 juin 1981 — cotisation patronale globale ~27%',
  }

  const employerContributions: ContributionLine[] = [erOnss]
  const totalEmployerContributions = erOnssAmount
  const totalEmployeeDeductions = totalEmployeeDeductions_ss

  const netAnnual = Math.round((gross - totalEmployeeDeductions - totalIncomeTax) * 100) / 100
  const employerCostAnnual = Math.round((gross + totalEmployerContributions) * 100) / 100
  const effectiveTaxRate = gross > 0 ? (totalEmployeeDeductions + totalIncomeTax) / gross : 0

  return {
    country: 'BE',
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
    disclaimer: 'Simulation indicative basée sur le barème IPP 2024. Ne constitue pas un conseil fiscal.',
  }
}
