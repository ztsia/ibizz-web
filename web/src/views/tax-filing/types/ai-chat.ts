import type { Component } from 'vue';

/**
 * Agent information for multi-agent system
 */
export interface AgentInfo {
  agentName: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  agentType?:
    | 'coordinator'
    | 'specialist'
    | 'validator'
    | 'processor'
    | 'orchestrator'
    | 'user';
  actions?: Array<{
    label: string;
    action: () => void;
    variant: 'primary' | 'default' | 'secondary';
  }>;
}

/**
 * Active agent information for workflow steps
 */
export interface ActiveAgent {
  name: string;
  progress: number;
  status: 'deploying' | 'processing' | 'completed';
  agentType: 'coordinator' | 'specialist' | 'validator' | 'processor';
}

/**
 * Specialist information for workflow-specific AI agents
 */
export interface SpecialistInfo {
  name: string;
  expertise: string;
  description: string;
}

/**
 * Chat message interface for AI chat assistant
 */
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system' | 'workflow';
  content: string;
  timestamp: Date;
  workflowStep?: string;
  component?: string;
  data?: any;
  agentInfo?: AgentInfo;
  specialistInfo?: SpecialistInfo;
  actions?: Array<{
    id?: string;
    label: string;
    action: () => void;
    variant: 'primary' | 'default' | 'secondary';
  }>;
}

/**
 * Workflow step configuration and status
 */
export interface WorkflowStep {
  id: any;
  name: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'active' | 'completed';
  agents: string[];
  activeAgents?: ActiveAgent[];
}

/**
 * Multi-agent system status tracking
 */
export interface MultiAgentStatus {
  totalAgents: number;
  activeAgents: number;
  completedTasks: number;
  overallProgress: number;
  currentTask: string;
}

/**
 * Slash command configuration
 */
export interface SlashCommand {
  command: string;
  description: string;
  action: () => void;
  icon: Component;
}

/**
 * Component props interface
 */
export interface AIChatAssistantProps {
  visible?: boolean;
  isTyping?: boolean;
  class?: string;
  context?: {
    currentForm?: any;
    analyzedDocuments?: any[];
    userProfile?: any;
  };
  workflowState?: {
    workflowActive: boolean;
    currentWorkflowStep: number;
    workflowSteps: any[];
    selectedClient: any;
    selectedAccountingPeriod: any;
    selectedDataEntryMethod: any;
    manualEntryData: any;
    uploadedFiles: any[];
    extractedData: any;
    taxResults: any;
    messages: any[];
    conversationHistory: any[];
    isGenerating: boolean;
    isWorkflowStepProcessing: boolean;
    streamingText: string;
    sidebarCollapsed: boolean;
  };
  isRestored?: boolean;
}

/**
 * Component emits interface
 */
export interface AIChatAssistantEmits {
  (e: 'action-requested', action: string, data?: any): void;
  (e: 'workflow-step-completed', step: string, data: any): void;
  (e: 'workflow-completed', results: any): void;
  (e: 'update-workflow-state', updates: any): void;
  (e: 'reset-workflow-state'): void;
}

/**
 * Chat timeline step data with completion information
 */
export interface ChatTimelineStep extends WorkflowStep {
  completedAt?: Date;
  results?: any;
}

/**
 * Step results storage structure
 */
export interface StepResults {
  upload?: {
    files: Array<{
      name: string;
      size: string;
      type: string;
      status: string;
    }>;
    totalFiles: number;
    totalSize: string;
  };
  extract?: any;
  compute?: any;
  review?: {
    validationStatus: string;
    errors: any[];
    warnings: any[];
    recommendations: string[];
  };
  preview?: any;
}

/**
 * Hardcoded data structure for demo purposes
 */
export interface HardcodedData {
  personalInfo: {
    name: string;
    address: string;
    registrationNumber: string;
    taxFileNumber: string;
  };
  incomeData: {
    totalIncome: number;
    businessIncome: number;
    otherIncome: number;
  };
  taxCalculations: {
    taxableIncome: number;
    taxOwed: number;
  };
  extractedData: {
    documentType: string;
    companyName: string;
    reportingPeriod: string;
    totalRevenue: string;
    grossProfit: string;
    operatingExpenses: string;
    netProfit: string;
    totalAssets: string;
    totalLiabilities: string;
    shareholdersEquity: string;
    cashFlow: string;
    taxProvision: string;
    depreciation: string;
    workingCapital: string;
    debtorsBalance: string;
    creditorsBalance: string;
    stockValue: string;
  };
  rawData: Record<string, any>;
  formCData: {
    companyName: string;
    registrationNumber: string;
    taxFileNumber: string;
    companyType: string;
    registeredAddress: string;
    a1_businessIncomeMalaysia: number;
    a2_businessIncomeOutsideMalaysia: number;
    a3_aggregateBusinessIncome: number;
    a6_otherIncomeMalaysia: number;
    a7_otherIncomeOutsideMalaysia: number;
    a8_aggregateOtherIncome: number;
    a9_aggregateIncome: number;
    a18_chargeableIncome: number;
    b1_totalChargeableIncome: number;
    b3_totalIncomeTaxCharged: number;
    b10_taxPayable: number;
  };
}

/**
 * Agent type classification
 */
export type AgentType =
  | 'coordinator'
  | 'specialist'
  | 'validator'
  | 'processor';

/**
 * Agent status types
 */
export type AgentStatus = 'idle' | 'processing' | 'completed' | 'error';

/**
 * Active agent status types
 */
export type ActiveAgentStatus = 'deploying' | 'processing' | 'completed';

/**
 * Workflow step status types
 */
export type WorkflowStepStatus = 'pending' | 'active' | 'completed';

/**
 * Chat message types
 */
export type ChatMessageType = 'user' | 'ai' | 'system' | 'workflow';
