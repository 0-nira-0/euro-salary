// France tax module — 2024
// Sources:
//   - URSSAF: https://www.urssaf.fr/portail/home/taux-et-baremes.html
//   - AGIRC-ARRCO: https://www.agirc-arrco.fr/entreprises/gerer-cotisations/taux-de-cotisations/
//   - DGFiP barème IR 2024: https://www.impots.gouv.fr/particulier/questions/quelles-sont-les-tranches-dimposition
//   - Décret n°2024-XXX PASS 2024

import type { CalculatorInput, ContributionLine, TaxResult } from '../types'

// PASS 2024: 47 100 € / an
const PASS_2024 = 47_100

const MONTHS = 12

// Barème IR 2024 (tranches annuelles)
const IR_TRANCHES = [
  { min: 0,       max: 11_294,  rate: 0    },
  { min: 11_294,  max: 28_797,  rate: 0.11 },
  { min: 28_797,  max: 82_341,  rate: 0.30 },
  { min: 82_341,  max: 177_106, rate: 0.41 },
  { min: 177_106, max: Infinity, rate: 0.45 },
]

function calcIR(revenuImposable: number): number {
  let tax = 0
  for (const tranche of IR_TRANCHES) {
    if (revenuImposable <= tranche.min) break
    const base = Math.min(revenuImposable, tranche.max) - tranche.min
    tax += base * tranche.rate
  }
  return tax
}

function getFamilyParts(familyStatus: CalculatorInput['familyStatus'], numChildren: number): number {
  let parts = familyStatus === 'married' || familyStatus === 'married_1income' ? 2 : 1
  if (familyStatus === 'single_parent') parts = 1
  for (let i = 0; i < numChildren; i++) {
    parts += i < 2 ? 0.5 : 1
  }
  return parts
}

function calcIRWithQuotient(rni: number, parts: number): number {
  const taxPerPart = calcIR(rni / parts)
  return taxPerPart * parts
}

// Décote 2024: IR < 1 929 € (isolé) ou 3 191 € (couple)
function applyDecote(ir: number, isCouple: boolean): number {
  const seuil = isCouple ? 3_191 : 1_929
  const coeff = isCouple ? 1_208 : 873
  if (ir >= seuil) return ir
  const decote = coeff - 0.4525 * ir
  return Math.max(0, ir - Math.max(0, decote))
}

export function calculateFrance(input: CalculatorInput): TaxResult {
  const gross = input.grossAnnual
  const isCouple = input.familyStatus === 'married' || input.familyStatus === 'married_1income'

  // ── Cotisations salariales ──────────────────────────────────────────────

  // Assiette SS tranche 1 (jusqu'à 1 PASS)
  const assietteT1 = Math.min(gross, PASS_2024)
  // Assiette SS tranche 2 (1 à 8 PASS)
  const assietteT2 = Math.max(0, Math.min(gross, PASS_2024 * 8) - PASS_2024)

  // Assurance vieillesse T1: 6.90%
  // Source: Décret n°2023-436 du 3 juin 2023 — Article D242-3 CSS
  const avT1Amount = Math.round(assietteT1 * 0.069 * 100) / 100
  const avT1: ContributionLine = {
    label: 'Assurance vieillesse (T1)',
    labelKey: 'contribution.pension_t1',
    rate: 0.069,
    baseAmount: assietteT1,
    amount: avT1Amount,
    payer: 'employee',
    category: 'pension',
    optional: false,
    legalReference: 'Art. D242-3 CSS — taux 6,90% plafonné PASS',
  }

  // Assurance vieillesse T2: 0.40%
  const avT2Amount = Math.round(assietteT2 * 0.004 * 100) / 100
  const avT2: ContributionLine = {
    label: 'Assurance vieillesse (T2)',
    labelKey: 'contribution.pension_t2',
    rate: 0.004,
    baseAmount: assietteT2,
    amount: avT2Amount,
    payer: 'employee',
    category: 'pension',
    optional: false,
    legalReference: 'Art. D242-3 CSS — taux 0,40% déplafonné',
  }

  // AGIRC-ARRCO T1: 3.15%
  const agircT1Amount = Math.round(assietteT1 * 0.0315 * 100) / 100
  const agircT1: ContributionLine = {
    label: 'AGIRC-ARRCO (T1)',
    labelKey: 'contribution.complementary_t1',
    rate: 0.0315,
    baseAmount: assietteT1,
    amount: agircT1Amount,
    payer: 'employee',
    category: 'pension',
    optional: false,
    legalReference: 'Accord ANI 17 nov. 2017 — taux T1 salarié 3,15%',
  }

  // AGIRC-ARRCO T2: 8.64%
  const agircT2Amount = Math.round(assietteT2 * 0.0864 * 100) / 100
  const agircT2: ContributionLine = {
    label: 'AGIRC-ARRCO (T2)',
    labelKey: 'contribution.complementary_t2',
    rate: 0.0864,
    baseAmount: assietteT2,
    amount: agircT2Amount,
    payer: 'employee',
    category: 'pension',
    optional: false,
    legalReference: 'Accord ANI 17 nov. 2017 — taux T2 salarié 8,64%',
  }

  // CEG T1: 0.86%
  const cegT1Amount = Math.round(assietteT1 * 0.0086 * 100) / 100
  const cegT1: ContributionLine = {
    label: 'CEG (T1)',
    labelKey: 'contribution.ceg_t1',
    rate: 0.0086,
    baseAmount: assietteT1,
    amount: cegT1Amount,
    payer: 'employee',
    category: 'other',
    optional: false,
    legalReference: 'Accord ANI 17 nov. 2017 — CEG salarié 0,86%',
  }

  // CEG T2: 1.08%
  const cegT2Amount = Math.round(assietteT2 * 0.0108 * 100) / 100
  const cegT2: ContributionLine = {
    label: 'CEG (T2)',
    labelKey: 'contribution.ceg_t2',
    rate: 0.0108,
    baseAmount: assietteT2,
    amount: cegT2Amount,
    payer: 'employee',
    category: 'other',
    optional: false,
    legalReference: 'Accord ANI 17 nov. 2017 — CEG salarié 1,08%',
  }

  // Assiette CSG/CRDS = brut × 98.25%
  const assietteCSG = gross * 0.9825

  // CSG déductible: 6.80%
  const csgDedAmount = Math.round(assietteCSG * 0.068 * 100) / 100
  const csgDed: ContributionLine = {
    label: 'CSG déductible',
    labelKey: 'contribution.csg_deductible',
    rate: 0.068,
    baseAmount: assietteCSG,
    amount: csgDedAmount,
    payer: 'employee',
    category: 'health',
    optional: false,
    legalReference: 'Art. L136-1 CSS — CSG déductible 6,80%',
  }

  // CSG non déductible: 2.40%
  const csgNonDedAmount = Math.round(assietteCSG * 0.024 * 100) / 100
  const csgNonDed: ContributionLine = {
    label: 'CSG non déductible',
    labelKey: 'contribution.csg_non_deductible',
    rate: 0.024,
    baseAmount: assietteCSG,
    amount: csgNonDedAmount,
    payer: 'employee',
    category: 'health',
    optional: false,
    legalReference: 'Art. L136-1 CSS — CSG non déductible 2,40%',
  }

  // CRDS: 0.50%
  const crdsAmount = Math.round(assietteCSG * 0.005 * 100) / 100
  const crds: ContributionLine = {
    label: 'CRDS',
    labelKey: 'contribution.crds',
    rate: 0.005,
    baseAmount: assietteCSG,
    amount: crdsAmount,
    payer: 'employee',
    category: 'health',
    optional: false,
    legalReference: 'Ord. n°96-50 du 24 janv. 1996 — CRDS 0,50%',
  }

  const employeeContributions: ContributionLine[] = [
    avT1, avT2, agircT1, agircT2, cegT1, cegT2, csgDed, csgNonDed, crds,
  ]

  const totalEmployeeDeductions = employeeContributions.reduce((s, c) => s + c.amount, 0)

  // ── Cotisations patronales ──────────────────────────────────────────────
  // Source: URSSAF taux AT/MP moyens + cotisations patronales 2024

  const erMalAmount = Math.round(gross * 0.13 * 100) / 100
  const erMal: ContributionLine = {
    label: 'Assurance maladie (patronale)',
    labelKey: 'contribution.er_health',
    rate: 0.13,
    baseAmount: gross,
    amount: erMalAmount,
    payer: 'employer',
    category: 'health',
    optional: false,
    legalReference: 'Art. D242-6-4 CSS — taux 13%',
  }

  const erVieillT1Amount = Math.round(assietteT1 * 0.0855 * 100) / 100
  const erVieillT1: ContributionLine = {
    label: 'Vieillesse patronale (T1)',
    labelKey: 'contribution.er_pension_t1',
    rate: 0.0855,
    baseAmount: assietteT1,
    amount: erVieillT1Amount,
    payer: 'employer',
    category: 'pension',
    optional: false,
    legalReference: 'Art. D242-3 CSS — taux patronal 8,55%',
  }

  const erVieillT2Amount = Math.round(gross * 0.0175 * 100) / 100
  const erVieillT2: ContributionLine = {
    label: 'Vieillesse patronale (déplafonnée)',
    labelKey: 'contribution.er_pension_t2',
    rate: 0.0175,
    baseAmount: gross,
    amount: erVieillT2Amount,
    payer: 'employer',
    category: 'pension',
    optional: false,
    legalReference: 'Art. D242-3 CSS — taux déplafonné 1,75%',
  }

  const erAgircT1Amount = Math.round(assietteT1 * 0.0486 * 100) / 100
  const erAgircT1: ContributionLine = {
    label: 'AGIRC-ARRCO patronal (T1)',
    labelKey: 'contribution.er_complementary_t1',
    rate: 0.0486,
    baseAmount: assietteT1,
    amount: erAgircT1Amount,
    payer: 'employer',
    category: 'pension',
    optional: false,
    legalReference: 'Accord ANI 17 nov. 2017 — taux T1 patronal 4,86%',
  }

  const erAgircT2Amount = Math.round(assietteT2 * 0.1296 * 100) / 100
  const erAgircT2: ContributionLine = {
    label: 'AGIRC-ARRCO patronal (T2)',
    labelKey: 'contribution.er_complementary_t2',
    rate: 0.1296,
    baseAmount: assietteT2,
    amount: erAgircT2Amount,
    payer: 'employer',
    category: 'pension',
    optional: false,
    legalReference: 'Accord ANI 17 nov. 2017 — taux T2 patronal 12,96%',
  }

  const erChomAmount = Math.round(assietteT1 * 0.04 * 100) / 100
  const erChom: ContributionLine = {
    label: 'Assurance chômage (patronale)',
    labelKey: 'contribution.er_unemployment',
    rate: 0.04,
    baseAmount: assietteT1,
    amount: erChomAmount,
    payer: 'employer',
    category: 'unemployment',
    optional: false,
    legalReference: 'Art. L5422-9 CT — taux patronal 4%',
  }

  const erFamilleAmount = Math.round(gross * 0.0525 * 100) / 100
  const erFamille: ContributionLine = {
    label: 'Allocations familiales',
    labelKey: 'contribution.er_family',
    rate: 0.0525,
    baseAmount: gross,
    amount: erFamilleAmount,
    payer: 'employer',
    category: 'family',
    optional: false,
    legalReference: 'Art. D242-6-1 CSS — taux réduit 5,25% si salaire ≤ 3,5 SMIC',
  }

  const erAtMpAmount = Math.round(gross * 0.007 * 100) / 100
  const erAtMp: ContributionLine = {
    label: 'AT/MP (taux moyen)',
    labelKey: 'contribution.er_accident',
    rate: 0.007,
    baseAmount: gross,
    amount: erAtMpAmount,
    payer: 'employer',
    category: 'other',
    optional: false,
    legalReference: 'Art. L242-5 CSS — taux variable selon risque',
  }

  const erCegT1Amount = Math.round(assietteT1 * 0.0129 * 100) / 100
  const erCegT1: ContributionLine = {
    label: 'CEG patronal (T1)',
    labelKey: 'contribution.er_ceg_t1',
    rate: 0.0129,
    baseAmount: assietteT1,
    amount: erCegT1Amount,
    payer: 'employer',
    category: 'other',
    optional: false,
    legalReference: 'Accord ANI 17 nov. 2017 — CEG patronal T1 1,29%',
  }

  const erCegT2Amount = Math.round(assietteT2 * 0.0162 * 100) / 100
  const erCegT2: ContributionLine = {
    label: 'CEG patronal (T2)',
    labelKey: 'contribution.er_ceg_t2',
    rate: 0.0162,
    baseAmount: assietteT2,
    amount: erCegT2Amount,
    payer: 'employer',
    category: 'other',
    optional: false,
    legalReference: 'Accord ANI 17 nov. 2017 — CEG patronal T2 1,62%',
  }

  const employerContributions: ContributionLine[] = [
    erMal, erVieillT1, erVieillT2, erAgircT1, erAgircT2, erChom, erFamille, erAtMp, erCegT1, erCegT2,
  ]

  const totalEmployerContributions = employerContributions.reduce((s, c) => s + c.amount, 0)

  // ── Impôt sur le revenu ─────────────────────────────────────────────────

  // Revenu net imposable = brut - cotisations déductibles - abattement 10%
  const cotisationsDed = avT1Amount + avT2Amount + agircT1Amount + agircT2Amount + cegT1Amount + cegT2Amount + csgDedAmount
  const revenuAvantAbattement = gross - cotisationsDed
  const abattement = Math.max(495, Math.min(14_171, revenuAvantAbattement * 0.10))
  const rni = Math.max(0, revenuAvantAbattement - abattement)

  const parts = getFamilyParts(input.familyStatus, input.numChildren)
  let ir = calcIRWithQuotient(rni, parts)
  ir = applyDecote(ir, isCouple)
  ir = Math.max(0, Math.round(ir * 100) / 100)

  const irLine: ContributionLine = {
    label: 'Impôt sur le revenu',
    labelKey: 'contribution.income_tax',
    rate: gross > 0 ? ir / gross : 0,
    baseAmount: rni,
    amount: ir,
    payer: 'employee',
    category: 'tax',
    optional: false,
    legalReference: 'Art. 197 CGI — barème progressif 2024',
  }

  const incomeTaxLines: ContributionLine[] = [irLine]
  const totalIncomeTax = ir

  // ── Résultats ───────────────────────────────────────────────────────────

  const netAnnual = Math.round((gross - totalEmployeeDeductions - totalIncomeTax) * 100) / 100
  const employerCostAnnual = Math.round((gross + totalEmployerContributions) * 100) / 100
  const effectiveTaxRate = gross > 0 ? (totalEmployeeDeductions + totalIncomeTax) / gross : 0

  return {
    country: 'FR',
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
    disclaimer: 'Simulation indicative basée sur le barème 2024. Ne constitue pas un avis fiscal.',
  }
}
