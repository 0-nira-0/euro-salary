// Spain tax module — 2024
// Sources:
//   - Cotizaciones SS: https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores
//   - IRPF estatal: Ley 35/2006 LIRPF + Orden HAC/1403/2024
//   - Reducción rendimientos trabajo: Art. 20 LIRPF

import type { CalculatorInput, ContributionLine, TaxResult } from '../types'

const MONTHS = 12

// Base máxima cotización SS 2024: 4 909,50 € / mes = 58 914 € / año
const BASE_MAX_SS_ANNUAL = 58_914

// Tramos IRPF estatal 2024
const IRPF_TRANCHES = [
  { min: 0,       max: 12_450,  rate: 0.19 },
  { min: 12_450,  max: 20_200,  rate: 0.24 },
  { min: 20_200,  max: 35_200,  rate: 0.30 },
  { min: 35_200,  max: 60_000,  rate: 0.37 },
  { min: 60_000,  max: 300_000, rate: 0.45 },
  { min: 300_000, max: Infinity, rate: 0.47 },
]

function calcIRPF(base: number): number {
  let tax = 0
  for (const t of IRPF_TRANCHES) {
    if (base <= t.min) break
    tax += (Math.min(base, t.max) - t.min) * t.rate
  }
  return tax
}

// Reducción por rendimientos del trabajo — Art. 20 LIRPF
function getReduccionTrabajo(rendimientoNeto: number): number {
  if (rendimientoNeto <= 14_852) return 7_302
  if (rendimientoNeto <= 17_673.52) return 7_302 - 1.14 * (rendimientoNeto - 14_852)
  return 0
}

export function calculateSpain(input: CalculatorInput): TaxResult {
  const gross = input.grossAnnual
  const ssBase = Math.min(gross, BASE_MAX_SS_ANNUAL)

  // ── Cotizaciones trabajador ─────────────────────────────────────────────

  // Contingencias comunes: 4.70%
  const ccAmount = Math.round(ssBase * 0.047 * 100) / 100
  const cc: ContributionLine = {
    label: 'Contingencias comunes',
    labelKey: 'contribution.social_security',
    rate: 0.047,
    baseAmount: ssBase,
    amount: ccAmount,
    payer: 'employee',
    category: 'health',
    optional: false,
    legalReference: 'Art. 145 LGSS — tipo trabajador contingencias comunes 4,70%',
  }

  // Desempleo: 1.55%
  const desempAmount = Math.round(ssBase * 0.0155 * 100) / 100
  const desemp: ContributionLine = {
    label: 'Desempleo',
    labelKey: 'contribution.unemployment',
    rate: 0.0155,
    baseAmount: ssBase,
    amount: desempAmount,
    payer: 'employee',
    category: 'unemployment',
    optional: false,
    legalReference: 'Art. 269 LGSS — tipo desempleo trabajador 1,55%',
  }

  // Formación profesional: 0.10%
  const fpAmount = Math.round(ssBase * 0.001 * 100) / 100
  const fp: ContributionLine = {
    label: 'Formación profesional',
    labelKey: 'contribution.training',
    rate: 0.001,
    baseAmount: ssBase,
    amount: fpAmount,
    payer: 'employee',
    category: 'other',
    optional: false,
    legalReference: 'Art. 299 LGSS — tipo formación profesional trabajador 0,10%',
  }

  const employeeContributions: ContributionLine[] = [cc, desemp, fp]
  const totalEmployeeDeductions_ss = employeeContributions.reduce((s, c) => s + c.amount, 0)

  // ── IRPF ────────────────────────────────────────────────────────────────

  // Mínimo personal: 5 550 € (general) + 1 150 € si > 65 años (not modeled)
  const minimoPersonal = 5_550
  // Mínimo por descendientes: 2 400 € (1er hijo), 2 700 € (2o), 4 000 € (3o+)
  const minimoDescendientes = [2_400, 2_700, 4_000]
  let minimoFamiliar = minimoPersonal
  for (let i = 0; i < input.numChildren; i++) {
    minimoFamiliar += minimoDescendientes[Math.min(i, 2)] ?? 4_000
  }

  const rendimientoNeto = gross - totalEmployeeDeductions_ss
  const reduccionTrabajo = getReduccionTrabajo(rendimientoNeto)
  const baseImponible = Math.max(0, rendimientoNeto - reduccionTrabajo)

  const cuotaIntegra = Math.max(0, calcIRPF(baseImponible) - calcIRPF(minimoFamiliar))
  const irpf = Math.round(cuotaIntegra * 100) / 100

  const irpfLine: ContributionLine = {
    label: 'IRPF',
    labelKey: 'contribution.income_tax',
    rate: gross > 0 ? irpf / gross : 0,
    baseAmount: baseImponible,
    amount: irpf,
    payer: 'employee',
    category: 'tax',
    optional: false,
    legalReference: 'Art. 63 LIRPF — escala general estatal 2024',
  }

  const incomeTaxLines: ContributionLine[] = [irpfLine]
  const totalIncomeTax = irpf

  // ── Cotizaciones empresa ─────────────────────────────────────────────────

  const erCcAmount = Math.round(ssBase * 0.236 * 100) / 100
  const erCc: ContributionLine = {
    label: 'Contingencias comunes (empresa)',
    labelKey: 'contribution.er_social_security',
    rate: 0.236,
    baseAmount: ssBase,
    amount: erCcAmount,
    payer: 'employer',
    category: 'health',
    optional: false,
    legalReference: 'Art. 145 LGSS — tipo empresarial contingencias comunes 23,60%',
  }

  const erDesempAmount = Math.round(ssBase * 0.055 * 100) / 100
  const erDesemp: ContributionLine = {
    label: 'Desempleo (empresa)',
    labelKey: 'contribution.er_unemployment',
    rate: 0.055,
    baseAmount: ssBase,
    amount: erDesempAmount,
    payer: 'employer',
    category: 'unemployment',
    optional: false,
    legalReference: 'Art. 269 LGSS — tipo empresarial desempleo 5,5%',
  }

  const erFpAmount = Math.round(ssBase * 0.006 * 100) / 100
  const erFp: ContributionLine = {
    label: 'Formación profesional (empresa)',
    labelKey: 'contribution.er_training',
    rate: 0.006,
    baseAmount: ssBase,
    amount: erFpAmount,
    payer: 'employer',
    category: 'other',
    optional: false,
    legalReference: 'Art. 299 LGSS — tipo empresarial formación 0,60%',
  }

  const erFogasaAmount = Math.round(ssBase * 0.002 * 100) / 100
  const erFogasa: ContributionLine = {
    label: 'FOGASA',
    labelKey: 'contribution.er_fogasa',
    rate: 0.002,
    baseAmount: ssBase,
    amount: erFogasaAmount,
    payer: 'employer',
    category: 'other',
    optional: false,
    legalReference: 'Art. 33 ET — FOGASA 0,20%',
  }

  const employerContributions: ContributionLine[] = [erCc, erDesemp, erFp, erFogasa]
  const totalEmployerContributions = employerContributions.reduce((s, c) => s + c.amount, 0)
  const totalEmployeeDeductions = totalEmployeeDeductions_ss

  const netAnnual = Math.round((gross - totalEmployeeDeductions - totalIncomeTax) * 100) / 100
  const employerCostAnnual = Math.round((gross + totalEmployerContributions) * 100) / 100
  const effectiveTaxRate = gross > 0 ? (totalEmployeeDeductions + totalIncomeTax) / gross : 0

  return {
    country: 'ES',
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
    disclaimer: 'Simulación orientativa basada en el baremo IRPF estatal 2024. Sin valor de asesoramiento fiscal.',
  }
}
