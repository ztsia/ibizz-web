export { default as WorkflowClientSelection } from './WorkflowClientSelection.vue';
export { default as WorkflowAccountingPeriod } from './WorkflowAccountingPeriod.vue';
export { default as WorkflowDataEntryMethod } from './WorkflowDataEntryMethod.vue';
export { default as WorkflowManualEntry } from './WorkflowManualEntry.vue';
export { default as WorkflowUpload } from './WorkflowUpload.vue';
export { default as WorkflowClassify } from './WorkflowClassify.vue';
export { default as WorkflowExtract } from './WorkflowExtract.vue';
export { default as WorkflowExpenseReview } from './WorkflowExpenseReview.vue';
export { default as WorkflowIncomeExtraction } from './WorkflowIncomeExtraction.vue';
export { default as WorkflowCapitalAllowance } from './WorkflowCapitalAllowance.vue';
export { default as WorkflowCompute } from './WorkflowCompute.vue';
export { default as WorkflowReview } from './WorkflowReview.vue';
export { default as WorkflowPreview } from './WorkflowPreview.vue';

// Shared components
export { default as WorkflowDisabledOverlay } from './shared/WorkflowDisabledOverlay.vue';

// Re-export types from the centralized type files
export type {
  AccountingPeriodData,
  UploadedFile,
  ExtractedData,
  TaxResults,
  ReviewData,
  PreviewData,
  FinancialItem,
  BalanceSheetItem,
  IncomeStatementItem,
  ManualEntryData,
  DataEntryMethodData,
} from '../../types/workflow-types';
