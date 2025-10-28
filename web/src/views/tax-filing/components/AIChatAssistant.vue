<script lang="ts" setup>
import { nextTick, ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useVbenModal } from '@vben/common-ui';

import {
  RobotOutlined,
  SendOutlined,
  UserOutlined,
  CalendarOutlined,
  UploadOutlined,
  FileSearchOutlined,
  DatabaseOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  ClusterOutlined,
  FileTextOutlined,
  MenuOutlined,
} from '@ant-design/icons-vue';
import { Button, Input, Tag, Progress, Tooltip } from 'ant-design-vue';
import {
  WorkflowClientSelection,
  WorkflowAccountingPeriod,
  WorkflowDataEntryMethod,
  WorkflowManualEntry,
  WorkflowUpload,
  WorkflowClassify,
  WorkflowExtract,
  WorkflowExpenseReview,
  WorkflowIncomeExtraction,
  WorkflowCapitalAllowance,
  WorkflowCompute,
  WorkflowReview,
  WorkflowPreview,
} from './workflow';
import WorkflowWelcome from './WorkflowWelcome.vue';
import HelpGuide from './HelpGuide.vue';
import WorkflowNavigator from './WorkflowNavigator.vue';
import type {
  UploadedFile,
  ExtractedData,
  TaxResults,
  AccountingPeriodData,
  ManualEntryData,
} from './workflow';
import type { EnhancedSystemClient } from '#/api/system/iBizzClient';
import type {
  ChatMessage,
  WorkflowStep,
  AIChatAssistantProps,
  AIChatAssistantEmits,
  SlashCommand,
  AgentType,
} from '../types/ai-chat';
import { useTaxFilingStore } from '#/store';
import { useWorkflowHistoryStore } from '#/stores/workflowHistory';
import ClientSidebar from './ClientSidebar.vue';
import { openaiService } from '#/services/openai';

const { TextArea } = Input;
const route = useRoute();
const taxFilingStore = useTaxFilingStore();
const workflowHistoryStore = useWorkflowHistoryStore();

// Initialize session ID for workflow history
const sessionId = computed(
  () => (route.query.sessionId as string) || 'default-session',
);

// Set current session ID in workflow history store
watch(
  sessionId,
  (newSessionId) => {
    if (newSessionId) {
      workflowHistoryStore.setCurrentSessionId(newSessionId);
    }
  },
  { immediate: true },
);

const props = withDefaults(defineProps<AIChatAssistantProps>(), {
  visible: true,
});

const emit = defineEmits<AIChatAssistantEmits>();

// Initialize Help Guide Modal
const [HelpGuideModal, helpGuideModalApi] = useVbenModal({
  title: 'AI Assistant Help Guide',
  width: '900px',
  footer: false,
});

// Workflow Navigator Sidebar State
const showWorkflowSidebar = ref(false);

// Use workflow state from props or fallback to local state
const messages = computed({
  get: () => props.workflowState?.messages || [],
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { messages: value });
    }
  },
});

const currentMessage = ref('');

const chatContainer = ref<HTMLElement>();

const isGenerating = computed({
  get: () => props.workflowState?.isGenerating || false,
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { isGenerating: value });
    }
  },
});

const isWorkflowStepProcessing = computed({
  get: () => props.workflowState?.isWorkflowStepProcessing || false,
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { isWorkflowStepProcessing: value });
    }
  },
});

const isClearingChat = ref(false);

const streamingText = computed({
  get: () => props.workflowState?.streamingText || '',
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { streamingText: value });
    }
  },
});

const streamingInterval = ref<NodeJS.Timeout | null>(null);

const shouldAutoScroll = ref(true);

// Track clicked actions to prevent multiple clicks
const clickedActions = ref<Set<string>>(new Set());
// Track messages with clicked actions to disable all actions in that message
const messagesWithClickedActions = ref<Set<string>>(new Set());

// Conversation history for OpenAI context
const conversationHistory = computed({
  get: () => props.workflowState?.conversationHistory || [],
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { conversationHistory: value });
    }
  },
});

// Sidebar state
const sidebarCollapsed = computed({
  get: () => props.workflowState?.sidebarCollapsed || false,
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { sidebarCollapsed: value });
    }
  },
});

// Command menu state
const showCommandMenu = ref(false);
const selectedCommandIndex = ref(0);
const filteredCommands = ref<any[]>([]);

// Workflow navigator functions
const openWorkflowNavigator = () => {
  showWorkflowSidebar.value = true;
};

const closeWorkflowNavigator = () => {
  showWorkflowSidebar.value = false;
};

// Available slash commands
const slashCommands = ref<SlashCommand[]>([
  {
    command: '/start',
    description: 'Initialize multi-agent tax filing workflow',
    action: () => startWorkflow(),
    icon: ThunderboltOutlined,
  },
  {
    command: '/navigate',
    description: 'Open workflow navigator to jump to any completed step',
    action: () => openWorkflowNavigator(),
    icon: MenuOutlined,
  },
  {
    command: '/clear',
    description:
      'Reset conversation, clear all active agents and command center',
    action: () => clearChat(),
    icon: ApiOutlined,
  },
  {
    command: '/guide',
    description: 'Show interactive help guide (same as help quick action)',
    action: () => showHelpGuide(),
    icon: FileSearchOutlined,
  },
  {
    command: '/restart',
    description: 'Restart workflow and reset all agents',
    action: () => restartWorkflow(),
    icon: ClusterOutlined,
  },
]);

// Workflow specialist mapping
const workflowSpecialists = ref({
  'client-selection': {
    name: 'Client Selection Specialist',
    expertise: 'Client management and selection processes',
    description: 'Expert in client onboarding and selection for tax filing',
  },
  'accounting-period': {
    name: 'Period Configuration Expert',
    expertise: 'Accounting period setup and validation',
    description: 'Specialist in accounting period configuration and compliance',
  },
  'data-entry-method': {
    name: 'Data Entry Method Specialist',
    expertise: 'Data entry method selection and workflow optimization',
    description:
      'Expert in helping users choose the most efficient data entry method based on their business needs and document availability',
  },

  'manual-entry': {
    name: 'Manual Entry Specialist',
    expertise: 'Manual financial data entry and validation',
    description:
      'Expert in guiding manual entry of both balance sheet and income statement with proper categorization and S.39(1) compliance',
  },

  upload: {
    name: 'Document Upload Specialist',
    expertise: 'Document handling and upload processes',
    description: 'Expert in secure document upload and file management',
  },
  classify: {
    name: 'Document Classification Expert',
    expertise: 'AI-powered document classification and organization',
    description:
      'Specialist in automated document classification and OCR processing',
  },
  extract: {
    name: 'Data Extraction Specialist',
    expertise: 'Financial data extraction and validation',
    description:
      'Expert in extracting and validating financial information from documents',
  },
  'expense-review': {
    name: 'Expense Review Expert',
    expertise: 'Expense analysis and validation',
    description:
      'Specialist in reviewing and validating business expenses for tax purposes',
  },
  'income-extraction': {
    name: 'Income Extraction Specialist',
    expertise: 'Income data extraction and validation',
    description:
      'Expert in extracting and validating dividend, interest, and rental income for tax purposes',
  },
  'capital-allowance': {
    name: 'Capital Allowance Specialist',
    expertise: 'Asset management and capital allowance calculations',
    description:
      'Expert in managing asset schedules and applying correct capital allowances for tax purposes',
  },
  'malaysian-tax-worksheets': {
    name: 'Malaysian Tax Worksheets Specialist',
    expertise: 'HK forms management and export processes',
    description:
      'Expert in Malaysian tax worksheets, HK forms generation, and document export processes',
  },
  compute: {
    name: 'Tax Calculation Specialist',
    expertise: 'Malaysian corporate tax calculations and compliance',
    description: 'Expert in Malaysian tax law and automated tax calculations',
  },
  review: {
    name: 'Quality Assurance Expert',
    expertise: 'Tax return review and validation',
    description:
      'Specialist in final review and quality assurance of tax returns',
  },
  preview: {
    name: 'Submission Specialist',
    expertise: 'Tax return preview and submission processes',
    description:
      'Expert in final tax return preparation and submission to authorities',
  },
  default: {
    name: 'AI Tax Assistant',
    expertise: 'General tax assistance and workflow guidance',
    description: 'General AI assistant for tax filing guidance and support',
  },
});

// Function to get current specialist based on workflow step
const getCurrentSpecialist = () => {
  if (!workflowActive.value) {
    return workflowSpecialists.value.default;
  }

  const currentStep = workflowSteps.value[currentWorkflowStep.value];
  const stepId = currentStep?.id || 'default';

  if (workflowSpecialists.value[stepId]) {
    return workflowSpecialists.value[stepId];
  }
  return workflowSpecialists.value.default;
};

// Default workflow steps
const defaultWorkflowSteps: WorkflowStep[] = [
  {
    id: 'client-selection',
    name: 'client-selection',
    title: 'Client Selection',
    description: 'Select client for tax filing workflow',
    icon: UserOutlined,
    status: 'pending',
    agents: ['Client Management Agent', 'Workflow Coordinator'],
  },
  {
    id: 'accounting-period',
    name: 'accounting-period',
    title: 'Accounting Period',
    description: 'Select accounting and basis periods for tax filing',
    icon: CalendarOutlined,
    status: 'pending',
    agents: ['Period Configuration Agent', 'Validation Agent'],
  },
  {
    id: 'data-entry-method',
    name: 'data-entry-method',
    title: 'Data Entry Method',
    description: 'Choose between manual entry or document upload',
    icon: FileTextOutlined,
    status: 'pending',
    agents: ['Method Selection Agent', 'Workflow Coordinator'],
  },
  {
    id: 'manual-entry',
    name: 'manual-entry',
    title: 'Manual Entry',
    description: 'Enter balance sheet and income statement data manually',
    icon: DatabaseOutlined,
    status: 'pending',
    agents: ['Manual Entry Agent', 'Validation Agent'],
  },
  {
    id: 'upload',
    name: 'upload',
    title: 'Document Upload',
    description: 'Upload your tax documents for processing',
    icon: UploadOutlined,
    status: 'pending',
    agents: ['Document Handler Agent', 'Validation Agent'],
  },
  {
    id: 'classify',
    name: 'classify',
    title: 'Document Classification',
    description: 'AI agents classify and organize your documents',
    icon: FileSearchOutlined,
    status: 'pending',
    agents: ['Classification Agent', 'OCR Agent'],
  },
  {
    id: 'extract',
    name: 'extract',
    title: 'Data Extraction',
    description: 'Extract relevant tax information from documents',
    icon: DatabaseOutlined,
    status: 'pending',
    agents: ['Extraction Agent', 'Verification Agent'],
  },
  {
    id: 'review',
    name: 'review',
    title: 'Review & Validation',
    description: 'Review calculated results and validate accuracy',
    icon: CheckCircleOutlined,
    status: 'pending',
    agents: ['Review Agent', 'Quality Assurance Agent'],
  },
  {
    id: 'expense-review',
    name: 'expense-review',
    title: 'Expense Review',
    description: 'Review and validate extracted expenses',
    icon: FileTextOutlined,
    status: 'pending',
    agents: ['Expense Review Agent', 'Validation Agent'],
  },
  {
    id: 'compute',
    name: 'compute',
    title: 'Tax Computation',
    description: 'Calculate taxes and deductions',
    icon: CalculatorOutlined,
    status: 'pending',
    agents: ['Tax Calculation Agent', 'Compliance Agent'],
  },
  {
    id: 'income-extraction',
    name: 'income-extraction',
    title: 'Income Extraction',
    description: 'Extract and validate dividend, interest, and rental income',
    icon: DatabaseOutlined,
    status: 'pending',
    agents: ['Income Extraction Agent', 'Validation Agent'],
  },
  {
    id: 'capital-allowance',
    name: 'capital-allowance',
    title: 'Capital Allowance',
    description: 'Manage asset schedule and apply correct capital allowances',
    icon: CalculatorOutlined,
    status: 'pending',
    agents: ['Capital Allowance Agent', 'Asset Management Agent'],
  },
  {
    id: 'preview',
    name: 'preview',
    title: 'Preview & Submit',
    description: 'Preview final tax return and submit',
    icon: EyeOutlined,
    status: 'pending',
    agents: ['Preview Agent', 'Submission Agent'],
  },
];

// Workflow state from props
const workflowSteps = computed({
  get: () =>
    props.workflowState?.workflowSteps?.length
      ? props.workflowState.workflowSteps
      : defaultWorkflowSteps,
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { workflowSteps: value });
    }
  },
});

const currentWorkflowStep = computed({
  get: () => props.workflowState?.currentWorkflowStep || 0,
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { currentWorkflowStep: value });
    }
  },
});

const workflowActive = computed({
  get: () => props.workflowState?.workflowActive || false,
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { workflowActive: value });
    }
  },
});

// Computed property to determine if a workflow component should be disabled
const isWorkflowStepDisabled = computed(() => {
  return (stepId: string) => {
    const stepIndex = workflowSteps.value.findIndex((s) => s.id === stepId);

    // If workflow is not active, allow access to all steps
    if (!workflowActive.value) {
      return false;
    }

    // Allow access to current step and completed steps
    if (stepIndex !== -1) {
      const step = workflowSteps.value[stepIndex];
      // Allow current step or completed steps
      if (
        stepIndex === currentWorkflowStep.value ||
        step.status === 'completed'
      ) {
        return false;
      }
      // Disable pending steps that haven't been reached yet
      return true;
    }

    return true; // Disable unknown steps
  };
});

const uploadedFiles = computed({
  get: () => props.workflowState?.uploadedFiles || [],
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { uploadedFiles: value });
    }
  },
});

const extractedData = computed({
  get: () => props.workflowState?.extractedData || ({} as ExtractedData),
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { extractedData: value });
    }
  },
});

const taxResults = computed({
  get: () => props.workflowState?.taxResults || ({} as TaxResults),
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { taxResults: value });
    }
  },
});

// Client selection state
const selectedClient = computed({
  get: () => props.workflowState?.selectedClient || null,
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { selectedClient: value });
    }
  },
});

// Accounting period state
const selectedAccountingPeriod = computed({
  get: () => props.workflowState?.selectedAccountingPeriod || null,
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { selectedAccountingPeriod: value });
    }
  },
});

// Data entry method state
const selectedDataEntryMethod = computed({
  get: () => props.workflowState?.selectedDataEntryMethod || null,
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { selectedDataEntryMethod: value });
    }
  },
});

// Manual entry data state
const manualEntryData = computed({
  get: () =>
    props.workflowState?.manualEntryData ||
    ({ balanceSheet: [], incomeStatement: [] } as ManualEntryData),
  set: (value) => {
    if (props.workflowState) {
      emit('update-workflow-state', { manualEntryData: value });
    }
  },
});

watch(
  () => props.visible,
  (visible) => {
    if (visible && messages.value.length === 0) {
      nextTick(() => {
        initializeChat();
      });
    }
  },
  { immediate: true },
);

watch(
  messages,
  () => {
    nextTick(() => {
      if (shouldAutoScroll.value) {
        scrollToBottom();
      }
    });
  },
  { deep: true },
);

// Watch for all items reviewed status
watch(
  () => taxFilingStore.allItemsReviewed,
  (allReviewed) => {
    if (allReviewed) {
      handleAllItemsReviewed();
    }
  },
);

// Watch for empty messages array and auto-show welcome
watch(
  () => messages.value.length,
  (messageCount) => {
    // If messages become empty and component is visible, show welcome
    if (
      messageCount === 0 &&
      props.visible &&
      !isGenerating.value &&
      !isClearingChat.value
    ) {
      nextTick(() => {
        initializeChat();
      });
    }
  },
);

// Watch for state restoration
watch(
  () => props.isRestored,
  (isRestored) => {
    if (isRestored && props.workflowState) {
      // State is already handled by computed properties
      // Just ensure UI is updated if needed
      nextTick(() => {
        if (messages.value.length > 0) {
          scrollToBottom();
        }
      });
    }
  },
  { immediate: true },
);

async function initializeChat() {
  // Start with streaming indicator only
  messages.value = [];
  isGenerating.value = true;

  // Start streaming animation for welcome message
  startStreamingAnimation();

  // Stop streaming and add the interactive welcome component
  stopStreamingAnimation();
  isGenerating.value = false;

  const welcomeMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'ai',
    content: 'Welcome to ibizztax.ai AI Assistant',
    timestamp: new Date(),
    component: 'workflow-welcome',
  };

  messages.value = [welcomeMessage];

  // Add to conversation history
  conversationHistory.value.push({
    role: 'assistant',
    content:
      'Welcome to ibizztax.ai AI Assistant - Interactive workflow interface loaded',
  });

  await nextTick();
  scrollToBottom();
}

async function sendMessage() {
  if (!currentMessage.value.trim()) return;

  // Prevent new messages while AI is generating, workflow step is processing, or chat is clearing
  if (
    isGenerating.value ||
    isWorkflowStepProcessing.value ||
    isClearingChat.value
  ) {
    return;
  }

  // Remove welcome component when user starts interacting
  messages.value = messages.value.filter(
    (msg) => msg.component !== 'workflow-welcome',
  );

  // Handle slash commands
  if (currentMessage.value.startsWith('/')) {
    const command = slashCommands.value.find(
      (cmd) => cmd.command === currentMessage.value.trim(),
    );
    if (command) {
      currentMessage.value = '';
      showCommandMenu.value = false;
      command.action();
      return;
    }
  }

  const userMessageContent = currentMessage.value;

  // Auto-detect workflow start intent
  const startPhrases = [
    'i wan start',
    'i want start',
    'start workflow',
    'begin workflow',
    'start the workflow',
    "let's start",
    'lets start',
    'begin',
    'start',
    'go',
    'proceed',
    'continue',
  ];

  const shouldStartWorkflow = startPhrases.some((phrase) =>
    userMessageContent.toLowerCase().includes(phrase.toLowerCase()),
  );

  // If user wants to start and workflow is not active, trigger it automatically
  if (shouldStartWorkflow && !workflowActive.value) {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    };

    messages.value.push(userMessage);

    // Add user message to conversation history
    conversationHistory.value.push({
      role: 'user',
      content: userMessageContent,
    });

    currentMessage.value = '';
    showCommandMenu.value = false;

    // Auto-scroll after user message
    await nextTick();
    scrollToBottom();

    // Add AI confirmation message
    const confirmationMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content:
        'Perfect! I understand you want to start the tax filing workflow. Let me initiate the process for you right away.',
      timestamp: new Date(),
    };

    messages.value.push(confirmationMessage);

    // Add AI response to conversation history
    conversationHistory.value.push({
      role: 'assistant',
      content: confirmationMessage.content,
    });

    await nextTick();
    scrollToBottom();
    startWorkflow();

    return;
  }

  // Handle backward navigation requests by showing workflow navigator
  if (workflowActive.value) {
    const backwardPhrases = [
      'go back',
      'previous step',
      'back',
      'return',
      'navigate',
      'workflow navigator',
    ];

    const isBackwardRequest = backwardPhrases.some((phrase) =>
      userMessageContent.toLowerCase().includes(phrase.toLowerCase()),
    );

    if (isBackwardRequest) {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        type: 'user',
        content: userMessageContent,
        timestamp: new Date(),
      };

      messages.value.push(userMessage);

      // Add user message to conversation history
      conversationHistory.value.push({
        role: 'user',
        content: userMessageContent,
      });

      currentMessage.value = '';
      showCommandMenu.value = false;

      // Auto-scroll after user message
      await nextTick();
      scrollToBottom();

      // Add AI response and show workflow navigator
      const navigationMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content:
          "I'll open the workflow navigator for you! You can now navigate to any completed step to make changes. All your progress and data will be preserved when switching between steps.",
        timestamp: new Date(),
      };

      messages.value.push(navigationMessage);

      // Add AI response to conversation history
      conversationHistory.value.push({
        role: 'assistant',
        content: navigationMessage.content,
      });

      // Show workflow navigator
      openWorkflowNavigator();

      await nextTick();
      scrollToBottom();
      return;
    }
  }

  const userMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    type: 'user',
    content: userMessageContent,
    timestamp: new Date(),
  };

  messages.value.push(userMessage);

  // Add user message to conversation history
  conversationHistory.value.push({
    role: 'user',
    content: userMessageContent,
  });

  currentMessage.value = '';
  showCommandMenu.value = false;

  // Auto-scroll after user message
  await nextTick();
  scrollToBottom();

  // Generate AI response with streaming
  await generateAIResponse(userMessageContent);
}

// Generate AI response with streaming capabilities
async function generateAIResponse(userMessage: string) {
  // Get current specialist for this workflow step
  const currentSpecialist = getCurrentSpecialist();

  // Only show streaming indicator, don't add empty message yet
  isGenerating.value = true;

  // Start streaming text animation
  startStreamingAnimation();

  try {
    const responseStream = openaiService.generateStreamingResponse(
      userMessage,
      currentWorkflowStep.value,
      workflowSteps.value,
      conversationHistory.value,
      currentSpecialist,
    );

    let finalResponse = '';
    let aiMessage: ChatMessage | null = null;

    for await (const chunk of responseStream) {
      // Create AI message on first chunk
      if (!aiMessage) {
        aiMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: '',
          timestamp: new Date(),
          specialistInfo: {
            name: currentSpecialist.name,
            expertise: currentSpecialist.expertise,
            description: currentSpecialist.description,
          },
        };

        // Stop streaming indicator and add the actual message
        stopStreamingAnimation();
        isGenerating.value = false;
        messages.value.push(aiMessage);
      }

      // Update message content with streaming response
      const messageIndex = messages.value.findIndex(
        (msg) => msg.id === aiMessage!.id,
      );
      if (messageIndex !== -1 && messages.value[messageIndex]) {
        messages.value[messageIndex].content = chunk.content;
        finalResponse = chunk.content;

        // Auto-scroll during streaming
        await nextTick();
        if (shouldAutoScroll.value) {
          scrollToBottom();
        }
      }

      // Handle workflow decision when response is complete
      if (chunk.isComplete && chunk.workflowDecision) {
        await handleWorkflowDecision(chunk.workflowDecision);
      }
    }

    // Add AI response to conversation history if we have a response
    if (finalResponse) {
      conversationHistory.value.push({
        role: 'assistant',
        content: finalResponse,
      });
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
  } finally {
    // Ensure streaming is stopped
    stopStreamingAnimation();
    isGenerating.value = false;
  }
}

// Handle workflow decisions from OpenAI
async function handleWorkflowDecision(decision: any) {
  // If AI suggests proceeding to next step with high confidence
  if (decision.shouldProceed && decision.confidence > 70 && decision.nextStep) {
    // Add a subtle suggestion message
    const suggestionMessage: ChatMessage = {
      id: `suggestion-${Date.now()}`,
      type: 'system',
      content: `💡 **Suggestion**: ${decision.suggestedAction || `Ready to proceed to ${decision.nextStep}?`}`,
      timestamp: new Date(),
    };

    setTimeout(() => {
      messages.value.push(suggestionMessage);
      nextTick(() => {
        if (shouldAutoScroll.value) {
          scrollToBottom();
        }
      });
    }, 1000);
  }
}

// Progressive agent activation system
const activeAgentsList = ref<string[]>([]);
const agentProgressMap = ref<Map<string, number>>(new Map());
const activatedSteps = ref<Set<number>>(new Set());

// Start workflow with progressive agent activation
const startWorkflow = async () => {
  workflowActive.value = true;
  currentWorkflowStep.value = 0;
  activeAgentsList.value = [];
  agentProgressMap.value.clear();
  activatedSteps.value.clear();

  // Initialize workflow without general timeline

  // Start with workflow orchestrator only
  await activateAgentsForStep(0);

  await nextTick();
  scrollToBottom();

  showWorkflowStep('client-selection');
};

// Activate agents progressively for each workflow step
const activateAgentsForStep = async (stepIndex: number) => {
  if (stepIndex >= workflowSteps.value.length) return;

  // Check if this step has already been activated to prevent duplicates
  if (activatedSteps.value.has(stepIndex)) {
    return;
  }

  const step = workflowSteps.value[stepIndex];
  if (step) {
    // Mark this step as activated
    activatedSteps.value.add(stepIndex);
    step.status = 'active';
    step.activeAgents = [];

    // Add agents for this step progressively
    for (let i = 0; i < step.agents.length; i++) {
      const agent = step.agents[i];

      if (agent) {
        // Add agent with delay for visual effect
        setTimeout(async () => {
          activeAgentsList.value.push(agent);
          agentProgressMap.value.set(agent, 0);

          // Add agent to timeline step instead of chat message
          const agentInfo = {
            name: agent,
            progress: 0,
            status: 'deploying' as const,
            agentType: getAgentType(agent),
          };

          if (!step.activeAgents) {
            step.activeAgents = [];
          }
          step.activeAgents.push(agentInfo);

          // Progress simulation removed - using step-specific timelines instead
        }, i * 800); // 800ms delay between each agent activation
      }
    }
  }
};

// Timeline-related functions removed - using step-specific timelines instead

// Handle client selection
const handleClientSelected = async (client: EnhancedSystemClient) => {
  selectedClient.value = client;

  // Client selection handled by timeline display

  // Mark client selection step as completed
  const clientSelectionStep = workflowSteps.value.find(
    (step) => step.id === 'client-selection',
  );
  if (clientSelectionStep) {
    clientSelectionStep.status = 'completed';
  }

  // Move to next step (accounting period)
  currentWorkflowStep.value = 1;
  await activateAgentsForStep(1);

  // Show accounting period step after a delay

  showWorkflowStep('accounting-period');

  await nextTick();
  scrollToBottom();
};

// Handle accounting period selection
const handleAccountingPeriodSelected = async (
  periodData: AccountingPeriodData,
) => {
  selectedAccountingPeriod.value = periodData;

  // Mark accounting period step as completed
  const accountingPeriodStep = workflowSteps.value.find(
    (step) => step.id === 'accounting-period',
  );
  if (accountingPeriodStep) {
    accountingPeriodStep.status = 'completed';
  }

  // Move to next step (data entry method selection)
  currentWorkflowStep.value = 2;
  await activateAgentsForStep(2);

  showWorkflowStep('data-entry-method');

  await nextTick();
  scrollToBottom();
};

// Handle data entry method selection
const handleDataEntryMethodSelected = async (method: 'manual' | 'upload') => {
  selectedDataEntryMethod.value = { method };

  // Mark data entry method step as completed
  const dataEntryMethodStep = workflowSteps.value.find(
    (step) => step.id === 'data-entry-method',
  );
  if (dataEntryMethodStep) {
    dataEntryMethodStep.status = 'completed';
  }

  // Move to next step based on selected method
  if (method === 'manual') {
    // Move to manual entry step
    currentWorkflowStep.value = 3;
    await activateAgentsForStep(3);
    showWorkflowStep('manual-entry');
  } else {
    // Move to upload step
    currentWorkflowStep.value = 4;
    await activateAgentsForStep(4);
    showWorkflowStep('upload');
  }

  await nextTick();
  scrollToBottom();
};

// Get agent type based on name
const getAgentType = (agentName: string): AgentType => {
  if (agentName.includes('Coordinator') || agentName.includes('Orchestrator'))
    return 'coordinator';
  if (
    agentName.includes('Validation') ||
    agentName.includes('Review') ||
    agentName.includes('Quality')
  )
    return 'validator';
  if (
    agentName.includes('Handler') ||
    agentName.includes('Calculation') ||
    agentName.includes('Extraction')
  )
    return 'processor';
  return 'specialist';
};

// Show workflow step
const showWorkflowStep = async (stepId: any) => {
  const step = workflowSteps.value.find((s) => s.id === stepId);
  if (!step) {
    return;
  }

  // Remove welcome component when any workflow step is shown
  messages.value = messages.value.filter(
    (msg) => msg.component !== 'workflow-welcome',
  );

  if (
    [
      'client-selection',
      'accounting-period',
      'data-entry-method',
      'manual-entry',
      'manual-entry-balance-sheet',
      'manual-entry-income-statement',
      'upload',
      'classify',
      'extract',
      'review',
      'expense-review',
      'compute',
      'income-extraction',
      'capital-allowance',
      'preview',
    ].includes(stepId)
  ) {
    // Add workflow step component message for interactive steps
    const stepMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'workflow',
      content: '',
      timestamp: new Date(),
      workflowStep: stepId,
      component: `workflow-${stepId}`,
      data: { step },
    };

    messages.value.push(stepMessage);
  }
  await nextTick();
  scrollToBottom();
};

// Helper function to gather current workflow state for snapshot
const gatherWorkflowStateData = () => {
  return {
    selectedClient: selectedClient.value,
    selectedAccountingPeriod: selectedAccountingPeriod.value,
    selectedDataEntryMethod: selectedDataEntryMethod.value,
    manualEntryData: manualEntryData.value,
    uploadedFiles: uploadedFiles.value,
    extractedData: extractedData.value,
    taxResults: taxResults.value,
    messages: messages.value,
    conversationHistory: conversationHistory.value,
    workflowSteps: workflowSteps.value,
    currentWorkflowStep: currentWorkflowStep.value,
    workflowActive: workflowActive.value,
  };
};

// Complete workflow step with progressive agent management
const completeWorkflowStep = async (stepId: string, data: any) => {
  const stepIndex = workflowSteps.value.findIndex((s) => s.id === stepId);
  if (stepIndex === -1) return;

  // Prevent concurrent workflow step processing
  if (isWorkflowStepProcessing.value) {
    return;
  }

  isWorkflowStepProcessing.value = true;

  // Mark all agents in current step as completed
  const currentStep = workflowSteps.value[stepIndex];
  if (currentStep) {
    currentStep.agents.forEach((agent) => {
      agentProgressMap.value.set(agent, 100);
      const agentMessage = messages.value.find(
        (msg) =>
          msg.agentInfo?.agentName === agent &&
          msg.agentInfo?.status === 'processing',
      );
      if (agentMessage && agentMessage.agentInfo) {
        agentMessage.agentInfo.status = 'completed';
        agentMessage.agentInfo.progress = 100;
      }
    });
  }

  if (workflowSteps.value[stepIndex]) {
    workflowSteps.value[stepIndex].status = 'completed';
  }

  // Save workflow snapshot before moving to next step
  try {
    const workflowStateData = gatherWorkflowStateData();
    workflowHistoryStore.saveWorkflowSnapshot(
      stepId,
      stepIndex,
      workflowStateData,
      sessionId.value,
    );
    console.log(`Workflow snapshot saved for step: ${stepId}`);
  } catch (error) {
    console.error('Failed to save workflow snapshot:', error);
  }

  // Emit step completion
  emit('workflow-step-completed', stepId, data);

  // Step completion handled by timeline display

  // Handle workflow step transitions based on step type and user selections
  if (stepIndex < workflowSteps.value.length - 1) {
    let nextStepIndex = stepIndex + 1;

    // Special handling for workflow branching
    switch (stepId) {
      case 'manual-entry': {
        // After manual entry, skip upload and go to classify
        nextStepIndex = workflowSteps.value.findIndex(
          (s) => s.id === 'classify',
        );

        break;
      }
    }

    if (nextStepIndex !== -1 && nextStepIndex < workflowSteps.value.length) {
      currentWorkflowStep.value = nextStepIndex;

      // Activate agents for next step
      await activateAgentsForStep(nextStepIndex);

      const nextStep = workflowSteps.value[nextStepIndex];
      if (nextStep?.id) {
        showWorkflowStep(nextStep.id);
      }
    } else {
      completeWorkflow();
    }
  } else {
    completeWorkflow();
  }

  // Reset workflow step processing state
  isWorkflowStepProcessing.value = false;

  await nextTick();
  scrollToBottom();
};

// Handle workflow step navigation from WorkflowNavigator
const handleWorkflowNavigation = async (stepIndex: number) => {
  if (!workflowActive.value) return;

  const targetStep = workflowSteps.value[stepIndex];
  if (!targetStep) return;

  // Only allow navigation to completed steps or current step
  if (
    targetStep.status !== 'completed' &&
    stepIndex !== currentWorkflowStep.value
  ) {
    return;
  }

  // Close the workflow navigator
  closeWorkflowNavigator();

  // Try to restore workflow snapshot for the target step
  let restoredData = false;
  try {
    const snapshot = workflowHistoryStore.restoreWorkflowSnapshot(
      targetStep.id,
      sessionId.value,
    );

    if (snapshot && snapshot.data) {
      // Restore workflow state from snapshot
      if (snapshot.data.selectedClient !== undefined) {
        selectedClient.value = snapshot.data.selectedClient;
      }
      if (snapshot.data.selectedAccountingPeriod !== undefined) {
        selectedAccountingPeriod.value = snapshot.data.selectedAccountingPeriod;
      }
      if (snapshot.data.selectedDataEntryMethod !== undefined) {
        selectedDataEntryMethod.value = snapshot.data.selectedDataEntryMethod;
      }
      if (snapshot.data.manualEntryData !== undefined) {
        manualEntryData.value = snapshot.data.manualEntryData;
      }
      if (snapshot.data.uploadedFiles !== undefined) {
        uploadedFiles.value = snapshot.data.uploadedFiles;
      }
      if (snapshot.data.extractedData !== undefined) {
        extractedData.value = snapshot.data.extractedData;
      }
      if (snapshot.data.taxResults !== undefined) {
        taxResults.value = snapshot.data.taxResults;
      }
      if (snapshot.data.conversationHistory !== undefined) {
        conversationHistory.value = snapshot.data.conversationHistory;
      }

      restoredData = true;
      console.log(
        `Workflow state restored from snapshot for step: ${targetStep.id}`,
      );
    }
  } catch (error) {
    console.error('Failed to restore workflow snapshot:', error);
  }

  // Update current workflow step
  currentWorkflowStep.value = stepIndex;

  // Add navigation message
  const navigationMessage: ChatMessage = {
    id: `ai-${Date.now()}`,
    type: 'ai',
    content: restoredData
      ? `Navigated to ${targetStep.title}. Your previous data and progress have been restored from history.`
      : `Navigated to ${targetStep.title}. You can now review or modify this step.`,
    timestamp: new Date(),
  };

  messages.value.push(navigationMessage);

  // Add to conversation history
  conversationHistory.value.push({
    role: 'assistant',
    content: navigationMessage.content,
  });

  // Show the workflow step component
  await showWorkflowStep(targetStep.id);

  await nextTick();
  scrollToBottom();
};

// Enhanced restart workflow with agent cleanup
const restartWorkflow = async () => {
  // Show workflow navigator instead of preventing restart
  if (workflowActive.value) {
    openWorkflowNavigator();

    const navigationMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content:
        "I've opened the workflow navigator for you. You can navigate to any completed step to make changes or continue from where you left off.",
      timestamp: new Date(),
    };

    messages.value.push(navigationMessage);

    // Add AI response to conversation history
    conversationHistory.value.push({
      role: 'assistant',
      content: restrictionMessage.content,
    });

    await nextTick();
    scrollToBottom();
    return;
  }

  workflowActive.value = false;
  currentWorkflowStep.value = 0;
  activeAgentsList.value = [];
  agentProgressMap.value.clear();
  activatedSteps.value.clear();

  workflowSteps.value.forEach((step) => (step.status = 'pending'));

  // Workflow restart handled by timeline display
  await nextTick();
  scrollToBottom();
};

// Complete entire workflow
const completeWorkflow = async () => {
  workflowActive.value = false;

  // Workflow completion handled by timeline display
  emit('workflow-completed', {
    extractedData: extractedData.value,
    taxResults: taxResults.value,
  });
  await nextTick();
  scrollToBottom();
};

// Handle welcome component actions
function handleWelcomeAction(actionType: string) {
  switch (actionType) {
    case 'start': {
      // Remove the welcome message from the chat
      messages.value = messages.value.filter(
        (msg) => msg.component !== 'workflow-welcome',
      );
      startWorkflow();
      break;
    }
    case 'help': {
      // Remove the welcome message and show help guide
      messages.value = messages.value.filter(
        (msg) => msg.component !== 'workflow-welcome',
      );
      showHelpGuide();
      break;
    }
    case 'clear': {
      clearChatWithTransition();
      break;
    }
    default: {
      console.warn('Unknown action type:', actionType);
    }
  }
}

// Command functions

function clearChat() {
  // Clear all messages
  messages.value = [];

  // Reset workflow state
  workflowActive.value = false;
  currentWorkflowStep.value = 0;
  workflowSteps.value.forEach((step) => (step.status = 'pending'));

  selectedClient.value = null;
  // Clear active agents and progress
  activeAgentsList.value = [];
  agentProgressMap.value.clear();
  activatedSteps.value.clear();

  // Clear clicked actions
  clickedActions.value.clear();
  messagesWithClickedActions.value.clear();

  // Clear uploaded files and extracted data
  uploadedFiles.value = [];
  extractedData.value = {} as ExtractedData;
  taxResults.value = {} as TaxResults;

  initializeChat();
}

// Enhanced clear chat with smooth transition
function clearChatWithTransition() {
  // Set clearing state to block all interactions
  isClearingChat.value = true;

  // Add a clearing message with animation
  const clearingMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'system',
    content: '🔄 Clearing conversation and resetting all systems...',
    timestamp: new Date(),
  };

  messages.value.push(clearingMessage);

  // Scroll to show the clearing message
  nextTick(() => {
    scrollToBottom();

    clearChat();
    isClearingChat.value = false;
  });
}

// Show help guide component
function showHelpGuide() {
  helpGuideModalApi.open();
}

// Handle help guide actions (now handled by modal close)
function handleHelpAction(actionType: string) {
  helpGuideModalApi.close();

  switch (actionType) {
    case 'start': {
      startWorkflow();
      break;
    }
    case 'clear': {
      clearChatWithTransition();
      break;
    }
    case 'back':
    default: {
      // Just close the modal, no additional action needed
      break;
    }
  }
}

function scrollToBottom() {
  if (chatContainer.value) {
    setTimeout(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        shouldAutoScroll.value = true;
      }
    }, 100);
  }
}

// Check if user is near bottom of chat
function isNearBottom(): boolean {
  if (!chatContainer.value) return true;
  const { scrollTop, scrollHeight, clientHeight } = chatContainer.value;
  return scrollHeight - scrollTop - clientHeight < 100;
}

// Handle scroll events to detect manual scrolling
function handleScroll() {
  if (!chatContainer.value) return;

  shouldAutoScroll.value = isNearBottom();
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && !showCommandMenu.value) {
    event.preventDefault();
    sendMessage();
  }
}

// Handle keyboard navigation for command menu
function handleKeyDown(event: KeyboardEvent) {
  if (showCommandMenu.value) {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        selectedCommandIndex.value = Math.min(
          selectedCommandIndex.value + 1,
          filteredCommands.value.length - 1,
        );
        nextTick(() => {
          const commandItems = document.querySelectorAll('[data-command-item]');
          const selectedElement = commandItems[selectedCommandIndex.value];
          if (selectedElement) {
            selectedElement.scrollIntoView({
              block: 'nearest',
              behavior: 'smooth',
            });
          }
        });
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        selectedCommandIndex.value = Math.max(
          selectedCommandIndex.value - 1,
          0,
        );
        nextTick(() => {
          const commandItems = document.querySelectorAll('[data-command-item]');
          const selectedElement = commandItems[selectedCommandIndex.value];
          if (selectedElement) {
            selectedElement.scrollIntoView({
              block: 'nearest',
              behavior: 'smooth',
            });
          }
        });
        break;
      }
      case 'Enter': {
        event.preventDefault();
        if (filteredCommands.value[selectedCommandIndex.value]) {
          selectCommand(filteredCommands.value[selectedCommandIndex.value]);
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        showCommandMenu.value = false;
        break;
      }
      case 'Tab': {
        event.preventDefault();
        if (filteredCommands.value[selectedCommandIndex.value]) {
          currentMessage.value =
            filteredCommands.value[selectedCommandIndex.value].command;
          showCommandMenu.value = false;
        }
        break;
      }
    }
  }
}

// Handle input changes for command menu
const handleInputChange = () => {
  const value = currentMessage.value;

  if (value.startsWith('/')) {
    const searchTerm = value.slice(1).toLowerCase();
    filteredCommands.value = slashCommands.value.filter(
      (cmd) =>
        cmd.command.slice(1).toLowerCase().includes(searchTerm) ||
        cmd.description.toLowerCase().includes(searchTerm),
    );

    if (filteredCommands.value.length > 0) {
      showCommandMenu.value = true;
      selectedCommandIndex.value = 0;
      nextTick(() => {
        const commandContainer = document.querySelector(
          '[data-command-scroll]',
        );
        if (commandContainer) {
          commandContainer.scrollTop = 0;
        }
      });
    } else {
      showCommandMenu.value = false;
    }
  } else {
    showCommandMenu.value = false;
  }
};

// Close command menu when clicking outside
const handleClickOutside = (event: Event) => {
  if (
    showCommandMenu.value &&
    !(event.target as Element)?.closest('[data-command-menu]')
  ) {
    showCommandMenu.value = false;
  }
};

onMounted(() => {
  // Reset all tax filing state on component mount
  taxFilingStore.resetAllState();

  document.addEventListener('click', handleClickOutside);
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.addEventListener('scroll', handleScroll);

      // Add ResizeObserver to watch for height changes and auto-scroll
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { height } = entry.contentRect;
          // Store previous height to detect increases
          if (chatContainer.value) {
            if (!chatContainer.value.dataset.previousHeight) {
              chatContainer.value.dataset.previousHeight = height.toString();
              return;
            }

            const previousHeight = Number.parseFloat(
              chatContainer.value.dataset.previousHeight,
            );
            if (height > previousHeight && shouldAutoScroll.value) {
              // Height increased, auto-scroll to bottom
              setTimeout(() => {
                scrollToBottom();
              }, 50);
            }
            // Update stored height
            chatContainer.value.dataset.previousHeight = height.toString();

            // Start observing the chat container
            resizeObserver.observe(chatContainer.value);

            // Store observer reference for cleanup
            (chatContainer.value as any).resizeObserver = resizeObserver;
          }
        }
      });
    }
  });
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);

  if (chatContainer.value) {
    chatContainer.value.removeEventListener('scroll', handleScroll);

    // Clean up ResizeObserver
    if ((chatContainer.value as any).resizeObserver) {
      (chatContainer.value as any).resizeObserver.disconnect();
      delete (chatContainer.value as any).resizeObserver;
    }
  }
});

// Select command from menu
const selectCommand = (command: any) => {
  currentMessage.value = command.command;
  showCommandMenu.value = false;
  sendMessage();
};

// File upload handler
const handleFileUpload = (files: UploadedFile[]) => {
  uploadedFiles.value = files;
};

// Workflow step completion handlers
const handleWorkflowStepComplete = (stepId: string, data: any) => {
  switch (stepId) {
    case 'client-selection': {
      selectedClient.value = data.selectedClient;
      // Store client in tax filing store
      taxFilingStore.setClientForTaxFiling(data.selectedClient);
      break;
    }
    case 'upload': {
      uploadedFiles.value = data.files;
      break;
    }
    case 'extract': {
      extractedData.value = data.extractedData;
      break;
    }

    case 'compute': {
      taxResults.value = data.taxResults;
      break;
    }
  }

  completeWorkflowStep(stepId, data);
};

// Reference to ClientSidebar component
const clientSidebarRef = ref();

// Handle review status updates from WorkflowExtract
const handleReviewStatusUpdate = (reviewData: any) => {
  // Update the stepResults to reflect the new review status
  if (extractedData.value) {
    extractedData.value.reviewStatus = reviewData;
  }

  // Update the sidebar's review status directly
  if (clientSidebarRef.value && reviewData) {
    // Map the review data to sidebar format
    if (reviewData.manufacturingAccount) {
      clientSidebarRef.value.updateReviewStatus(
        'manufacturingAccount',
        reviewData.manufacturingAccount,
      );
    }
    if (reviewData.tradingPL) {
      clientSidebarRef.value.updateReviewStatus(
        'tradingPL',
        reviewData.tradingPL,
      );
    }
    if (reviewData.balanceSheet) {
      clientSidebarRef.value.updateReviewStatus(
        'balanceSheet',
        reviewData.balanceSheet,
      );
    }
  }
};

// Handle extraction detection from WorkflowExtract
const handleExtractionDetected = (data: any) => {
  // Forward the extraction detection event to ClientSidebar
  if (clientSidebarRef.value) {
    clientSidebarRef.value.handleExtractionDetected(data);
  }
};

// Handle sidebar collapse state change
const handleSidebarCollapseChanged = (collapsed: boolean) => {
  sidebarCollapsed.value = collapsed;
};

// Handle action click with prevention of multiple clicks
const handleActionClick = (action: any, messageId: string) => {
  // If action has an ID, mark it as clicked to prevent multiple clicks
  if (action.id) {
    clickedActions.value.add(action.id);
  }

  // Mark the entire message as having a clicked action
  messagesWithClickedActions.value.add(messageId);

  // Execute the original action
  action.action();
};

// Handle all items reviewed event
const handleAllItemsReviewed = () => {
  // Create a computation prompt message
  const computationPromptMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    type: 'ai',
    content: `🎉 **All extraction items have been reviewed!**\n\nYour financial data has been successfully extracted and reviewed. You can now proceed with the tax computation process.\n\n**Next Steps:**\n• Click the button below to start tax computation\n• Review computed tax amounts\n• Generate tax forms\n\nWould you like to proceed with the computation?`,
    timestamp: new Date(),
    agentInfo: {
      agentType: 'coordinator',
      status: 'completed',
      agentName: 'Workflow Coordinator',
    },
    actions: [
      {
        id: `action-continue-${Date.now()}`,
        label: 'Continue with Tax Computation',
        action: () => {
          completeWorkflowStep('review', {});
        },
        variant: 'primary',
      },
      {
        id: `action-review-${Date.now()}-1`,
        label: 'Review Again',
        action: () => {
          completeWorkflowStep('extract', {});
        },
        variant: 'default',
      },
    ],
  };

  // Add the message to the chat
  messages.value.push(computationPromptMessage);

  // Auto-scroll to show the new message
  nextTick(() => {
    scrollToBottom();
  });
};

// Timeline update function removed - using step-specific timelines instead

// Helper functions for workflow steps
const getWorkflowStepTitle = (stepId: any) => {
  const step = workflowSteps.value.find((s) => s.id === stepId);
  return step?.title || 'Workflow Step';
};

const getWorkflowStepDescription = (stepId: any) => {
  const step = workflowSteps.value.find((s) => s.id === stepId);
  return step?.description || 'Processing workflow step';
};

const getWorkflowIcon = (stepId: any) => {
  const step = workflowSteps.value.find((s) => s.id === stepId);
  return step?.icon || RobotOutlined;
};

// Get agent type icon
const getAgentTypeIcon = (agentType?: string) => {
  const icons = {
    coordinator: ClusterOutlined,
    specialist: ApiOutlined,
    validator: CheckCircleOutlined,
    processor: ThunderboltOutlined,
    default: RobotOutlined,
  };
  return icons[agentType as keyof typeof icons] || icons.default;
};

// Streaming animation functions
const startStreamingAnimation = () => {
  const messages = [
    'Analyzing your request...',
    'Processing information...',
    'Consulting tax regulations...',
    'Preparing response...',
    'Finalizing recommendations...',
  ];

  let currentIndex = 0;
  let currentText = '';
  let charIndex = 0;

  const typeMessage = () => {
    if (currentIndex >= messages.length) {
      currentIndex = 0;
    }

    const currentMessage = messages[currentIndex];

    if (currentMessage) {
      if (charIndex < currentMessage.length) {
        currentText = currentMessage.slice(0, Math.max(0, charIndex + 1));
        streamingText.value = currentText;
        charIndex++;

        streamingInterval.value = setTimeout(
          typeMessage,
          50 + Math.random() * 50,
        );
      } else {
        // Pause before next message
        setTimeout(() => {
          currentIndex++;
          charIndex = 0;
          currentText = '';
          if (isGenerating.value) {
            typeMessage();
          }
        }, 1500);
      }
    }
  };

  typeMessage();
};

const stopStreamingAnimation = () => {
  if (streamingInterval.value) {
    clearTimeout(streamingInterval.value);
    streamingInterval.value = null;
  }
  streamingText.value = '';
};

// Cleanup on unmount
onUnmounted(() => {
  stopStreamingAnimation();
});

// Utility function to safely format timestamps
const formatTimestamp = (timestamp: Date | string | number) => {
  try {
    // If it's already a Date object, use it directly
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString();
    }

    // If it's a string or number, convert to Date
    const date = new Date(timestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }

    return date.toLocaleTimeString();
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return 'Invalid time';
  }
};

// Expose functions for parent component
defineExpose({
  startWorkflow,
  completeWorkflowStep,
  completeWorkflow,
  showWorkflowStep,
  handleFileUpload,
  handleKeyPress,
  restartWorkflow,
});
</script>

<template>
  <div
    :class="[
      'ai-chat-container fixed inset-0 flex h-screen w-full',
      { hidden: !visible },
      props.class,
    ]"
  >
    <!-- Client Sidebar -->
    <ClientSidebar
      ref="clientSidebarRef"
      :visible="!!selectedClient"
      :current-workflow-step="currentWorkflowStep"
      :uploaded-files="uploadedFiles"
      @collapse-changed="handleSidebarCollapseChanged"
    />

    <!-- Main Content Area -->
    <div
      :class="[
        'relative flex flex-1 flex-col transition-all duration-300',
        selectedClient ? (sidebarCollapsed ? 'mr-12' : 'mr-80') : 'mr-0',
      ]"
    >
      <!-- Clearing Chat Overlay -->
      <div
        v-if="isClearingChat"
        class="bg-card absolute inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
      >
        <div
          class="flex flex-col items-center space-y-4 rounded-xl p-8 shadow-2xl"
        >
          <div class="h-12 w-12 animate-spin rounded-full border-4"></div>
          <div class="text-center">
            <h3 class="text-foreground text-lg font-semibold">Clearing Chat</h3>
            <p class="text-foreground/90 text-sm">
              Resetting conversation and all systems...
            </p>
          </div>
        </div>
      </div>

      <!-- Enhanced Messages Container -->
      <div
        ref="chatContainer"
        class="mb-10 mt-20 flex-1 overflow-y-auto px-4 py-4 pb-12 pt-12"
        style="scrollbar-width: thin"
      >
        <div class="mx-auto max-w-6xl space-y-4">
          <!-- Messages -->
          <div v-for="message in messages" :key="message.id">
            <!-- Welcome Component -->
            <div v-if="message.component === 'workflow-welcome'">
              <Transition name="welcome-fade" appear mode="out-in">
                <div key="welcome">
                  <WorkflowWelcome @action="handleWelcomeAction" />
                </div>
              </Transition>
            </div>

            <!-- Help Guide Component (now handled by modal) -->

            <!-- Regular Messages -->
            <div v-else-if="!message.component">
              <div class="mb-6 flex items-start gap-4">
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <div v-if="message.type === 'user'" class="relative">
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"
                    >
                      <UserOutlined class="text-slate-600" />
                    </div>
                  </div>
                  <div v-else class="relative">
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
                    >
                      <component
                        :is="getAgentTypeIcon(message.agentInfo?.agentType)"
                        class="text-foreground text-sm"
                      />
                    </div>
                    <!-- Status indicator -->
                    <div
                      v-if="message.agentInfo"
                      class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                    >
                      <div
                        :class="[
                          'h-full w-full rounded-full',
                          message.agentInfo.status === 'processing'
                            ? 'animate-pulse bg-blue-500'
                            : message.agentInfo.status === 'completed'
                              ? 'bg-green-500'
                              : message.agentInfo.status === 'error'
                                ? 'bg-red-500'
                                : 'bg-gray-400',
                        ]"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Message Content -->
                <div class="min-w-0 flex-1">
                  <!-- Message Header -->
                  <div class="mb-2 flex items-center gap-3">
                    <span class="text-sm font-semibold">
                      {{
                        message.type === 'user'
                          ? 'You'
                          : message.specialistInfo?.name ||
                            message.agentInfo?.agentName ||
                            'AI Assistant'
                      }}
                    </span>

                    <!-- Agent Type Badge -->
                    <div
                      v-if="message.agentInfo?.agentType"
                      class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                    >
                      {{ message.agentInfo.agentType }}
                    </div>

                    <!-- Agent Status -->
                    <div
                      v-if="message.agentInfo"
                      class="flex items-center gap-2"
                    >
                      <span
                        :class="[
                          'rounded-full px-2 py-1 text-xs font-medium',
                          message.agentInfo.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : message.agentInfo.status === 'processing'
                              ? 'bg-blue-100 text-blue-700'
                              : message.agentInfo.status === 'error'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700',
                        ]"
                      >
                        {{ message.agentInfo.status.toUpperCase() }}
                      </span>

                      <div
                        v-if="message.agentInfo.progress !== undefined"
                        class="flex items-center gap-2"
                      >
                        <Progress
                          :percent="message.agentInfo.progress"
                          size="small"
                          :show-info="false"
                          stroke-linecap="round"
                          class="w-20"
                        />
                        <span class="text-xs text-slate-500">
                          {{ message.agentInfo.progress }}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Message Body -->
                  <div class="prose prose-sm max-w-none">
                    <div
                      class="text-foreground whitespace-pre-wrap text-sm leading-relaxed"
                    >
                      {{ message.content }}
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div
                    v-if="message.actions && message.actions.length > 0"
                    class="mt-3 flex flex-wrap gap-2"
                  >
                    <Button
                      v-for="(action, index) in message.actions"
                      :key="index"
                      :type="
                        action.variant === 'primary' ? 'primary' : 'default'
                      "
                      :disabled="
                        isClearingChat ||
                        messagesWithClickedActions.has(message.id)
                      "
                      @click.prevent="handleActionClick(action, message.id)"
                      class="transition-all duration-200 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {{ action.label }}
                      <span
                        v-if="messagesWithClickedActions.has(message.id)"
                        class="ml-1 text-xs opacity-60"
                        >(Selected)</span
                      >
                    </Button>
                  </div>

                  <!-- Timestamp -->
                  <div class="mt-2 text-xs text-slate-400">
                    {{ formatTimestamp(message.timestamp) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Workflow Step Components -->
            <div v-else-if="message.component?.startsWith('workflow-')">
              <div class="flex items-start space-x-3">
                <!-- Workflow Icon -->
                <div class="flex-shrink-0">
                  <div
                    class="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-md"
                  >
                    <div
                      class="flex h-full w-full items-center justify-center rounded-xl backdrop-blur-sm"
                    >
                      <component
                        :is="getWorkflowIcon(message.workflowStep)"
                        class="text-sm"
                      />
                    </div>
                  </div>
                </div>

                <!-- Workflow Content -->
                <div class="min-w-0 flex-1">
                  <!-- Workflow Header -->
                  <div class="mb-2 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <span class="text-primary text-sm font-semibold"
                        >{{
                          getWorkflowStepTitle(message.workflowStep)
                        }}
                        Agent</span
                      >
                      <Tag
                        color="processing"
                        class="rounded-full border-0 px-2 py-0.5 text-xs font-medium"
                      >
                        ACTIVE
                      </Tag>
                    </div>
                  </div>

                  <!-- Workflow Description -->
                  <div class="mb-3">
                    <p class="text-sm font-medium opacity-80">
                      {{ getWorkflowStepDescription(message.workflowStep) }}
                    </p>
                  </div>

                  <!-- Workflow Component -->
                  <div class="mb-10 backdrop-blur-sm">
                    <!-- Interactive workflow components for client selection and accounting period -->
                    <WorkflowClientSelection
                      v-if="message.component === 'workflow-client-selection'"
                      :disabled="isWorkflowStepDisabled('client-selection')"
                      @client-selected="handleClientSelected"
                      @step-loaded="scrollToBottom"
                      @step-complete="
                        (data: any) =>
                          handleWorkflowStepComplete('client-selection', data)
                      "
                    />
                    <WorkflowAccountingPeriod
                      v-if="message.component === 'workflow-accounting-period'"
                      :disabled="isWorkflowStepDisabled('accounting-period')"
                      @period-selected="handleAccountingPeriodSelected"
                      @step-loaded="scrollToBottom"
                      @step-shown="scrollToBottom"
                    />

                    <WorkflowDataEntryMethod
                      v-if="message.component === 'workflow-data-entry-method'"
                      :disabled="isWorkflowStepDisabled('data-entry-method')"
                      @method-selected="handleDataEntryMethodSelected"
                      @step-loaded="scrollToBottom"
                      @step-completed="
                        (data: any) =>
                          handleWorkflowStepComplete('data-entry-method', data)
                      "
                    />

                    <WorkflowManualEntry
                      v-if="message.component === 'workflow-manual-entry'"
                      :disabled="isWorkflowStepDisabled('manual-entry')"
                      @step-loaded="scrollToBottom"
                      @step-shown="scrollToBottom"
                      @step-complete="
                        (data: any) =>
                          handleWorkflowStepComplete('manual-entry', data)
                      "
                    />

                    <!-- Legacy workflow components (kept for backward compatibility) -->
                    <WorkflowUpload
                      v-if="message.component === 'workflow-upload'"
                      :disabled="isWorkflowStepDisabled('upload')"
                      :uploaded-files="uploadedFiles"
                      @step-loaded="scrollToBottom"
                      @step-shown="scrollToBottom"
                      @file-upload="handleFileUpload"
                      @step-complete="
                        (data) => handleWorkflowStepComplete('upload', data)
                      "
                    />
                    <WorkflowClassify
                      v-else-if="message.component === 'workflow-classify'"
                      :disabled="isWorkflowStepDisabled('classify')"
                      @step-loaded="scrollToBottom"
                      @step-shown="scrollToBottom"
                      :uploaded-files="uploadedFiles"
                      @step-complete="
                        (data) => handleWorkflowStepComplete('classify', data)
                      "
                    />
                    <WorkflowExtract
                      v-else-if="message.component === 'workflow-extract'"
                      :disabled="isWorkflowStepDisabled('extract')"
                      @step-loaded="scrollToBottom"
                      @step-shown="scrollToBottom"
                      @step-complete="
                        (data) => handleWorkflowStepComplete('extract', data)
                      "
                      @review-status-updated="handleReviewStatusUpdate"
                      @extraction-detected="handleExtractionDetected"
                    />
                    <WorkflowExpenseReview
                      v-else-if="
                        message.component === 'workflow-expense-review'
                      "
                      :disabled="isWorkflowStepDisabled('expense-review')"
                      @step-loaded="scrollToBottom"
                      @step-shown="scrollToBottom"
                      @step-completed="
                        (data) =>
                          handleWorkflowStepComplete('expense-review', data)
                      "
                    />
                    <WorkflowIncomeExtraction
                      v-else-if="
                        message.component === 'workflow-income-extraction'
                      "
                      :disabled="isWorkflowStepDisabled('income-extraction')"
                      @step-loaded="scrollToBottom"
                      @step-shown="scrollToBottom"
                      @step-complete="
                        (data) =>
                          handleWorkflowStepComplete('income-extraction', data)
                      "
                    />
                    <WorkflowCapitalAllowance
                      v-else-if="
                        message.component === 'workflow-capital-allowance'
                      "
                      :disabled="isWorkflowStepDisabled('capital-allowance')"
                      @step-loaded="scrollToBottom"
                      @step-shown="scrollToBottom"
                      @step-complete="
                        (data) =>
                          handleWorkflowStepComplete('capital-allowance', data)
                      "
                    />

                    <WorkflowCompute
                      v-else-if="message.component === 'workflow-compute'"
                      :disabled="isWorkflowStepDisabled('compute')"
                      @step-loaded="scrollToBottom"
                      @step-shown="scrollToBottom"
                      @step-complete="
                        (data) => handleWorkflowStepComplete('compute', data)
                      "
                    />
                    <WorkflowReview
                      v-else-if="message.component === 'workflow-review'"
                      :disabled="isWorkflowStepDisabled('review')"
                      @step-loaded="scrollToBottom"
                      @step-shown="scrollToBottom"
                      @step-complete="
                        (data) => handleWorkflowStepComplete('review', data)
                      "
                    />
                    <WorkflowPreview
                      v-else-if="message.component === 'workflow-preview'"
                      :disabled="isWorkflowStepDisabled('preview')"
                      @step-loaded="scrollToBottom"
                      @step-shown="scrollToBottom"
                      @step-complete="
                        (data) => handleWorkflowStepComplete('preview', data)
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Generating Indicator as Message -->
          <div v-if="isGenerating" class="streaming-message">
            <div class="mb-6 flex items-start gap-4">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div class="relative">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
                  >
                    <component
                      :is="getAgentTypeIcon(getCurrentSpecialist().agentType)"
                      class="text-sm"
                    />
                  </div>
                  <!-- Animated status indicator -->
                  <div
                    class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                  >
                    <div
                      class="h-full w-full animate-pulse rounded-full bg-blue-500"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Message Content -->
              <div class="min-w-0 flex-1">
                <!-- Message Header -->
                <div class="mb-2 flex items-center gap-3">
                  <span class="text-sm font-semibold">
                    {{ getCurrentSpecialist().name }}
                  </span>
                  <div
                    class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium"
                  >
                    {{ getCurrentSpecialist().agentType }}
                  </div>
                  <span
                    class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    THINKING
                  </span>
                </div>

                <!-- Streaming Message Body -->
                <div class="prose prose-sm max-w-none">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">{{ streamingText }}</span>
                    <div class="h-4 w-0.5 animate-pulse bg-blue-500"></div>
                  </div>
                  <div class="mt-2 flex items-center gap-1">
                    <div
                      class="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                      style="animation-delay: 0ms"
                    ></div>
                    <div
                      class="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                      style="animation-delay: 150ms"
                    ></div>
                    <div
                      class="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                      style="animation-delay: 300ms"
                    ></div>
                  </div>
                </div>

                <!-- Timestamp -->
                <div class="mt-2 text-xs text-slate-400">
                  {{ new Date().toLocaleTimeString() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Command Menu -->
      <div
        v-if="showCommandMenu"
        class="fixed bottom-32 left-1/3 z-50 -translate-x-1/2 transform"
        data-command-menu
      >
        <div class="w-[400px]">
          <div
            class="bg-card text-foreground overflow-hidden rounded-lg border shadow-lg"
          >
            <div class="border-b px-2 py-1">
              <div class="flex items-start justify-between">
                <div class="flex items-start space-x-2">
                  <div class="rounded p-1">
                    <ThunderboltOutlined class="text-foreground text-lg" />
                  </div>
                  <div>
                    <h3 class="text-left text-sm font-semibold">Commands</h3>
                  </div>
                </div>
                <button
                  @click="showCommandMenu = false"
                  class="rounded p-1 transition-all duration-200"
                >
                  <svg
                    class="h-4 w-4 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Command List -->
            <div class="max-h-48 overflow-y-auto p-1 pb-3" data-command-scroll>
              <div
                v-for="(command, index) in filteredCommands"
                :key="command.command"
                :class="[
                  'relative mx-1 my-3 cursor-pointer overflow-hidden rounded-lg border p-2 transition-all duration-300 hover:shadow-md',
                  selectedCommandIndex === index
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg dark:border-blue-400 dark:from-blue-900/20 dark:to-indigo-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                ]"
                data-command-item
                @click="selectCommand(command)"
              >
                <!-- Selected item gradient overlay -->
                <div
                  v-if="selectedCommandIndex === index"
                  class="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5"
                ></div>

                <div class="relative flex items-start space-x-3">
                  <!-- Command Icon -->
                  <div
                    :class="[
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300',
                      selectedCommandIndex === index
                        ? 'bg-primary shadow-md'
                        : 'text-foreground bg-gray-100',
                    ]"
                  >
                    <component
                      :is="command.icon"
                      class="text-foreground text-sm"
                    />
                  </div>

                  <div class="min-w-0 flex-1">
                    <div
                      :class="[
                        'mb-1 text-left text-sm font-semibold transition-colors duration-200',
                        selectedCommandIndex === index
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-foreground/90',
                      ]"
                    >
                      {{ command.command }}
                    </div>
                    <div
                      :class="[
                        'text-left text-xs leading-relaxed',
                        selectedCommandIndex === index
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-foreground/60',
                      ]"
                    >
                      {{ command.description }}
                    </div>
                  </div>

                  <!-- Arrow -->
                  <div
                    :class="[
                      'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300',
                      selectedCommandIndex === index
                        ? 'text-foreground bg-blue-500 shadow-sm'
                        : 'opacity-0',
                    ]"
                  >
                    <svg
                      class="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Command Menu Footer -->
            <div class="border-t px-2 py-1">
              <div class="flex items-start justify-between">
                <div class="flex items-start space-x-2">
                  <div class="flex items-start space-x-2">
                    <div class="flex items-start space-x-1">
                      <kbd
                        class="rounded border px-1.5 py-0.5 font-mono text-xs"
                        >↑</kbd
                      >
                      <kbd
                        class="rounded border px-1.5 py-0.5 font-mono text-xs"
                        >↓</kbd
                      >
                    </div>
                    <span class="text-left text-xs">Navigate</span>
                  </div>
                  <div class="flex items-start space-x-2">
                    <kbd class="rounded border px-1.5 py-0.5 font-mono text-xs"
                      >Enter</kbd
                    >
                    <span class="text-left text-xs">Execute</span>
                  </div>
                </div>
                <div class="flex items-start space-x-2">
                  <div class="h-2 w-2 animate-pulse rounded-full"></div>
                  <span class="text-left text-xs font-medium">
                    {{ filteredCommands.length }} Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Input Area -->
      <div
        class="bg-card fixed bottom-0 left-0 right-0 z-10 border-t border-opacity-20 px-4 py-2 backdrop-blur-xl"
      >
        <div class="mx-auto max-w-6xl">
          <div class="relative">
            <!-- Input Container -->
            <div
              class="relative flex items-center space-x-3 rounded-xl border border-opacity-20 p-2 shadow-lg backdrop-blur-xl"
            >
              <!-- Gradient border effect -->
              <div class="absolute inset-0 rounded-xl p-px opacity-20">
                <div class="h-full w-full rounded-xl backdrop-blur-xl"></div>
              </div>

              <div class="relative z-10 flex-1">
                <TextArea
                  v-model:value="currentMessage"
                  :rows="1"
                  :auto-size="{ minRows: 1, maxRows: 3 }"
                  placeholder="Message the AI agent collective... (type '/' for commands)"
                  :disabled="isGenerating || isClearingChat"
                  @keypress="handleKeyPress"
                  @keydown="handleKeyDown"
                  @input="handleInputChange"
                  class="bg-card resize-none border-none text-sm leading-relaxed placeholder-opacity-50 focus:outline-none"
                  style="
                    background: transparent;
                    box-shadow: none !important;
                    font-family: inherit;
                  "
                />
              </div>

              <!-- Workflow Navigator Button -->
              <div class="relative z-10 flex-shrink-0">
                <Tooltip title="Open Workflow Navigator" v-if="workflowActive">
                  <Button
                    @click="openWorkflowNavigator"
                    class="shadow-md transition-all duration-300 hover:bg-blue-50"
                  >
                    <MenuOutlined class="text-sm" />
                  </Button>
                </Tooltip>
              </div>

              <!-- Enhanced Send Button -->
              <div class="relative z-10 flex-shrink-0">
                <Button
                  type="primary"
                  :disabled="
                    !currentMessage.trim() || isGenerating || isClearingChat
                  "
                  @click="sendMessage"
                  class="shadow-md transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SendOutlined class="text-sm" />
                </Button>
              </div>
            </div>

            <!-- Enhanced Footer -->
            <div class="mt-1 flex items-center justify-between px-1">
              <div class="flex items-center space-x-3">
                <div class="text-xs font-medium opacity-60">
                  💡 Use
                  <kbd
                    class="rounded border border-opacity-30 px-1.5 py-0.5 font-mono text-xs shadow-sm"
                    >/</kbd
                  >
                  for commands
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-1.5">
                  <div
                    class="h-1.5 w-1.5 animate-pulse rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                  ></div>
                  <span class="text-xs font-medium opacity-80"
                    >System Online</span
                  >
                </div>
                <div class="rounded-full border border-opacity-20 px-2 py-0.5">
                  <span class="text-xs font-medium">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Help Guide Modal -->
  <HelpGuideModal>
    <HelpGuide @action="handleHelpAction" />
  </HelpGuideModal>

  <!-- Workflow Navigator Floating Sidebar -->
  <Teleport to="body">
    <Transition name="sidebar">
      <div
        v-if="showWorkflowSidebar"
        class="fixed inset-0 z-40 flex justify-end"
        @click="closeWorkflowNavigator"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        ></div>

        <!-- Sidebar -->
        <div
          class="relative w-full max-w-md overflow-hidden bg-white shadow-2xl"
          @click.stop
        >
          <WorkflowNavigator
            :visible="showWorkflowSidebar"
            :workflow-steps="workflowSteps"
            :current-workflow-step="currentWorkflowStep"
            :workflow-active="workflowActive"
            @navigate-to-step="handleWorkflowNavigation"
            @close="closeWorkflowNavigator"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modern AI System Font Family */
.ai-chat-container {
  font-family:
    'Inter',
    'SF Pro Display',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

/* Streaming Effect Animations */
.streaming-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.typing-text {
  overflow: hidden;
  border-right: 2px solid #3b82f6;
  white-space: nowrap;
  animation:
    typewriter 2s steps(18) 1s both,
    blink-caret 1s step-end infinite;
}

.typing-text-delayed {
  opacity: 0;
  animation:
    fadeInDelayed 0.5s ease-in 3s forwards,
    typewriter-delayed 1.5s steps(25) 3s both;
  overflow: hidden;
  white-space: nowrap;
}

.streaming-dots {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.dot {
  opacity: 0;
  animation: dotPulse 1.5s infinite ease-in-out;
}

.dot-1 {
  animation-delay: 2s;
}

.dot-2 {
  animation-delay: 2.3s;
}

.dot-3 {
  animation-delay: 2.6s;
}

@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes typewriter-delayed {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink-caret {
  from,
  to {
    border-color: transparent;
  }
  50% {
    border-color: #3b82f6;
  }
}

@keyframes fadeInDelayed {
  to {
    opacity: 1;
  }
}

@keyframes dotPulse {
  0%,
  20% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  80%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
}

/* Enhanced Streaming Message Styles */
.streaming-message {
  animation: slideInFromBottom 0.3s ease-out;
}

.streaming-content {
  border-radius: 12px;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.streaming-text-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.streaming-text.typing-effect {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  min-height: 20px;
}

.streaming-cursor {
  width: 2px;
  height: 20px;
  animation: blink 1s infinite;
}

.streaming-dots-container {
  display: flex;
  gap: 4px;
  align-items: center;
}

.streaming-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  opacity: 0.3;
  animation: streamingDotPulse 1.5s infinite ease-in-out;
}

.streaming-dot.dot-1 {
  animation-delay: 0s;
}

.streaming-dot.dot-2 {
  animation-delay: 0.3s;
}

.streaming-dot.dot-3 {
  animation-delay: 0.6s;
}

@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes streamingDotPulse {
  0%,
  20% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
  80%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
}

/* Welcome Component Transition */
.welcome-fade-enter-active,
.welcome-fade-leave-active {
  transition: all 0.5s ease-in-out;
}

.welcome-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.welcome-fade-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.welcome-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.welcome-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* Sidebar Transition Animations */
.sidebar-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.sidebar-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.sidebar-enter-from {
  opacity: 0;
}

.sidebar-enter-from .relative {
  transform: translateX(100%);
}

.sidebar-leave-to {
  opacity: 0;
}

.sidebar-leave-to .relative {
  transform: translateX(100%);
}

.sidebar-enter-to,
.sidebar-leave-from {
  opacity: 1;
}

.sidebar-enter-to .relative,
.sidebar-leave-from .relative {
  transform: translateX(0);
}

/* Responsive Design for Sidebar */
@media (max-width: 768px) {
  .sidebar-enter-from .relative,
  .sidebar-leave-to .relative {
    transform: translateY(100%);
  }

  .sidebar-enter-to .relative,
  .sidebar-leave-from .relative {
    transform: translateY(0);
  }
}
</style>
