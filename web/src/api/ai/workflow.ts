export namespace WorkflowApi {
  /** Workflow step definition */
  export interface WorkflowStep {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    required: boolean;
    estimatedTime?: number;
    dependencies?: string[];
  }

  /** Workflow context */
  export interface WorkflowContext {
    currentStep: string;
    completedSteps: string[];
    userRole: string;
    companyType?: string;
    taxYear?: string;
    jurisdiction?: string;
  }

  /** Decision option */
  export interface DecisionOption {
    id: string;
    title: string;
    description: string;
    confidence: number;
    pros: string[];
    cons: string[];
    riskLevel: 'low' | 'medium' | 'high';
    estimatedImpact: string;
  }

  /** Workflow decision request */
  export interface WorkflowDecisionRequest {
    context: WorkflowContext;
    currentSituation: string;
    availableOptions?: string[];
    constraints?: string[];
    goals?: string[];
  }

  /** Workflow decision result */
  export interface WorkflowDecisionResult {
    recommendedOption: string;
    confidence: number;
    reasoning: string;
    alternatives: DecisionOption[];
    nextSteps: WorkflowStep[];
    warnings: string[];
    considerations: string[];
    estimatedTimeToComplete: number;
  }

  /** Workflow decision response */
  export interface WorkflowDecisionResponse {
    success: boolean;
    message: string;
    data: WorkflowDecisionResult;
  }
}

/**
 * Analyze workflow decisions using AI
 * @param request Workflow decision request
 * @returns Promise with decision analysis result
 */
export async function analyzeWorkflowDecisionApi(
  request: WorkflowApi.WorkflowDecisionRequest,
): Promise<WorkflowApi.WorkflowDecisionResult> {
  const aiServiceUrl =
    import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api/ai';

  try {
    const response = await fetch(`${aiServiceUrl}/workflow/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error analyzing workflow decision:', error);

    // Fallback decision analysis
    const { context, currentSituation, availableOptions = [] } = request;

    return {
      recommendedOption: availableOptions[0] || 'proceed_with_caution',
      confidence: 50,
      reasoning:
        'Fallback analysis based on general workflow principles. AI analysis unavailable.',
      alternatives: generateFallbackAlternatives(availableOptions),
      nextSteps: generateFallbackNextSteps(context),
      warnings: [
        'AI analysis unavailable - manual review recommended',
        'Consider consulting with domain experts',
        'Verify compliance requirements before proceeding',
      ],
      considerations: [
        'Review all available documentation',
        'Assess potential risks and benefits',
        'Consider timeline and resource constraints',
        'Ensure regulatory compliance',
      ],
      estimatedTimeToComplete: 120, // 2 hours default
    };
  }
}

/**
 * Generate fallback alternatives when AI is unavailable
 * @param availableOptions Available options
 * @returns Array of decision options
 */
function generateFallbackAlternatives(
  availableOptions: string[],
): WorkflowApi.DecisionOption[] {
  return availableOptions.map((option, index) => ({
    id: `option_${index + 1}`,
    title: option,
    description: `Consider ${option} as a viable approach`,
    confidence: Math.max(30, 70 - index * 10),
    pros: ['Available option', 'Can be implemented'],
    cons: ['Requires manual analysis', 'Limited AI insights'],
    riskLevel: index === 0 ? 'low' : index === 1 ? 'medium' : 'high',
    estimatedImpact: 'Moderate impact expected',
  }));
}

/**
 * Generate fallback next steps when AI is unavailable
 * @param context Workflow context
 * @returns Array of workflow steps
 */
function generateFallbackNextSteps(
  context: WorkflowApi.WorkflowContext,
): WorkflowApi.WorkflowStep[] {
  const baseSteps: WorkflowApi.WorkflowStep[] = [
    {
      id: 'review_situation',
      title: 'Review Current Situation',
      description: 'Thoroughly analyze the current state and requirements',
      status: 'pending',
      required: true,
      estimatedTime: 30,
    },
    {
      id: 'gather_information',
      title: 'Gather Additional Information',
      description: 'Collect all necessary documentation and data',
      status: 'pending',
      required: true,
      estimatedTime: 45,
      dependencies: ['review_situation'],
    },
    {
      id: 'consult_experts',
      title: 'Consult Domain Experts',
      description: 'Seek advice from relevant specialists or advisors',
      status: 'pending',
      required: false,
      estimatedTime: 60,
      dependencies: ['gather_information'],
    },
    {
      id: 'make_decision',
      title: 'Make Final Decision',
      description: 'Choose the best course of action based on analysis',
      status: 'pending',
      required: true,
      estimatedTime: 15,
      dependencies: ['gather_information'],
    },
    {
      id: 'implement_solution',
      title: 'Implement Solution',
      description: 'Execute the chosen approach',
      status: 'pending',
      required: true,
      estimatedTime: 90,
      dependencies: ['make_decision'],
    },
  ];

  // Filter out completed steps
  return baseSteps.filter((step) => !context.completedSteps.includes(step.id));
}
