import { ref, computed, readonly } from 'vue';
import {
  // Chat APIs
  generateWelcomeMessageApi,
  streamChatApi,
  generateContextualHelpApi,

  // Analysis APIs
  performTaxAnalysisApi,
  analyzeBalanceSheetApi,
  checkSection39EligibilityApi,

  // Document APIs
  classifyDocumentApi,

  // Workflow APIs
  analyzeWorkflowDecisionApi,
} from '@/api';
import type { ChatApi, AnalysisApi, DocumentApi, WorkflowApi } from '#/api';

/**
 * AI Service composable for Vue components
 * Provides reactive state management and methods for all AI operations
 */
export function useAIService() {
  // Loading states
  const isLoading = ref(false);
  const isStreaming = ref(false);
  const isAnalyzing = ref(false);
  const isClassifying = ref(false);
  const isDeciding = ref(false);

  // Error states
  const error = ref<string | null>(null);
  const lastError = ref<Error | null>(null);

  // Chat state
  const chatMessages = ref<ChatApi.ChatMessage[]>([]);
  const streamingMessage = ref<string>('');
  const currentSpecialist = ref<ChatApi.SpecialistInfo | null>(null);

  // Analysis results
  const lastTaxAnalysis = ref<AnalysisApi.AIAnalysisResult | null>(null);
  const lastBalanceSheetAnalysis =
    ref<AnalysisApi.BalanceSheetAnalysisResult | null>(null);
  const lastSection39Check =
    ref<AnalysisApi.Section39EligibilityResponse | null>(null);

  // Document classification results
  const lastDocumentClassification =
    ref<DocumentApi.DocumentClassificationResult | null>(null);

  // Workflow decision results
  const lastWorkflowDecision = ref<WorkflowApi.WorkflowDecisionResult | null>(
    null,
  );

  // Computed states
  const hasError = computed(() => error.value !== null);
  const isAnyOperationRunning = computed(
    () =>
      isLoading.value ||
      isStreaming.value ||
      isAnalyzing.value ||
      isClassifying.value ||
      isDeciding.value,
  );

  // Helper function to handle errors
  const handleError = (err: unknown, operation: string) => {
    console.error(`AI Service Error (${operation}):`, err);
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    error.value = `${operation}: ${errorMessage}`;
    lastError.value = err instanceof Error ? err : new Error(errorMessage);
  };

  // Helper function to clear error
  const clearError = () => {
    error.value = null;
    lastError.value = null;
  };

  /**
   * Generate welcome message
   */
  const generateWelcomeMessage = async (
    options: ChatApi.WelcomeMessageOptions,
  ): Promise<ChatApi.WelcomeMessageResult | null> => {
    if (isLoading.value) return null;

    isLoading.value = true;
    clearError();

    try {
      const result = await generateWelcomeMessageApi(options);
      return result;
    } catch (error_) {
      handleError(error_, 'Generate Welcome Message');
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Stream chat with AI
   */
  const streamChat = async (
    request: ChatApi.StreamChatRequest,
  ): Promise<void> => {
    if (isStreaming.value) return;

    isStreaming.value = true;
    clearError();
    streamingMessage.value = '';

    try {
      const stream = streamChatApi(request);

      for await (const chunk of stream) {
        switch (chunk.type) {
          case 'message': {
            streamingMessage.value += chunk.content;

            break;
          }
          case 'specialist': {
            currentSpecialist.value = chunk.specialist;

            break;
          }
          case 'error': {
            throw new Error(chunk.error);
          }
          // No default
        }
      }

      // Add the completed message to chat history
      if (streamingMessage.value) {
        chatMessages.value.push({
          id: Date.now().toString(),
          content: streamingMessage.value,
          role: 'assistant',
          timestamp: new Date(),
          specialist: currentSpecialist.value || undefined,
        });
      }
    } catch (error_) {
      handleError(error_, 'Stream Chat');
    } finally {
      isStreaming.value = false;
      streamingMessage.value = '';
    }
  };

  /**
   * Generate contextual help
   */
  const generateContextualHelp = async (
    request: ChatApi.ContextualHelpRequest,
  ): Promise<ChatApi.ContextualHelpResult | null> => {
    if (isLoading.value) return null;

    isLoading.value = true;
    clearError();

    try {
      const result = await generateContextualHelpApi(request);
      return result;
    } catch (error_) {
      handleError(error_, 'Generate Contextual Help');
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Perform tax analysis
   */
  const performTaxAnalysis = async (
    options: AnalysisApi.TaxAnalysisOptions,
  ): Promise<AnalysisApi.AIAnalysisResult | null> => {
    if (isAnalyzing.value) return null;

    isAnalyzing.value = true;
    clearError();

    try {
      const result = await performTaxAnalysisApi(options);
      lastTaxAnalysis.value = result;
      return result;
    } catch (error_) {
      handleError(error_, 'Tax Analysis');
      return null;
    } finally {
      isAnalyzing.value = false;
    }
  };

  /**
   * Analyze balance sheet
   */
  const analyzeBalanceSheet = async (
    options: AnalysisApi.BalanceSheetAnalysisOptions,
  ): Promise<AnalysisApi.BalanceSheetAnalysisResult | null> => {
    if (isAnalyzing.value) return null;

    isAnalyzing.value = true;
    clearError();

    try {
      const result = await analyzeBalanceSheetApi(options);
      lastBalanceSheetAnalysis.value = result;
      return result;
    } catch (error_) {
      handleError(error_, 'Balance Sheet Analysis');
      return null;
    } finally {
      isAnalyzing.value = false;
    }
  };

  /**
   * Check Section 39 eligibility
   */
  const checkSection39Eligibility = async (
    request: AnalysisApi.Section39EligibilityRequest,
  ): Promise<AnalysisApi.Section39EligibilityResponse | null> => {
    if (isAnalyzing.value) return null;

    isAnalyzing.value = true;
    clearError();

    try {
      const result = await checkSection39EligibilityApi(request);
      lastSection39Check.value = result;
      return result;
    } catch (error_) {
      handleError(error_, 'Section 39 Eligibility Check');
      return null;
    } finally {
      isAnalyzing.value = false;
    }
  };

  /**
   * Classify document
   */
  const classifyDocument = async (
    request: DocumentApi.DocumentClassificationRequest,
  ): Promise<DocumentApi.DocumentClassificationResult | null> => {
    if (isClassifying.value) return null;

    isClassifying.value = true;
    clearError();

    try {
      const result = await classifyDocumentApi(request);
      lastDocumentClassification.value = result;
      return result;
    } catch (error_) {
      handleError(error_, 'Document Classification');
      return null;
    } finally {
      isClassifying.value = false;
    }
  };

  /**
   * Analyze workflow decision
   */
  const analyzeWorkflowDecision = async (
    request: WorkflowApi.WorkflowDecisionRequest,
  ): Promise<WorkflowApi.WorkflowDecisionResult | null> => {
    if (isDeciding.value) return null;

    isDeciding.value = true;
    clearError();

    try {
      const result = await analyzeWorkflowDecisionApi(request);
      lastWorkflowDecision.value = result;
      return result;
    } catch (error_) {
      handleError(error_, 'Workflow Decision Analysis');
      return null;
    } finally {
      isDeciding.value = false;
    }
  };

  /**
   * Add message to chat history
   */
  const addChatMessage = (
    message: Omit<ChatApi.ChatMessage, 'id' | 'timestamp'>,
  ) => {
    chatMessages.value.push({
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    });
  };

  /**
   * Clear chat history
   */
  const clearChatHistory = () => {
    chatMessages.value = [];
    currentSpecialist.value = null;
  };

  /**
   * Clear all analysis results
   */
  const clearAnalysisResults = () => {
    lastTaxAnalysis.value = null;
    lastBalanceSheetAnalysis.value = null;
    lastSection39Check.value = null;
    lastDocumentClassification.value = null;
    lastWorkflowDecision.value = null;
  };

  /**
   * Reset all state
   */
  const resetState = () => {
    clearError();
    clearChatHistory();
    clearAnalysisResults();
    streamingMessage.value = '';
    currentSpecialist.value = null;
  };

  return {
    // Loading states
    isLoading: readonly(isLoading),
    isStreaming: readonly(isStreaming),
    isAnalyzing: readonly(isAnalyzing),
    isClassifying: readonly(isClassifying),
    isDeciding: readonly(isDeciding),
    isAnyOperationRunning,

    // Error states
    error: readonly(error),
    lastError: readonly(lastError),
    hasError,

    // Chat state
    chatMessages: readonly(chatMessages),
    streamingMessage: readonly(streamingMessage),
    currentSpecialist: readonly(currentSpecialist),

    // Analysis results
    lastTaxAnalysis: readonly(lastTaxAnalysis),
    lastBalanceSheetAnalysis: readonly(lastBalanceSheetAnalysis),
    lastSection39Check: readonly(lastSection39Check),
    lastDocumentClassification: readonly(lastDocumentClassification),
    lastWorkflowDecision: readonly(lastWorkflowDecision),

    // Methods
    generateWelcomeMessage,
    streamChat,
    generateContextualHelp,
    performTaxAnalysis,
    analyzeBalanceSheet,
    checkSection39Eligibility,
    classifyDocument,
    analyzeWorkflowDecision,
    addChatMessage,
    clearChatHistory,
    clearAnalysisResults,
    clearError,
    resetState,
  };
}

// Export types for convenience
export type { ChatApi, AnalysisApi, DocumentApi, WorkflowApi };
