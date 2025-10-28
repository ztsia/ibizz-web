// Financial data interfaces

// Financial data change event interface
export interface FinancialDataChangeEvent {
  type: 'income-statement' | 'balance-sheet';
  section: string;
  data: any;
  totals?: {
    [key: string]: number;
  };
}

// Financial item interfaces
export interface FinancialItem {
  name: string;
  value: string | number;
  editable?: boolean;
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

// Financial totals interface
export interface FinancialTotals {
  totalSales?: number;
  totalCostOfSales?: number;
  grossProfit?: number;
  totalOtherIncome?: number;
  totalOperatingExpenses?: number;
  netProfit?: number;
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

// Tax analysis interfaces
export interface TaxAnalysisItem {
  name: string;
  amount: number;
  allowability: 'allowed' | 'disallowed' | 'partial' | 'taxable' | 'exempt';
  category: string;
  notes?: string;
}

export interface Section39Rule {
  rule: string;
  description: string;
  applicable: boolean;
  details: string;
  status: 'allows' | 'disallows' | 'conditional';
  reason: string;
}

export interface AdjustmentNote {
  date: string;
  payee: string;
  s390: boolean;
  s60f: boolean;
  absorb: number;
  amount: number;
  description: string;
}