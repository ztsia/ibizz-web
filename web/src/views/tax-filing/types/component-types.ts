// Component interfaces for tax-filing components

// BalanceSheet component interfaces
export interface BalanceSheetProps {
  editable?: boolean;
  companyName?: string;
  reportingPeriod?: string;
}

export interface BalanceSheetEmits {
  (e: 'data-change', data: any): void;
}

// IncomeStatement component interfaces
export interface IncomeStatementProps {
  editable?: boolean;
  showAdjustments?: boolean;
  showTaxAnalysis?: boolean;
  companyName?: string;
  reportingPeriod?: string;
}

export interface IncomeStatementEmits {
  (e: 'data-change', data: any): void;
  (e: 'adjustment-click', index: number): void;
}

// AdjustmentNotesModal component interfaces
export interface AdjustmentNotesModalProps {
  visible: boolean;
  selectedExpenseIndex: number | string;
  expenseName?: string;
  incomeStatementData?: any;
  section39Eligibility?: any;
  linkedItem?: {
    id: string;
    description: string;
    amount: number;
    type: string;
  };
}

export interface AdjustmentNotesModalEmits {
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}

// ClientSidebar component interfaces
export interface ClientSidebarUploadedFile {
  name: string;
  size?: number;
  type?: string;
  status?: string;
}

export interface ClientSidebarStepResults {
  upload?: {
    files: {
      name: string;
      size: string;
      type: string;
      status: string;
    }[];
    totalFiles: number;
    totalSize: string;
  };
  [key: string]: any;
}

export interface ClientSidebarProps {
  visible?: boolean;
  currentWorkflowStep?: number;
  stepResults?: ClientSidebarStepResults;
  uploadedFiles?: ClientSidebarUploadedFile[];
}

export interface ClientSidebarEmits {
  'collapse-changed': [collapsed: boolean];
}

// Shared ProfitLossStatementModal interfaces (if needed)
export interface ProfitLossStatementModalProps {
  visible?: boolean;
  statementType?: 'profit-loss' | 'balance-sheet';
}

export interface ProfitLossStatementModalEmits {
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}
