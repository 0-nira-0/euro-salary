// Poland tax module — 2024
// Sources:
//   - ZUS składki: https://www.zus.pl/skladki/wysokosc-skladek/pracownicy
//   - PIT: Ustawa z dnia 26 lipca 1991 r. o podatku dochodowym od osób fizycznych
//   - Kwota wolna od podatku 30 000 PLN: Art. 27 ust. 1 updof (Polski Ład)

import type { CalculatorInput, ContributionLine, TaxResult } from '../types'

const MONTHS = 12

// Roczna podstawa wymiaru składek na ubezpieczenia emerytalne i rentowe 2024
// 30-krotność przeciętnego wynagrodzenia ≈ 234 720 PLN
const PODSTAWA_MAX_ER = 234_720

// PIT 2024
const KWOTA_WOLNA = 30_000
const PROG_PODATKOWY = 120_000
const STAWKA_NIZSZY = 0.12
const STAWKA_WYZSZY = 0.32

function calcPIT(podstawa: number): number {
  if (podstawa <= KWOTA_WOLNA) return 0
  if (podstawa <= PROG_PODATKOWY) {
    return (podstawa - KWOTA_WOLNA) * STAWKA_NIZSZY
  }
  return (PROG_PODATKOWY - KWOTA_WOLNA) * STAWKA_NIZSZY + (podstawa - PROG_PODATKOWY) * STAWKA_WYZSZY
}

export function calculatePoland(input: CalculatorInput): TaxResult {
  const gross = input.grossAnnual

  // Podstawa emerytalno-rentowa (ograniczona 30-krotnością)
  const podstawaER = Math.min(gross, PODSTAWA_MAX_ER)

  // ── Składki pracownicze ─────────────────────────────────────────────────

  // Emerytalne: 9.76%
  const emerAmount = Math.round(podstawaER * 0.0976 * 100) / 100
  const emer: ContributionLine = {
    label: 'Składka emerytalna',
    labelKey: 'contribution.pension',
    rate: 0.0976,
    baseAmount: podstawaER,
    amount: emerAmount,
    payer: 'employee',
    category: 'pension',
    optional: false,
    legalReference: 'Art. 22 ust. 1 ustawy o SUS — składka emerytalna pracownik 9,76%',
  }

  // Rentowe: 1.5%
  const rentoweAmount = Math.round(podstawaER * 0.015 * 100) / 100
  const rentowe: ContributionLine = {
    label: 'Składka rentowa',
    labelKey: 'contribution.disability',
    rate: 0.015,
    baseAmount: podstawaER,
    amount: rentoweAmount,
    payer: 'employee',
    category: 'pension',
    optional: false,
    legalReference: 'Art. 22 ust. 1 ustawy o SUS — składka rentowa pracownik 1,5%',
  }

  // Chorobowe: 2.45%
  const choroboweAmount = Math.round(gross * 0.0245 * 100) / 100
  const chorobowe: ContributionLine = {
    label: 'Składka chorobowa',
    labelKey: 'contribution.sickness',
    rate: 0.0245,
    baseAmount: gross,
    amount: choroboweAmount,
    payer: 'employee',
    category: 'health',
    optional: false,
    legalReference: 'Art. 22 ust. 3 ustawy o SUS — składka chorobowa 2,45%',
  }

  const employeeContributions: ContributionLine[] = [emer, rentowe, chorobowe]
  const totalEmployeeDeductions_zus = employeeContributions.reduce((s, c) => s + c.amount, 0)

  // ── Składka zdrowotna ────────────────────────────────────────────────────

  // Podstawa zdrowotna = gross - składki społeczne
  const podstawaZdrowotna = gross - totalEmployeeDeductions_zus
  // Składka zdrowotna: 9% (od 2022 nie ma odliczenia od podatku)
  const zdrowotnaAmount = Math.round(podstawaZdrowotna * 0.09 * 100) / 100
  const zdrowotna: ContributionLine = {
    label: 'Składka zdrowotna',
    labelKey: 'contribution.health',
    rate: 0.09,
    baseAmount: podstawaZdrowotna,
    amount: zdrowotnaAmount,
    payer: 'employee',
    category: 'health',
    optional: false,
    legalReference: 'Art. 79 ust. 1 ustawy o NFZ — składka zdrowotna 9% (od 2022 brak odliczenia)',
  }

  // ── PIT ────────────────────────────────────────────────────────────────────

  // Koszty uzyskania przychodu: 250 PLN/mies = 3 000 PLN/rok
  const kosztyUzP = 3_000
  const podstawaPIT = Math.max(0, gross - totalEmployeeDeductions_zus - kosztyUzP)
  let pit = calcPIT(podstawaPIT)
  pit = Math.round(pit * 100) / 100

  const pitLine: ContributionLine = {
    label: 'Podatek dochodowy (PIT)',
    labelKey: 'contribution.income_tax',
    rate: gross > 0 ? pit / gross : 0,
    baseAmount: podstawaPIT,
    amount: pit,
    payer: 'employee',
    category: 'tax',
    optional: false,
    legalReference: 'Art. 27 ust. 1 updof — skala podatkowa 12%/32%, kwota wolna 30 000 PLN',
  }

  const incomeTaxLines: ContributionLine[] = [pitLine]
  const totalIncomeTax = pit

  // ── Składki pracodawcy ──────────────────────────────────────────────────

  const erEmerAmount = Math.round(podstawaER * 0.0976 * 100) / 100
  const erEmer: ContributionLine = {
    label: 'Emerytalna (pracodawca)',
    labelKey: 'contribution.er_pension',
    rate: 0.0976,
    baseAmount: podstawaER,
    amount: erEmerAmount,
    payer: 'employer',
    category: 'pension',
    optional: false,
    legalReference: 'Art. 22 ust. 1 ustawy o SUS — składka emerytalna pracodawca 9,76%',
  }

  const erRentoweAmount = Math.round(podstawaER * 0.065 * 100) / 100
  const erRentowe: ContributionLine = {
    label: 'Rentowa (pracodawca)',
    labelKey: 'contribution.er_disability',
    rate: 0.065,
    baseAmount: podstawaER,
    amount: erRentoweAmount,
    payer: 'employer',
    category: 'pension',
    optional: false,
    legalReference: 'Art. 22 ust. 1 ustawy o SUS — składka rentowa pracodawca 6,5%',
  }

  const erWypadkoweAmount = Math.round(gross * 0.0167 * 100) / 100
  const erWypadkowe: ContributionLine = {
    label: 'Wypadkowa (pracodawca)',
    labelKey: 'contribution.er_accident',
    rate: 0.0167,
    baseAmount: gross,
    amount: erWypadkoweAmount,
    payer: 'employer',
    category: 'other',
    optional: false,
    legalReference: 'Art. 22 ust. 1 pkt 2a ustawy o SUS — stopa procentowa zależna od działu PKD',
  }

  const erFPAmount = Math.round(gross * 0.01 * 100) / 100
  const erFP: ContributionLine = {
    label: 'Fundusz Pracy',
    labelKey: 'contribution.er_labor_fund',
    rate: 0.01,
    baseAmount: gross,
    amount: erFPAmount,
    payer: 'employer',
    category: 'unemployment',
    optional: false,
    legalReference: 'Art. 104 ustawy o promocji zatrudnienia — Fundusz Pracy 1,0%',
  }

  const employerContributions: ContributionLine[] = [erEmer, erRentowe, erWypadkowe, erFP]
  const totalEmployerContributions = employerContributions.reduce((s, c) => s + c.amount, 0)

  // Total employee deductions include ZUS + healthcare
  const allEmployeeDeductions: ContributionLine[] = [...employeeContributions, zdrowotna]
  const totalEmployeeDeductions = totalEmployeeDeductions_zus + zdrowotnaAmount

  const netAnnual = Math.round((gross - totalEmployeeDeductions - totalIncomeTax) * 100) / 100
  const employerCostAnnual = Math.round((gross + totalEmployerContributions) * 100) / 100
  const effectiveTaxRate = gross > 0 ? (totalEmployeeDeductions + totalIncomeTax) / gross : 0

  return {
    country: 'PL',
    grossAnnual: gross,
    grossMonthly: Math.round((gross / MONTHS) * 100) / 100,
    netAnnual,
    netMonthly: Math.round((netAnnual / MONTHS) * 100) / 100,
    employerCostAnnual,
    employerCostMonthly: Math.round((employerCostAnnual / MONTHS) * 100) / 100,
    effectiveTaxRate,
    employeeContributions: allEmployeeDeductions,
    employerContributions,
    incomeTaxLines,
    totalEmployeeDeductions,
    totalEmployerContributions,
    totalIncomeTax,
    year: 2024,
    disclaimer: 'Szacowanie orientacyjne na podstawie przepisów podatkowych 2024. Nie stanowi porady podatkowej.',
  }
}
