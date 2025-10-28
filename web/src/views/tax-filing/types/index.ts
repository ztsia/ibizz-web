export interface TaxFiling {
  clientName: string;
  createdAt: string;
  createdBy: string;
  extractedData?: ExtractedData;
  filingType: 'corporate' | 'individual' | 'partnership';
  finalAnalysis?: FinalAnalysis;
  id: string;
  previewGenerated?: boolean;
  status: TaxFilingStatus;
  taxYear: number;
  updatedAt: string;
  uploadedFiles: UploadedFile[];
  validationResults?: ValidationResults;
  workflowStep: WorkflowStep;
}

export type TaxFilingStatus =
  | 'analysis_complete'
  | 'completed'
  | 'data_extracted'
  | 'data_validated'
  | 'draft'
  | 'error'
  | 'file_classified'
  | 'file_uploaded'
  | 'preview_generated'
  | 'user_confirmed';

export type WorkflowStep =
  | 'analyze'
  | 'classify'
  | 'complete'
  | 'confirm'
  | 'extract'
  | 'form-c'
  | 'preview'
  | 'tax-computation'
  | 'upload'
  | 'validate';

export interface UploadedFile {
  classification?: FileClassification;
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface FileClassification {
  confidence: number;
  detectedContent: string[];
  processingTool: 'excel_loader' | 'ocr' | 'pdf_loader';
  type: 'excel' | 'image' | 'pdf';
}

export interface ExtractedData {
  deductionData?: DeductionData;
  extractedAt: string;
  incomeData?: IncomeData;
  personalInfo?: PersonalInfo;
  rawData: Record<string, any>;
  taxCalculations?: TaxCalculations;
}

export interface PersonalInfo {
  address: string;
  dependents: number;
  filingStatus: string;
  name: string;
  ssn?: string;
}

export interface IncomeData {
  businessIncome: number;
  dividends: number;
  interest: number;
  otherIncome: number;
  totalIncome: number;
  wages: number;
}

export interface DeductionData {
  deductionDetails: Record<string, number>;
  itemizedDeductions: number;
  standardDeduction: number;
  totalDeductions: number;
}

export interface TaxCalculations {
  adjustedGrossIncome: number;
  effectiveRate: number;
  refundDue: number;
  taxableIncome: number;
  taxOwed: number;
  taxWithheld: number;
}

export interface ValidationResults {
  completenessScore: number;
  errors: ValidationError[];
  isComplete: boolean;
  missingFields: string[];
  validatedAt: string;
  warnings: ValidationWarning[];
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'high' | 'low' | 'medium';
}

export interface ValidationError {
  code: string;
  field: string;
  message: string;
}

export interface FinalAnalysis {
  analyzedAt: string;
  potentialSavings: number;
  recommendations: Recommendation[];
  riskAssessment: RiskAssessment;
  taxStrategy: TaxStrategy;
}

export interface TaxStrategy {
  currentYearOptimizations: string[];
  longTermStrategies: string[];
  nextYearPlanning: string[];
}

export interface Recommendation {
  category: 'credit' | 'deduction' | 'structure' | 'timing';
  description: string;
  id: string;
  impact: 'high' | 'low' | 'medium';
  implementationDifficulty: 'complex' | 'easy' | 'medium';
  potentialSavings: number;
  title: string;
}

export interface RiskAssessment {
  auditProbability: number;
  mitigationStrategies: string[];
  overallRisk: 'high' | 'low' | 'medium';
  riskFactors: string[];
}

export interface WorkflowStepConfig {
  canSkip: boolean;
  description: string;
  icon: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isError: boolean;
  step: WorkflowStep;
  title: string;
}

export interface TaxFilingFormData {
  clientName: string;
  description?: string;
  filingType: 'corporate' | 'individual' | 'partnership';
  taxYear: number;
}

// Re-export AI Chat Assistant types
export * from './ai-chat';

// Re-export Timeline types
export * from './timeline-types';
