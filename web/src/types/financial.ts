// Shared types and interfaces for financial data components

export interface FinancialItem {
  name: string;
  value: string | number;
  adjustmentType?: 'disallowable' | 'allowable' | '';
  notes?: string;
}

export interface IncomeStatementData {
  sales: FinancialItem[];
  costOfSales: FinancialItem[];
  otherIncome: FinancialItem[];
  operatingExpenses: FinancialItem[];
}

export interface BalanceSheetData {
  currentAssets: FinancialItem[];
  nonCurrentAssets: FinancialItem[];
  currentLiabilities: FinancialItem[];
  nonCurrentLiabilities: FinancialItem[];
  equity: FinancialItem[];
}

export interface FinancialTotals {
  totalSales?: number;
  totalCostOfSales?: number;
  totalOtherIncome?: number;
  totalOperatingExpenses?: number;
  grossProfit?: number;
  netProfitBeforeTax?: number;
  netProfitAfterTax?: number;
  retainedEarnings?: number;
  totalCurrentAssets?: number;
  totalNonCurrentAssets?: number;
  totalAssets?: number;
  totalCurrentLiabilities?: number;
  totalNonCurrentLiabilities?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  totalLiabilitiesAndEquity?: number;
  isBalanced?: boolean;
}

export interface IncomeStatementProps {
  editable?: boolean;
  showAdjustments?: boolean;
  showTaxAnalysis?: boolean;
  companyName?: string;
  reportingPeriod?: string;
  data?: IncomeStatementData;
}

export interface BalanceSheetProps {
  editable?: boolean;
  companyName?: string;
  reportingPeriod?: string;
  data?: BalanceSheetData;
}

export interface FinancialDataChangeEvent {
  incomeStatementData?: IncomeStatementData;
  balanceSheetData?: BalanceSheetData;
  totals: FinancialTotals;
}

export interface TaxAnalysisRule {
  section: string;
  name: string;
  status: 'allowed' | 'disallowed' | 'partial';
  description: string;
  reasoning: string;
  details: string;
}

export interface ExpenseAnalysis {
  expenseName: string;
  rule: TaxAnalysisRule;
  allowability: 'allowed' | 'disallowed' | 'partial';
  amount: string | number;
}

// Utility type for section names
export type FinancialSection = 
  | 'sales'
  | 'costOfSales'
  | 'otherIncome'
  | 'operatingExpenses'
  | 'currentAssets'
  | 'nonCurrentAssets'
  | 'currentLiabilities'
  | 'nonCurrentLiabilities'
  | 'equity';

// Event types for component communication
export interface FinancialComponentEmits {
  'data-change': [data: FinancialDataChangeEvent];
  'adjustment-click': [index: number];
  'add-row': [section: FinancialSection];
  'remove-row': [section: FinancialSection, index: number];
}

// Configuration for financial statement display
export interface FinancialStatementConfig {
  currency: string;
  locale: string;
  showCurrency: boolean;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

// Default configuration
export const DEFAULT_FINANCIAL_CONFIG: FinancialStatementConfig = {
  currency: 'RM',
  locale: 'en-MY',
  showCurrency: true,
  decimalPlaces: 0,
  thousandsSeparator: ',',
  decimalSeparator: '.',
};

// Tax analysis constants
export const TAX_SECTIONS = {
  SECTION_39: 'Malaysia Income Tax Act 1967 - Section 39',
  SECTION_32: 'Malaysia Income Tax Act 1967 - Section 32',
  SECTION_44: 'Malaysia Income Tax Act 1967 - Section 44',
} as const;

export const EXPENSE_CATEGORIES = {
  PROFESSIONAL_SERVICES: 'professional_services',
  OFFICE_EXPENSES: 'office_expenses',
  STAFF_COSTS: 'staff_costs',
  UTILITIES: 'utilities',
  RENTAL: 'rental',
  INSURANCE: 'insurance',
  BANK_CHARGES: 'bank_charges',
  DEPRECIATION: 'depreciation',
  ENTERTAINMENT: 'entertainment',
  PENALTIES: 'penalties',
  DONATIONS: 'donations',
  ADVERTISING: 'advertising',
  TRAINING: 'training',
} as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[keyof typeof EXPENSE_CATEGORIES];

// Helper function types
export type FormatNumberFunction = (value: number | string) => string;
export type AddNewRowFunction = (section: FinancialSection) => void;
export type GetExpenseAnalysisFunction = (expenseName: string) => ExpenseAnalysis;