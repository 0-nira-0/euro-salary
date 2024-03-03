// Germany tax module — 2024
// Sources:
//   - Sozialversicherung Beiträge 2024: https://www.sozialversicherung-kompetent.de/
//   - Lohnsteuer Grundtabelle 2024: § 32a EStG
//   - Solidaritätszuschlag: § 3 SolZG
//   - Pflegeversicherung: § 55 SGB XI

import type { CalculatorInput, ContributionLine, TaxResult } from '../types'

const MONTHS = 12

// Beitragsbemessungsgrenzen 2024
const BBG_RENTE_WEST = 90_600  // Rentenversicherung & Arbeitslosenversicherung (West)
const BBG_KV = 66_150          // Krankenversicherung & Pflegeversicherung

// Steuerklasse → tax multipliers (simplified)
// Klasse I: single, Klasse III: married (high earner), Klasse IV: married (equal)
type Steuerklasse = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'

function getSteuerklasse(input: CalculatorInput): Steuerklasse {
  if (input.familyStatus === 'single') return 'I'
  if (input.familyStatus === 'single_parent') return 'II'
  if (input.familyStatus === 'married_1income') return 'III'
  return 'IV'
}

// Lohnsteuer 2024 — § 32a EStG (Grundtabelle)
function calcLohnsteuer(zvE: number, klasse: Steuerklasse): number {
  // Klasse III: double the bracket width (Splitting-Verfahren simplified as factor)
  const factor = klasse === 'III' ? 2 : 1
  const adjusted = zvE / factor

  let tax = 0
  if (adjusted <= 11_604) {
    tax = 0
  } else if (adjusted <= 17_005) {
    const y = (adjusted - 11_604) / 10_000
    tax = (979.18 * y + 1_400) * y
  } else if (adjusted <= 66_760) {
    const z = (adjusted - 17_005) / 10_000
    tax = (192.59 * z + 2_397) * z + 966.53
  } else if (adjusted <= 277_825) {
    tax = 0.42 * adjusted - 10_602.13
  } else {
    tax = 0.45 * adjusted - 18_936.88
  }

  // Kinderbetreuungsfreibetrag (simplified — 2 Freibeträge per child × 3,192 € each)
  // Applied inside Lohnsteuer calculation as reduction to zvE
  return Math.max(0, tax) * factor
}

export function calculateGermany(input: CalculatorInput): TaxResult {
  const gross = input.grossAnnual
  const klasse = getSteuerklasse(input)

  // ── Sozialversicherung Arbeitnehmer ─────────────────────────────────────

  const rvBase = Math.min(gross, BBG_RENTE_WEST)
  const kvBase = Math.min(gross, BBG_KV)

  // Rentenversicherung: 9.3%
  const rvAmount = Math.round(rvBase * 0.093 * 100) / 100
  const rv: ContributionLine = {
    label: 'Rentenversicherung',
    labelKey: 'contribution.pension',
    rate: 0.093,
    baseAmount: rvBase,
    amount: rvAmount,
    payer: 'employee',
    category: 'pension',
    optional: false,
    legalReference: '§ 168 SGB VI — Arbeitnehmerbeitrag 9,3%',
  }

  // Krankenversicherung: 7.3% + 1.7% Zusatzbeitrag (average 2024)
  const kvRate = 0.073 + 0.017
  const kvAmount = Math.round(kvBase * kvRate * 100) / 100
  const kv: ContributionLine = {
    label: 'Krankenversicherung',
    labelKey: 'contribution.health',
    rate: kvRate,
    baseAmount: kvBase,
    amount: kvAmount,
    payer: 'employee',
    category: 'health',
    optional: false,
    legalReference: '§ 241 SGB V — Beitragssatz 14,6% (AN-Anteil 7,3%) + Zusatzbeitrag',
  }

  // Pflegeversicherung: 1.7% (childless 2.2%)
  const pvRate = input.numChildren === 0 && input.familyStatus === 'single' ? 0.022 : 0.017
  const pvAmount = Math.round(kvBase * pvRate * 100) / 100
  const pv: ContributionLine = {
    label: 'Pflegeversicherung',
    labelKey: 'contribution.care',
    rate: pvRate,
    baseAmount: kvBase,
    amount: pvAmount,
    payer: 'employee',
    category: 'health',
    optional: false,
    legalReference: '§ 55 SGB XI — 1,7% (kinderlos 2,2%)',
  }

  // Arbeitslosenversicherung: 1.3%
  const avAmount = Math.round(rvBase * 0.013 * 100) / 100
  const av: ContributionLine = {
    label: 'Arbeitslosenversicherung',
    labelKey: 'contribution.unemployment',
    rate: 0.013,
    baseAmount: rvBase,
    amount: avAmount,
    payer: 'employee',
    category: 'unemployment',
    optional: false,
    legalReference: '§ 341 SGB III — Beitragssatz 2,6% (AN-Anteil 1,3%)',
  }

  const employeeContributions: ContributionLine[] = [rv, kv, pv, av]
  const totalEmployeeDeductions_sv = employeeContributions.reduce((s, c) => s + c.amount, 0)

  // ── Lohnsteuer ──────────────────────────────────────────────────────────

  // Werbungskostenpauschale: 1,230 € / year
  const werbungskosten = 1_230
  // Sonderausgabenpauschale: 36 €
  const sonderausgaben = 36
  // Kinderfreibeträge: 3,192 € × 2 per child (Freibetrag + BEA)
  const kinderfreibetrag = input.numChildren * 6_384

  const zvE = Math.max(0, gross - totalEmployeeDeductions_sv - werbungskosten - sonderausgaben - kinderfreibetrag)
  let lohnsteuer = calcLohnsteuer(zvE, klasse)
  lohnsteuer = Math.round(lohnsteuer * 100) / 100

  // Solidaritätszuschlag: 5.5% of Lohnsteuer, only if Lohnsteuer > 18,130 € (2024 threshold)
  const soliThreshold = 18_130
  let soli = 0
  if (lohnsteuer > soliThreshold) {
    soli = Math.round(lohnsteuer * 0.055 * 100) / 100
  }

  const lstLine: ContributionLine = {
    label: 'Lohnsteuer',
    labelKey: 'contribution.income_tax',
    rate: gross > 0 ? lohnsteuer / gross : 0,
    baseAmount: zvE,
    amount: lohnsteuer,
    payer: 'employee',
    category: 'tax',
    optional: false,
    legalReference: '§ 32a EStG — Grundtabelle 2024',
  }

  const soliLine: ContributionLine = {
    label: 'Solidaritätszuschlag',
    labelKey: 'contribution.solidarity',
    rate: 0.055,
    baseAmount: lohnsteuer,
    amount: soli,
    payer: 'employee',
    category: 'tax',
    optional: false,
    legalReference: '§ 3 SolZG — 5,5% der Lohnsteuer',
  }

  const incomeTaxLines: ContributionLine[] = [lstLine, soliLine]
  const totalIncomeTax = lohnsteuer + soli

  // ── Arbeitgeberbeiträge ─────────────────────────────────────────────────

  const erRvAmount = Math.round(rvBase * 0.093 * 100) / 100
  const erRv: ContributionLine = {
    label: 'RV Arbeitgeber',
    labelKey: 'contribution.er_pension',
    rate: 0.093,
    baseAmount: rvBase,
    amount: erRvAmount,
    payer: 'employer',
    category: 'pension',
    optional: false,
    legalReference: '§ 168 SGB VI — AG-Beitrag 9,3%',
  }

  const erKvAmount = Math.round(kvBase * (0.073 + 0.017) * 100) / 100
  const erKv: ContributionLine = {
    label: 'KV Arbeitgeber',
    labelKey: 'contribution.er_health',
    rate: 0.073 + 0.017,
    baseAmount: kvBase,
    amount: erKvAmount,
    payer: 'employer',
    category: 'health',
    optional: false,
    legalReference: '§ 249 SGB V — AG-Anteil 7,3% + Zusatzbeitrag',
  }

  const erPvAmount = Math.round(kvBase * 0.017 * 100) / 100
  const erPv: ContributionLine = {
    label: 'PV Arbeitgeber',
    labelKey: 'contribution.er_care',
    rate: 0.017,
    baseAmount: kvBase,
    amount: erPvAmount,
    payer: 'employer',
    category: 'health',
    optional: false,
    legalReference: '§ 58 SGB XI — AG-Anteil 1,7%',
  }

  const erAvAmount = Math.round(rvBase * 0.013 * 100) / 100
  const erAv: ContributionLine = {
    label: 'AV Arbeitgeber',
    labelKey: 'contribution.er_unemployment',
    rate: 0.013,
    baseAmount: rvBase,
    amount: erAvAmount,
    payer: 'employer',
    category: 'unemployment',
    optional: false,
    legalReference: '§ 341 SGB III — AG-Anteil 1,3%',
  }

  const employerContributions: ContributionLine[] = [erRv, erKv, erPv, erAv]
  const totalEmployerContributions = employerContributions.reduce((s, c) => s + c.amount, 0)
  const totalEmployeeDeductions = totalEmployeeDeductions_sv

  const netAnnual = Math.round((gross - totalEmployeeDeductions - totalIncomeTax) * 100) / 100
  const employerCostAnnual = Math.round((gross + totalEmployerContributions) * 100) / 100
  const effectiveTaxRate = gross > 0 ? (totalEmployeeDeductions + totalIncomeTax) / gross : 0

  return {
    country: 'DE',
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
    disclaimer: 'Schätzung auf Basis des Lohnsteuertarifs 2024. Keine Rechtsberatung.',
  }
}
