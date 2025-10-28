import OpenAI from 'openai';
import type { WorkflowStep } from '#/views/tax-filing/types/ai-chat';

// AI Analysis interfaces
export interface AIAnalysisResult {
  classification: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  alternatives: Array<{
    treatment: string;
    description: string;
    confidence: number;
  }>;
  documentation: string[];
  reasoning: string;
  // Section 39 eligibility data
  section39?: {
    eligible: boolean;
    confidence: number;
    reason: string;
    detailedReason: string;
    legalBasis: string;
    ruleReferences: string[];
    recommendations: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface TaxAnalysisOptions {
  description: string;
  amount: number;
  itemType?: 'expense' | 'income';
}

export interface ChatOptions {
  message: string;
  expense: {
    description: string;
    amount: number;
  };
  chatHistory: ChatMessage[];
}

// Balance Sheet Analysis interfaces
export interface BalanceSheetAnalysisOptions {
  totalAssets: number;
  totalLiabilitiesAndCapital: number;
  balanceDiscrepancy: number;
  financialItems: {
    intangibleAssets: number;
    currentAssets: number;
    nonCurrentAssets: number;
    currentLiabilities: number;
    nonCurrentLiabilities: number;
    capital: number;
  };
  companyName?: string;
  periodTo?: string;
}

export interface BalanceSheetAnalysisResult {
  analysis: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  potentialCauses: Array<{
    cause: string;
    likelihood: number;
    description: string;
  }>;
  correctionSuggestions: Array<{
    step: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }>;
  complianceNotes: string[];
  reasoning: string;
}

// Section 39 Eligibility API interfaces
export interface Section39EligibilityRequest {
  expenseDescription: string;
  expenseAmount: number;
}

export interface Section39EligibilityResponse {
  success: boolean;
  message: string;
  data: {
    eligible: boolean;
    confidence: number;
    reason: string;
    detailedReason: string;
    ruleReferences: string[];
    rulesUsed: string[];
    legalBasis: string;
    recommendations: string[];
    expenses: {
      description: string;
      amount: number;
      category: string;
      currency: string;
      date: string;
    };
    expenseDescription: string;
    vectorSearchResults: number;
    rulesFromVectorDB: Array<{
      title: string;
      content: string;
      similarity: number;
      relevanceScore: string;
      usedInAnalysis: boolean;
    }>;
    analysisMetadata: {
      ragEnabled: boolean;
      vectorSearchThreshold: number;
      rulesAnalyzed: number;
      aiModel: string;
      embeddingModel: string;
      processingTime: number;
      usedRuleBased: boolean;
    };
    processedAt: string;
    processingTime: number;
  };
}

// OpenAI Configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn(
    'OpenAI API key is not configured. Set VITE_OPENAI_API_KEY or use a backend proxy via VITE_AI_SERVICE_URL.'
  );
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
});

export interface WorkflowDecision {
  nextStep?: string;
  shouldProceed: boolean;
  confidence: number;
  reasoning: string;
  suggestedAction?: string;
}

export interface StreamingResponse {
  content: string;
  isComplete: boolean;
  workflowDecision?: WorkflowDecision;
}

export interface DocumentClassification {
  documentType: string;
  confidence: number;
  sheetNames?: string[];
  extractedText?: string;
  suggestedCategory: string;
  reasoning: string;
}

export interface FileAnalysisResult {
  fileName: string;
  fileType: 'excel' | 'pdf' | 'other';
  classification: DocumentClassification;
  processingTime: number;
}

export class OpenAIService {
  private systemPrompt = `You are an AI Tax Assistant specialized in Malaysian corporate tax filing. You help users navigate through a multi-step tax filing workflow.

Workflow Steps:
1. client-selection - Select client for tax filing
2. accounting-period - Select accounting periods
3. upload - Upload tax documents
4. classify - Classify and organize documents
5. extract - Extract tax information
6. expense-review - Review extracted expenses
7. income-extraction - Extract dividend, interest and rental income
8. compute - Calculate taxes and deductions
9. review - Review and validate results
10. preview - Preview and submit tax return

Your responsibilities:
- Provide helpful, accurate tax guidance
- Analyze user intentions and suggest next workflow steps
- Maintain a professional yet friendly tone
- Use Malaysian tax terminology and regulations
- Guide users through the workflow efficiently

Always respond in a helpful manner and suggest the most appropriate next step based on user input and current workflow state.`;

  /**
   * Generate welcome message using OpenAI
   */
  async generateWelcomeMessage(): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.systemPrompt,
          },
          {
            role: 'user',
            content:
              'Generate a welcome message for the Multi-Agent AI Tax Assistant. Make it professional, engaging, and explain the capabilities of the system. Include information about the workflow steps and how users can get started.',
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return (
        completion.choices[0]?.message?.content ||
        'Welcome to the AI Tax Assistant!'
      );
    } catch (error) {
      console.error('Error generating welcome message:', error);
      return "Welcome to the Multi-Agent AI Tax Assistant! I'm here to help you navigate through your tax filing process efficiently.";
    }
  }

  /**
   * Generate streaming response for user messages with specialist context
   */
  async *generateStreamingResponse(
    userMessage: string,
    currentWorkflowStep: number,
    workflowSteps: WorkflowStep[],
    conversationHistory: Array<{
      role: 'user' | 'assistant';
      content: string;
    }> = [],
    specialistInfo?: { name: string; expertise: string; description: string },
  ): AsyncGenerator<StreamingResponse> {
    try {
      const currentStep = workflowSteps[currentWorkflowStep];
      const contextPrompt = `
Current workflow context:
- Current step: ${currentStep?.title || 'Not started'} (${currentStep?.id || 'none'})
- Step description: ${currentStep?.description || 'N/A'}
- Total steps: ${workflowSteps.length}
- Progress: ${currentWorkflowStep + 1}/${workflowSteps.length}

Analyze the user's message and provide helpful guidance. If appropriate, suggest the next workflow step.`;

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: this.systemPrompt + contextPrompt,
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 800,
        temperature: 0.7,
        stream: true,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullContent += content;

        yield {
          content: fullContent,
          isComplete: false,
        };
      }

      // Analyze workflow decision after completion
      const workflowDecision = await this.analyzeWorkflowDecision(
        userMessage,
        fullContent,
        currentWorkflowStep,
        workflowSteps,
      );

      yield {
        content: fullContent,
        isComplete: true,
        workflowDecision,
      };
    } catch (error) {
      console.error('Error generating streaming response:', error);
      yield {
        content:
          "I apologize, but I'm experiencing some technical difficulties. Please try again or contact support if the issue persists.",
        isComplete: true,
      };
    }
  }

  /**
   * Analyze user intention and decide next workflow step
   */
  private async analyzeWorkflowDecision(
    userMessage: string,
    aiResponse: string,
    currentWorkflowStep: number,
    workflowSteps: WorkflowStep[],
  ): Promise<WorkflowDecision> {
    try {
      const currentStep = workflowSteps[currentWorkflowStep];
      const nextStep = workflowSteps[currentWorkflowStep + 1];

      const analysisPrompt = `Analyze the following conversation and determine if the user is ready to proceed to the next workflow step.

Current step: ${currentStep?.id || 'none'} - ${currentStep?.title || 'Not started'}
Next step: ${nextStep?.id || 'completed'} - ${nextStep?.title || 'Workflow complete'}

User message: "${userMessage}"
AI response: "${aiResponse}"

Based on this conversation, determine:
1. Should the user proceed to the next step? (yes/no)
2. Confidence level (0-100)
3. Brief reasoning
4. Suggested action for the user

Respond in JSON format:
{
  "shouldProceed": boolean,
  "confidence": number,
  "reasoning": "string",
  "suggestedAction": "string"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a workflow analysis expert. Analyze conversations and determine appropriate next steps in a tax filing workflow.',
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      const responseContent = completion.choices[0]?.message?.content || '{}';

      try {
        const analysis = JSON.parse(responseContent);
        return {
          nextStep: analysis.shouldProceed ? nextStep?.id : undefined,
          shouldProceed: analysis.shouldProceed || false,
          confidence: analysis.confidence || 0,
          reasoning: analysis.reasoning || 'Unable to determine next step',
          suggestedAction:
            analysis.suggestedAction || 'Continue the conversation',
        };
      } catch (parseError) {
        console.error('Error parsing workflow decision:', parseError);
        return {
          shouldProceed: false,
          confidence: 0,
          reasoning: 'Unable to analyze workflow decision',
          suggestedAction: 'Continue the conversation',
        };
      }
    } catch (error) {
      console.error('Error analyzing workflow decision:', error);
      return {
        shouldProceed: false,
        confidence: 0,
        reasoning: 'Error analyzing user intention',
        suggestedAction: 'Continue the conversation',
      };
    }
  }

  /**
   * Generate contextual help based on current workflow step
   */
  async generateContextualHelp(currentStep: WorkflowStep): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.systemPrompt,
          },
          {
            role: 'user',
            content: `Provide helpful guidance for the current workflow step: "${currentStep.title}" - ${currentStep.description}. Explain what the user needs to do and any important considerations for Malaysian corporate tax filing.`,
          },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      return (
        completion.choices[0]?.message?.content ||
        "I'm here to help you with your tax filing process."
      );
    } catch (error) {
      console.error('Error generating contextual help:', error);
      return `For the ${currentStep.title} step: ${currentStep.description}. Please proceed when you're ready.`;
    }
  }

  /**
   * Analyze and classify uploaded documents with hardcoded sheet names
   */
  async analyzeDocument(file: File): Promise<FileAnalysisResult> {
    const startTime = Date.now();
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    let fileType: 'excel' | 'pdf' | 'other' = 'other';
    if (['xlsx', 'xls'].includes(fileExtension || '')) {
      fileType = 'excel';
    } else if (fileExtension === 'pdf') {
      fileType = 'pdf';
    }

    // Hardcoded classification without AI or sheet extraction
    let classification: DocumentClassification;

    if (fileType === 'excel') {
      classification = {
        documentType: 'Excel Financial Document',
        confidence: 85,
        sheetNames: ['Manufacturing Account', 'Trading P&L', 'Balance Sheet'], // Hardcoded sheet names
        suggestedCategory: 'Financial Statement',
        reasoning: 'Excel file with standard financial statement sheets',
      };
    } else if (fileType === 'pdf') {
      classification = {
        documentType: 'PDF Tax Document',
        confidence: 75,
        suggestedCategory: 'Tax Document',
        reasoning: 'PDF file classified as tax document',
      };
    } else {
      classification = {
        documentType: 'Other Document',
        confidence: 50,
        suggestedCategory: 'Supporting Document',
        reasoning: 'Generic file classification',
      };
    }

    return {
      fileName,
      fileType,
      classification,
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Perform AI analysis for tax items
   */
  async performAIAnalysis(
    options: TaxAnalysisOptions,
  ): Promise<AIAnalysisResult> {
    const { description, amount, itemType = 'expense' } = options;

    // Call Section 39 eligibility API for expenses
    let section39Data: Section39EligibilityResponse | null = null;
    if (itemType === 'expense') {
      try {
        section39Data = await this.checkSection39Eligibility({
          expenseDescription: description,
          expenseAmount: amount,
        });
      } catch (error) {
        console.error('Failed to check Section 39 eligibility:', error);
      }
    }

    const analysisPrompt = `Analyze this ${itemType} item for Malaysian tax compliance:

Item: ${description}
Amount: ${amount}
Type: ${itemType}

Provide a comprehensive analysis including:
1. Tax classification and treatment
2. Confidence level (0-100)
3. Risk assessment (low/medium/high)
4. Specific recommendations
5. Alternative treatments if applicable
6. Required documentation
7. Detailed reasoning

Format as JSON with the following structure:
{
  "classification": "string",
  "confidence": number,
  "riskLevel": "low|medium|high",
  "recommendations": ["string"],
  "alternatives": [{"treatment": "string", "description": "string", "confidence": number}],
  "documentation": ["string"],
  "reasoning": "string"
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert Malaysian tax consultant specializing in corporate tax compliance and the Income Tax Act 1967. Provide accurate, detailed analysis for tax items.',
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const analysisContent = completion.choices[0]?.message?.content;

      if (analysisContent) {
        try {
          // Extract JSON from the response
          const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysisData = JSON.parse(jsonMatch[0]);
            // Add Section 39 data if available
            if (section39Data?.success && section39Data.data) {
              analysisData.section39 = {
                eligible: section39Data.data.eligible,
                confidence: section39Data.data.confidence,
                reason: section39Data.data.reason,
                detailedReason: section39Data.data.detailedReason,
                legalBasis: section39Data.data.legalBasis,
                ruleReferences: section39Data.data.ruleReferences,
                recommendations: section39Data.data.recommendations,
              };
            }
            return analysisData;
          } else {
            // Fallback: create structured response from text
            const fallbackResult = {
              classification: this.getItemStatus(description, itemType),
              confidence: 75,
              riskLevel: 'medium' as const,
              recommendations: [
                'Review supporting documentation',
                'Ensure business purpose is clearly documented',
              ],
              alternatives: [],
              documentation: [
                'Invoice/receipt',
                'Business justification',
                'Board resolution if applicable',
              ],
              reasoning: analysisContent,
            };
            // Add Section 39 data if available
            if (section39Data?.success && section39Data.data) {
              fallbackResult.section39 = {
                eligible: section39Data.data.eligible,
                confidence: section39Data.data.confidence,
                reason: section39Data.data.reason,
                detailedReason: section39Data.data.detailedReason,
                legalBasis: section39Data.data.legalBasis,
                ruleReferences: section39Data.data.ruleReferences,
                recommendations: section39Data.data.recommendations,
              };
            }
            return fallbackResult;
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          // Fallback to basic analysis
          const basicResult = {
            classification: this.getItemStatus(description, itemType),
            confidence: 70,
            riskLevel: 'medium' as const,
            recommendations: [
              'AI analysis completed with basic classification',
            ],
            alternatives: [],
            documentation: ['Standard supporting documents required'],
            reasoning:
              'Basic tax analysis based on item description and amount.',
          };
          // Add Section 39 data if available
          if (section39Data?.success && section39Data.data) {
            basicResult.section39 = {
              eligible: section39Data.data.eligible,
              confidence: section39Data.data.confidence,
              reason: section39Data.data.reason,
              detailedReason: section39Data.data.detailedReason,
              legalBasis: section39Data.data.legalBasis,
              ruleReferences: section39Data.data.ruleReferences,
              recommendations: section39Data.data.recommendations,
            };
          }
          return basicResult;
        }
      }

      throw new Error('No analysis content received');
    } catch (error) {
      console.error('AI Analysis error:', error);

      // Fallback to static analysis
      const staticResult = {
        classification: this.getItemStatus(description, itemType),
        confidence: 60,
        riskLevel: 'medium' as const,
        recommendations: [
          'Manual review recommended',
          'Consult tax advisor for complex items',
        ],
        alternatives: [],
        documentation: ['Supporting documents required'],
        reasoning:
          'Static analysis based on predefined rules. AI analysis unavailable.',
      };
      // Add Section 39 data if available
      if (section39Data?.success && section39Data.data) {
        staticResult.section39 = {
          eligible: section39Data.data.eligible,
          confidence: section39Data.data.confidence,
          reason: section39Data.data.reason,
          detailedReason: section39Data.data.detailedReason,
          legalBasis: section39Data.data.legalBasis,
          ruleReferences: section39Data.data.ruleReferences,
          recommendations: section39Data.data.recommendations,
        };
      }
      return staticResult;
    }
  }

  /**
   * Check Section 39 eligibility using external API
   */
  async checkSection39Eligibility(
    request: Section39EligibilityRequest,
  ): Promise<Section39EligibilityResponse> {
    try {
      const response = await fetch(
        'https://ib-service.gentech-ai-site.com/api/rag/check-eligibility',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Section39EligibilityResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Section 39 eligibility check error:', error);
      // Return fallback response
      return {
        success: false,
        message: 'Failed to check Section 39 eligibility',
        data: {
          eligible: false,
          confidence: 0,
          reason: 'API call failed',
          detailedReason: 'Unable to connect to eligibility service',
          ruleReferences: [],
          rulesUsed: [],
          legalBasis: 'N/A',
          recommendations: ['Manual review required'],
          expenses: {
            description: request.expenseDescription,
            amount: request.expenseAmount,
            category: 'Unknown',
            currency: 'MYR',
            date: new Date().toISOString().split('T')[0],
          },
          expenseDescription: request.expenseDescription,
          vectorSearchResults: 0,
          rulesFromVectorDB: [],
          analysisMetadata: {
            ragEnabled: false,
            vectorSearchThreshold: 0,
            rulesAnalyzed: 0,
            aiModel: 'fallback',
            embeddingModel: 'none',
            processingTime: 0,
            usedRuleBased: false,
          },
          processedAt: new Date().toISOString(),
          processingTime: 0,
        },
      };
    }
  }

  /**
   * Send chat message with streaming response
   */
  async *sendChatMessage(
    options: ChatOptions,
  ): AsyncGenerator<{ content: string; isComplete: boolean }> {
    const { message, expense, chatHistory } = options;

    const contextPrompt = `You are discussing this tax item:
Item: ${expense.description}
Amount: ${expense.amount}

User question: ${message}

Provide a helpful, accurate response about Malaysian tax implications.`;

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content:
            'You are a helpful Malaysian tax expert. Provide clear, accurate guidance on tax matters.',
        },
        ...chatHistory.slice(-5).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: contextPrompt,
        },
      ];

      const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 500,
        temperature: 0.7,
        stream: true,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullContent += content;

        yield {
          content: fullContent,
          isComplete: false,
        };
      }

      yield {
        content: fullContent,
        isComplete: true,
      };
    } catch (error) {
      console.error('Chat error:', error);
      yield {
        content:
          "I apologize, but I'm having trouble responding right now. Please try again.",
        isComplete: true,
      };
    }
  }

  /**
   * Get item allowability for tax purposes
   */
  getItemAllowability(
    itemName: string,
    itemType: 'expense' | 'income' = 'expense',
  ): string {
    const name = itemName.toUpperCase();

    if (itemType === 'income') {
      // Income tax analysis
      if (
        name.includes('INSURANCE CLAIM') ||
        name.includes('SALE OF SCRAP') ||
        name.includes('RENTAL INCOME') ||
        name.includes('INTEREST RECEIVED') ||
        name.includes('DIVIDEND RECEIVED')
      ) {
        return 'taxable';
      }
      if (
        name.includes('GAIN ON DISPOSAL') ||
        name.includes('CAPITAL GAIN') ||
        name.includes('COMPENSATION')
      ) {
        return 'partial';
      }
      if (name.includes('EXEMPT DIVIDEND') || name.includes('LIFE INSURANCE')) {
        return 'exempt';
      }
      return 'taxable'; // Default for income
    }

    // Expense tax analysis
    if (
      name.includes('AUDIT') ||
      name.includes('PROFESSIONAL') ||
      name.includes('BANK CHARGES') ||
      name.includes('INSURANCE') ||
      name.includes('RENT') ||
      name.includes('UTILITIES') ||
      name.includes('SALARIES') ||
      name.includes('WAGES') ||
      name.includes('OFFICE SUPPLIES')
    ) {
      return 'allowed';
    }
    if (
      name.includes('ENTERTAINMENT') ||
      name.includes('PENALTY') ||
      name.includes('FINE') ||
      name.includes('DONATION') ||
      name.includes('GIFT')
    ) {
      return 'disallowed';
    }
    if (
      name.includes('DEPRECIATION') ||
      name.includes('ADVERTISING') ||
      name.includes('TRAINING')
    ) {
      return 'partial';
    }
    return 'allowed'; // Default for expenses
  }

  /**
   * Get item status for tax purposes
   */
  getItemStatus(
    itemName: string,
    itemType: 'expense' | 'income' = 'expense',
  ): string {
    const allowability = this.getItemAllowability(itemName, itemType);

    if (itemType === 'income') {
      return allowability === 'taxable'
        ? 'taxable'
        : allowability === 'exempt'
          ? 'exempt'
          : 'partial';
    }

    return allowability === 'allowed'
      ? 'deductible'
      : allowability === 'disallowed'
        ? 'non-deductible'
        : 'partial';
  }

  /**
   * Get item rule name for tax purposes
   */
  getItemRuleName(
    itemName: string,
    itemType: 'expense' | 'income' = 'expense',
  ): string {
    const name = itemName.toUpperCase();

    if (itemType === 'income') {
      if (name.includes('INSURANCE CLAIM')) return 'S.4(a) - Business Income';
      if (name.includes('SALE OF SCRAP')) return 'S.4(a) - Trading Income';
      if (name.includes('GAIN ON DISPOSAL'))
        return 'S.4(a) - Capital vs Revenue';
      if (name.includes('RENTAL')) return 'S.4(a) - Rental Income';
      if (name.includes('INTEREST')) return 'S.4(c) - Interest Income';
      if (name.includes('DIVIDEND')) return 'S.4(f) - Dividend Income';
      return 'S.4 - Gross Income';
    }

    // Expense rules
    if (name.includes('AUDIT')) return 'S.39(1)(a) - Professional Services';
    if (name.includes('BANK CHARGES'))
      return 'S.39(1)(f) - Collection Expenses';
    if (name.includes('DEPRECIATION')) return 'S.32 - Capital Allowances';
    if (name.includes('INSURANCE')) return 'S.39(1)(d) - Insurance Premiums';
    if (name.includes('OFFICE SUPPLIES')) return 'S.39(1)(b) - Office Expenses';
    if (name.includes('PROFESSIONAL')) return 'S.39(1)(a) - Professional Fees';
    if (name.includes('RENT')) return 'S.39(1)(h) - Rental Expenses';
    if (name.includes('SALARIES') || name.includes('WAGES'))
      return 'S.39(1)(b) - Staff Costs';
    if (name.includes('UTILITIES')) return 'S.39(1)(b) - Utilities';
    if (name.includes('ADVERTISING')) return 'S.39(1)(a) - Marketing Expenses';
    if (name.includes('TRAINING')) return 'S.39(1)(a) - Training Expenses';
    if (name.includes('ENTERTAINMENT'))
      return 'S.39(1)(l) - Entertainment (Disallowed)';
    if (name.includes('PENALTY') || name.includes('FINE'))
      return 'S.39(1)(k) - Penalties (Disallowed)';
    if (name.includes('DONATION')) return 'S.44 - Donations';
    if (name.includes('GIFT')) return 'S.39(1)(l) - Gifts (Disallowed)';
    return 'S.39(1) - General Deduction';
  }

  /**
   * Analyze balance sheet discrepancies using AI
   */
  async analyzeBalanceSheetDiscrepancy(
    options: BalanceSheetAnalysisOptions,
  ): Promise<BalanceSheetAnalysisResult> {
    const {
      totalAssets,
      totalLiabilitiesAndCapital,
      balanceDiscrepancy,
      financialItems,
      companyName = 'Company',
      periodTo = 'Current Period',
    } = options;

    const analysisPrompt = `Analyze this balance sheet discrepancy for Malaysian corporate accounting:

Company: ${companyName}
Period: ${periodTo}

Balance Sheet Summary:
- Total Assets: $${totalAssets.toLocaleString()}
- Total Liabilities + Capital: $${totalLiabilitiesAndCapital.toLocaleString()}
- Discrepancy: $${balanceDiscrepancy.toLocaleString()}

Detailed Breakdown:
- Intangible Assets: $${financialItems.intangibleAssets.toLocaleString()}
- Current Assets: $${financialItems.currentAssets.toLocaleString()}
- Non-Current Assets: $${financialItems.nonCurrentAssets.toLocaleString()}
- Current Liabilities: $${financialItems.currentLiabilities.toLocaleString()}
- Non-Current Liabilities: $${financialItems.nonCurrentLiabilities.toLocaleString()}
- Capital: $${financialItems.capital.toLocaleString()}

Provide a comprehensive analysis including:
1. Risk assessment of the imbalance (low/medium/high/critical)
2. Most likely causes of the discrepancy
3. Specific recommendations to resolve the imbalance
4. Step-by-step correction suggestions with priorities
5. Malaysian accounting standards compliance considerations
6. Confidence level in the analysis (0-100)

Format as JSON:
{
  "analysis": "detailed analysis text",
  "confidence": number,
  "riskLevel": "low|medium|high|critical",
  "recommendations": ["recommendation1", "recommendation2"],
  "potentialCauses": [{"cause": "string", "likelihood": number, "description": "string"}],
  "correctionSuggestions": [{"step": "string", "priority": "high|medium|low", "description": "string"}],
  "complianceNotes": ["note1", "note2"],
  "reasoning": "detailed reasoning"
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert Malaysian corporate accountant and auditor specializing in balance sheet analysis and Malaysian Financial Reporting Standards (MFRS). Provide accurate, detailed analysis for balance sheet discrepancies.',
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      const analysisContent = completion.choices[0]?.message?.content;

      if (analysisContent) {
        try {
          // Extract JSON from the response
          const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysisData = JSON.parse(jsonMatch[0]);
            return analysisData;
          } else {
            // Fallback: create structured response from text
            return this.createFallbackBalanceSheetAnalysis(
              options,
              analysisContent,
            );
          }
        } catch (parseError) {
          console.error('Error parsing balance sheet analysis:', parseError);
          return this.createFallbackBalanceSheetAnalysis(
            options,
            analysisContent,
          );
        }
      }

      throw new Error('No analysis content received');
    } catch (error) {
      console.error('Balance sheet analysis error:', error);
      return this.createFallbackBalanceSheetAnalysis(options);
    }
  }

  /**
   * Create fallback balance sheet analysis when AI fails
   */
  private createFallbackBalanceSheetAnalysis(
    options: BalanceSheetAnalysisOptions,
    aiContent?: string,
  ): BalanceSheetAnalysisResult {
    const { balanceDiscrepancy } = options;
    const discrepancyAmount = Math.abs(balanceDiscrepancy);

    // Determine risk level based on discrepancy amount
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (discrepancyAmount > 100_000) riskLevel = 'critical';
    else if (discrepancyAmount > 50_000) riskLevel = 'high';
    else if (discrepancyAmount > 10_000) riskLevel = 'medium';

    return {
      analysis:
        aiContent ||
        `Balance sheet shows a discrepancy of $${discrepancyAmount.toLocaleString()}. This requires immediate attention to ensure accurate financial reporting.`,
      confidence: aiContent ? 75 : 60,
      riskLevel,
      recommendations: [
        'Review all journal entries for the current period',
        'Verify asset and liability classifications',
        'Check for unrecorded transactions',
        'Reconcile all balance sheet accounts',
        'Consult with accounting advisor if discrepancy persists',
      ],
      potentialCauses: [
        {
          cause: 'Data entry errors',
          likelihood: 80,
          description: 'Incorrect amounts or misclassified transactions',
        },
        {
          cause: 'Missing transactions',
          likelihood: 60,
          description: 'Unrecorded assets, liabilities, or equity transactions',
        },
        {
          cause: 'Classification errors',
          likelihood: 50,
          description:
            'Items incorrectly categorized between asset and liability sections',
        },
      ],
      correctionSuggestions: [
        {
          step: 'Perform detailed account reconciliation',
          priority: 'high',
          description:
            'Review each balance sheet account for accuracy and completeness',
        },
        {
          step: 'Check trial balance totals',
          priority: 'high',
          description:
            'Ensure debits equal credits in the underlying trial balance',
        },
        {
          step: 'Review period-end adjustments',
          priority: 'medium',
          description:
            'Verify all accruals and deferrals are properly recorded',
        },
      ],
      complianceNotes: [
        'Ensure compliance with Malaysian Financial Reporting Standards (MFRS)',
        'Balance sheet must balance for regulatory filing requirements',
        'Document all corrections for audit trail purposes',
      ],
      reasoning: aiContent
        ? 'AI analysis with fallback structure'
        : 'Static analysis based on discrepancy amount and common accounting principles',
    };
  }

  // Removed: All AI classification and Excel sheet extraction methods - now using hardcoded classification
}

// Export singleton instance
export const openaiService = new OpenAIService();
