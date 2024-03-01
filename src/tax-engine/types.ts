export type Country = 'FR' | 'DE' | 'ES' | 'IT' | 'BE' | 'PL'
export type Direction = 'gross_to_net' | 'net_to_gross'
export type EmploymentType = 'employee' | 'executive' | 'part_time'

export interface CalculatorInput {
  country: Country
  grossAnnual: number
  direction: Direction
  employmentType: EmploymentType
  hoursPerWeek?: number
  hasCompanyBonus?: boolean
  mealVouchers?: number
  transportAllowance?: number
  hasPrivatePension?: boolean
  familyStatus: 'single' | 'married' | 'married_1income' | 'single_parent'
  numChildren: number
  regionCode?: string
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
