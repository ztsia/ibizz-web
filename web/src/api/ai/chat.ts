export namespace ChatApi {
  /** Chat message interface */
  export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }

  /** Workflow step interface */
  export interface WorkflowStep {
    id: string;
    title: string;
    description: string;
    completed?: boolean;
  }

  /** Workflow decision interface */
  export interface WorkflowDecision {
    nextStep?: string;
    shouldProceed: boolean;
    confidence: number;
    reasoning: string;
    suggestedAction?: string;
  }

  /** Streaming response interface */
  export interface StreamingResponse {
    content: string;
    isComplete: boolean;
    workflowDecision?: WorkflowDecision;
  }

  /** Specialist information interface */
  export interface SpecialistInfo {
    name: string;
    expertise: string;
    description: string;
  }

  /** Chat streaming request parameters */
  export interface StreamChatParams {
    userMessage: string;
    currentWorkflowStep: number;
    workflowSteps: WorkflowStep[];
    conversationHistory?: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
    specialistInfo?: SpecialistInfo;
  }

  /** Welcome message response */
  export interface WelcomeMessageResult {
    message: string;
  }

  /** Contextual help request */
  export interface ContextualHelpParams {
    currentStep: WorkflowStep;
  }

  /** Contextual help response */
  export interface ContextualHelpResult {
    helpMessage: string;
  }
}

/**
 * Generate welcome message for the AI Tax Assistant
 * @returns Promise with welcome message
 */
export async function generateWelcomeMessageApi(): Promise<ChatApi.WelcomeMessageResult> {
  const aiServiceUrl =
    import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api/ai';

  try {
    const response = await fetch(`${aiServiceUrl}/chat/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      message:
        data.message ||
        data.data?.message ||
        'Welcome to the AI Tax Assistant!',
    };
  } catch (error) {
    console.error('Error generating welcome message:', error);
    return {
      message:
        "Welcome to the Multi-Agent AI Tax Assistant! I'm here to help you navigate through your tax filing process efficiently.",
    };
  }
}

/**
 * Stream chat responses from the AI service
 * @param params Chat streaming parameters
 * @returns AsyncGenerator for streaming responses
 */
export async function* streamChatApi(
  params: ChatApi.StreamChatParams,
): AsyncGenerator<ChatApi.StreamingResponse> {
  const aiServiceUrl =
    import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api/ai';

  try {
    const response = await fetch(`${aiServiceUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              yield parsed as ChatApi.StreamingResponse;
            } catch {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('Error in streaming chat:', error);
    yield {
      content:
        "I apologize, but I'm experiencing some technical difficulties. Please try again or contact support if the issue persists.",
      isComplete: true,
    };
  }
}

/**
 * Generate contextual help based on current workflow step
 * @param params Contextual help parameters
 * @returns Promise with help message
 */
export async function generateContextualHelpApi(
  params: ChatApi.ContextualHelpParams,
): Promise<ChatApi.ContextualHelpResult> {
  const aiServiceUrl =
    import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api/ai';

  try {
    const response = await fetch(`${aiServiceUrl}/chat/help`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      helpMessage:
        data.helpMessage ||
        data.data?.helpMessage ||
        `For the ${params.currentStep.title} step: ${params.currentStep.description}. Please proceed when you're ready.`,
    };
  } catch (error) {
    console.error('Error generating contextual help:', error);
    return {
      helpMessage: `For the ${params.currentStep.title} step: ${params.currentStep.description}. Please proceed when you're ready.`,
    };
  }
}
