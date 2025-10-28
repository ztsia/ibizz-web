// Workflow component interfaces

// Common interfaces used across workflow components
export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  status: string;
  file: File;
}

export interface FinancialItem {
  description: string;
  amount: number;
  sheet_source: string;
  editable?: boolean;
}

export interface ExtractedData {
  income: number;
  withholding: number;
  deductions: number;
  expenses: FinancialItem[];
  tradingPLExpenses: FinancialItem[];
  manufacturingExpenses: FinancialItem[];
  reviewStatus: 'pending' | 'rejected' | 'approved';
}

export interface TaxResults {
  totalTax: number;
  refund: number;
  income: number;
  grossIncome: number;
  adjustedGrossIncome: number;
  federalTax: number;
  stateTax: number;
  totalWithholding: number;
}

export interface ReviewData {
  validated: boolean;
  recommendations: string[];
}

export interface PreviewData {
  action: 'save_draft' | 'submit';
  submitted?: boolean;
}

export interface AccountingPeriodData {
  accountingPeriod: {
    startDate: string;
    endDate: string;
  };
  basicPeriod: {
    startDate: string;
    endDate: string;
  };
}

// Workflow component Props interfaces
export interface WorkflowUploadProps {
  uploadedFiles?: UploadedFile[];
  disabled?: boolean;
}

export interface WorkflowClassifyProps {
  uploadedFiles?: UploadedFile[];
  disabled?: boolean;
}

export interface WorkflowExtractProps {
  disabled?: boolean;
}

export interface WorkflowComputeProps {
  disabled?: boolean;
}

export interface WorkflowReviewProps {
  disabled?: boolean;
}

export interface WorkflowPreviewProps {
  disabled?: boolean;
}

export interface WorkflowAccountingPeriodProps {
  disabled?: boolean;
}

export interface WorkflowExpenseReviewProps {
  disabled?: boolean;
}

export interface WorkflowIncomeExtractionProps {
  disabled?: boolean;
}

export interface WorkflowCapitalAllowanceProps {
  disabled?: boolean;
}

export interface WorkflowMalaysianTaxWorksheetsProps {
  disabled?: boolean;
}

export interface WorkflowDataEntryMethodProps {
  disabled?: boolean;
}

export interface WorkflowManualEntryBalanceSheetProps {
  disabled?: boolean;
}

export interface WorkflowManualEntryIncomeStatementProps {
  disabled?: boolean;
}

export interface WorkflowManualEntryProps {
  disabled?: boolean;
}

// Manual entry data structures
export interface BalanceSheetItem {
  id: string;
  description: string;
  amount: number;
  type:
    | 'fixed-assets'
    | 'investment'
    | 'current-assets'
    | 'current-liabilities'
    | 'capital'
    | 'long-term-liabilities';
  group: string;
  editable?: boolean;
}

export interface IncomeStatementItem {
  id: string;
  description: string;
  amount: number;
  title: 'revenue' | 'cost-of-sales' | 'other-income' | 'operating-expenses';
  group: string;
  disallow?: boolean;
  disallowAmount?: number;
  editable?: boolean;
}

export interface ManualEntryData {
  balanceSheet: BalanceSheetItem[];
  incomeStatement: IncomeStatementItem[];
}

export interface DataEntryMethodData {
  method: 'manual' | 'upload';
}

// Workflow component Emits interfaces
export interface WorkflowUploadEmits {
  (e: 'file-upload', files: UploadedFile[]): void;
  (e: 'step-complete', data: { files: UploadedFile[] }): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowClassifyEmits {
  (e: 'step-complete', data: { classifications: UploadedFile[] }): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowExtractEmits {
  (
    e: 'step-complete' | 'extraction-detected',
    data: { extractedData: ExtractedData },
  ): void;
  (e: 'step-loaded' | 'data-cleared'): void;
  (
    e: 'review-status-updated',
    data: {
      reviewedItems: number;
      totalItems: number;
      criticalReviewed: number;
      totalCritical: number;
      allCriticalReviewed: boolean;
      overallProgress: number;
    },
  ): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
  (e: 'file-reupload', data: { files: File[] }): void;
}

export interface WorkflowComputeEmits {
  (e: 'step-complete', data: { taxResults: TaxResults }): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowReviewEmits {
  (e: 'step-complete', data: ReviewData): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowPreviewEmits {
  (e: 'step-complete', data: PreviewData): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowAccountingPeriodEmits {
  (e: 'period-selected' | 'step-complete', data: AccountingPeriodData): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowIncomeExtractionEmits {
  (e: 'step-complete', data: any): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowExpenseReviewEmits {
  (e: 'step-complete', data: { reviewStats: any }): void;
  (e: 'step-completed', data: { canComplete: boolean }): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowCapitalAllowanceEmits {
  (e: 'step-complete', data: any): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowMalaysianTaxWorksheetsEmits {
  (e: 'step-complete' | 'worksheet-viewed', data: any): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
  (e: 'worksheet-exported', worksheet: any, format: string): void;
}

export interface WorkflowDataEntryMethodEmits {
  (e: 'method-selected', data: DataEntryMethodData): void;
  (e: 'step-complete', data: DataEntryMethodData): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowManualEntryBalanceSheetEmits {
  (e: 'data-updated', data: { balanceSheet: BalanceSheetItem[] }): void;
  (e: 'step-complete', data: { balanceSheet: BalanceSheetItem[] }): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowManualEntryIncomeStatementEmits {
  (e: 'data-updated', data: { incomeStatement: IncomeStatementItem[] }): void;
  (e: 'step-complete', data: { incomeStatement: IncomeStatementItem[] }): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}

export interface WorkflowManualEntryEmits {
  (
    e: 'step-complete',
    data: {
      balanceSheet: {
        items: BalanceSheetItem[];
        totals: {
          assets: number;
          liabilitiesAndEquity: number;
          isBalanced: boolean;
        };
      };
      incomeStatement: {
        items: IncomeStatementItem[];
        totals: {
          revenue: number;
          costOfSales: number;
          otherIncome: number;
          operatingExpenses: number;
          netProfit: number;
        };
      };
    },
  ): void;
  (e: 'step-loaded'): void;
  (e: 'step-shown', data: { stepIndex: number; step: any }): void;
}
