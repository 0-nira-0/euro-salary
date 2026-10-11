export const COUNTRIES = ['FR', 'DE', 'ES', 'IT', 'BE', 'PL'] as const
export type Country = (typeof COUNTRIES)[number]
export const DIRECTIONS = ['gross_to_net', 'net_to_gross'] as const
export type Direction = (typeof DIRECTIONS)[number]
export type EmploymentType = 'employee' | 'executive' | 'part_time'
export const FAMILY_STATUSES = ['single', 'married', 'married_1income', 'single_parent'] as const
export type FamilyStatus = (typeof FAMILY_STATUSES)[number]

export interface CalculatorInput {
  country: Country
  grossAnnual: number
  direction: Direction
  employmentType: EmploymentType
  familyStatus: FamilyStatus
  numChildren: number
}

export interface ContributionLine {
  label: string
  labelKey: string
  rate: number
  baseAmount: number
  amount: number
  payer: 'employee' | 'employer' | 'both'
  category: 'health' | 'pension' | 'unemployment' | 'family' | 'tax' | 'other'
  optional: boolean
  legalReference: string
}

export interface TaxResult {
  country: Country
  grossAnnual: number
  grossMonthly: number
  netAnnual: number
  netMonthly: number
  employerCostAnnual: number
  employerCostMonthly: number
  effectiveTaxRate: number
  employeeContributions: ContributionLine[]
  employerContributions: ContributionLine[]
  incomeTaxLines: ContributionLine[]
  totalEmployeeDeductions: number
  totalEmployerContributions: number
  totalIncomeTax: number
  year: number
  disclaimer: string
}
