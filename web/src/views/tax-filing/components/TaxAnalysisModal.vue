<script lang="ts" setup>
import { ref, nextTick, watch } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import type { AIAnalysisResult, ChatMessage } from '#/services/openai';
import { openaiService } from '#/services/openai';
import { SendOutlined } from '@ant-design/icons-vue';

interface TaxAnalysisModalProps {
  visible: boolean;
  selectedExpense: any;
}

interface TaxAnalysisModalEmits {
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
  (e: 'section39-data', data: any): void;
}

const props = withDefaults(defineProps<TaxAnalysisModalProps>(), {
  visible: false,
  selectedExpense: null,
});

const emit = defineEmits<TaxAnalysisModalEmits>();

// Initialize Vben modal for tax analysis
const [AnalysisModal, analysisModalApi] = useVbenModal({
  title: 'AI-Powered Tax Analysis',
  onClosed: () => {
    // Handle modal closed by other means (ESC, click outside, etc.)
    if (props.visible) {
      closeAnalysisModal();
    }
  },
  onCancel: () => {
    // Handle cancel button or ESC key
    closeAnalysisModal();
  },
});

// AI Analysis state
const aiAnalysisResult = ref<AIAnalysisResult | null>(null);
const isAnalyzing = ref(false);
const analysisError = ref<string | null>(null);
const activeTab = ref<'analysis' | 'chat' | 'recommendations'>('analysis');

// AI Chat state
const chatMessages = ref<ChatMessage[]>([]);
const currentMessage = ref('');
const isChatLoading = ref(false);
const streamingContent = ref('');
const chatContainer = ref<HTMLElement | null>(null);

// Watch for visibility changes
watch(
  () => props.visible,
  async (newValue) => {
    if (newValue && props.selectedExpense) {
      // Ensure modal is properly reset before opening
      await nextTick();
      analysisModalApi.open();
      openAnalysisModal(props.selectedExpense);
    } else if (
      !newValue && // Only close if modal is actually open to avoid state conflicts
      analysisModalApi.state.isOpen
    ) {
      analysisModalApi.close();
    }
  },
  { immediate: false },
);

// Format number function
const formatNumber = (value: number) => {
  if (!value && value !== 0) return '0.00';
  return Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Open modal with expense analysis
const openAnalysisModal = async (expense: any) => {
  // Reset state
  aiAnalysisResult.value = null;
  analysisError.value = null;
  activeTab.value = 'analysis';
  chatMessages.value = [];

  // Start AI analysis
  await performAIAnalysis(expense);
};

// Close modal
const closeAnalysisModal = async () => {
  // Reset all component state
  aiAnalysisResult.value = null;
  analysisError.value = null;
  chatMessages.value = [];
  streamingContent.value = '';
  currentMessage.value = '';
  isChatLoading.value = false;
  isAnalyzing.value = false;
  activeTab.value = 'analysis';

  // Ensure modal API is properly closed
  if (analysisModalApi.state.isOpen) {
    analysisModalApi.close();
  }

  // Wait for next tick to ensure state is updated
  await nextTick();

  // Emit events to parent component
  emit('update:visible', false);
  emit('close');
};

// Perform AI Analysis
const performAIAnalysis = async (expense: any) => {
  if (!expense) return;

  isAnalyzing.value = true;
  analysisError.value = null;

  try {
    const description = expense.description || '';
    const itemType =
      description.includes('INCOME') ||
      description.includes('CLAIM') ||
      description.includes('SCRAP') ||
      description.includes('DISPOSAL')
        ? 'income'
        : 'expense';

    const result = await openaiService.performAIAnalysis({
      description,
      amount: expense.amount || expense.value || 0,
      itemType,
    });

    aiAnalysisResult.value = result;

    // Emit Section 39 data if available
    if (result.section39) {
      emit('section39-data', result.section39);
    }
  } catch (error) {
    console.error('AI Analysis error:', error);
    analysisError.value = 'Failed to perform AI analysis. Please try again.';
  } finally {
    isAnalyzing.value = false;
  }
};

// AI Chat functionality
const sendChatMessage = async () => {
  if (!currentMessage.value.trim() || !props.selectedExpense) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: currentMessage.value,
    timestamp: new Date(),
  };

  chatMessages.value.push(userMessage);
  const messageToSend = currentMessage.value;
  currentMessage.value = '';
  isChatLoading.value = true;
  streamingContent.value = '';

  try {
    const chatStream = openaiService.sendChatMessage({
      message: messageToSend,
      expense: {
        description: props.selectedExpense.description || '',
        amount:
          props.selectedExpense.amount || props.selectedExpense.value || 0,
      },
      chatHistory: chatMessages.value,
    });

    let fullResponse = '';
    for await (const chunk of chatStream) {
      fullResponse = chunk.content;
      streamingContent.value = fullResponse;

      if (chunk.isComplete) {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date(),
        };

        chatMessages.value.push(assistantMessage);
        streamingContent.value = '';

        // Scroll to bottom
        await nextTick();
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
        break;
      }
    }
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content:
        "I apologize, but I'm having trouble responding right now. Please try again.",
      timestamp: new Date(),
    };
    chatMessages.value.push(errorMessage);
  } finally {
    isChatLoading.value = false;
    streamingContent.value = '';
  }
};

// Export AI analysis
const exportAnalysis = () => {
  if (!aiAnalysisResult.value || !props.selectedExpense) return;

  const exportData = {
    item: {
      description: props.selectedExpense.description || '',
      amount: props.selectedExpense.amount || props.selectedExpense.value || 0,
    },
    analysis: aiAnalysisResult.value,
    timestamp: new Date().toISOString(),
    chatHistory: chatMessages.value,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tax-analysis-${(props.selectedExpense.description || 'unknown').replaceAll(/[^a-z0-9]/gi, '-')}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Regenerate analysis
const regenerateAnalysis = async () => {
  if (props.selectedExpense) {
    await performAIAnalysis(props.selectedExpense);
  }
};

// Helper functions now use the openai service
const getItemAllowability = (
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
) => {
  return openaiService.getItemAllowability(itemName, itemType);
};

const getItemTagIcon = (
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
) => {
  const allowability = getItemAllowability(itemName, itemType);

  if (itemType === 'income') {
    if (allowability === 'taxable') {
      return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
      </svg>`;
    } else if (allowability === 'exempt') {
      return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
      </svg>`;
    } else {
      return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>`;
    }
  }

  if (allowability === 'allowed') {
    return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>`;
  } else if (allowability === 'disallowed') {
    return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>`;
  } else {
    return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
    </svg>`;
  }
};

const getItemAnalysisClass = (
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
) => {
  const allowability = getItemAllowability(itemName, itemType);

  if (itemType === 'income') {
    return {
      'bg-green-50 border-green-200': allowability === 'taxable',
      'bg-blue-50 border-blue-200': allowability === 'exempt',
      'bg-yellow-50 border-yellow-200': allowability === 'partial',
    };
  }

  return {
    'bg-green-50 border-green-200': allowability === 'allowed',
    'bg-red-50 border-red-200': allowability === 'disallowed',
    'bg-yellow-50 border-yellow-200': allowability === 'partial',
  };
};

const getItemRuleName = (
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
) => {
  return openaiService.getItemRuleName(itemName, itemType);
};

const getItemStatus = (
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
) => {
  return openaiService.getItemStatus(itemName, itemType);
};
</script>

<template>
  <AnalysisModal>
    <template #title>
      <div class="space-y-6">
        <!-- Enhanced Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-4">
            <div
              class="from-primary to-primary/80 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg"
            >
              <svg
                class="text-foreground h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xl font-bold tracking-tight">AI Tax Analysis</h3>
              <p
                class="text-muted-foreground mt-1 truncate text-sm font-medium"
              >
                {{ selectedExpense?.description || 'Tax Item Analysis' }}
              </p>
              <div class="mt-3 flex items-center space-x-6">
                <div class="flex items-center space-x-2">
                  <svg
                    class="text-muted-foreground h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    ></path>
                  </svg>
                  <span class="text-sm font-semibold">
                    {{
                      formatNumber(
                        selectedExpense?.value || selectedExpense?.amount || 0,
                      )
                    }}
                  </span>
                </div>
                <div
                  v-if="aiAnalysisResult"
                  class="flex items-center space-x-4"
                >
                  <div class="flex items-center space-x-2">
                    <div class="bg-primary h-2 w-2"></div>
                    <span class="text-sm font-medium"
                      >{{ aiAnalysisResult.confidence }}% Confidence</span
                    >
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="bg-foreground h-2 w-2"></div>
                    <span class="text-sm font-medium"
                      >{{ aiAnalysisResult.riskLevel.toUpperCase() }} Risk</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Tab Navigation -->
        <div class="border-b">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'analysis'"
              :class="[
                'group inline-flex items-center border-b-2 px-1 py-4 text-sm font-semibold transition-all duration-200',
                activeTab === 'analysis'
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground border-transparent',
              ]"
            >
              <svg
                class="mr-3 h-5 w-5 transition-colors"
                :class="
                  activeTab === 'analysis'
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
              Analysis
            </button>
            <button
              @click="activeTab = 'chat'"
              :class="[
                'group inline-flex items-center border-b-2 px-1 py-4 text-sm font-semibold transition-all duration-200',
                activeTab === 'chat'
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground border-transparent',
              ]"
            >
              <svg
                class="mr-3 h-5 w-5 transition-colors"
                :class="
                  activeTab === 'chat'
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
              AI Chat
              <span
                v-if="chatMessages.length > 0"
                class="bg-primary text-primary-foreground ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                >{{ chatMessages.length }}</span
              >
            </button>
            <button
              @click="activeTab = 'recommendations'"
              :class="[
                'group inline-flex items-center border-b-2 px-1 py-4 text-sm font-semibold transition-all duration-200',
                activeTab === 'recommendations'
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground border-transparent',
              ]"
            >
              <svg
                class="mr-3 h-5 w-5 transition-colors"
                :class="
                  activeTab === 'recommendations'
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
              Recommendations
            </button>
          </nav>
        </div>
      </div>
    </template>

    <div v-if="selectedExpense" class="space-y-8">
      <!-- Enhanced Loading State -->
      <div
        v-if="isAnalyzing"
        class="flex flex-col items-center justify-center py-16"
      >
        <div class="relative mb-8">
          <div
            class="border-muted border-t-primary h-16 w-16 animate-spin rounded-full border-4"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="bg-primary/20 h-8 w-8 animate-pulse"></div>
          </div>
        </div>
        <div class="space-y-3 text-center">
          <h4 class="text-lg font-semibold">AI Analysis in Progress</h4>
          <p class="text-muted-foreground max-w-md">
            Our AI is carefully analyzing your tax item to provide comprehensive
            insights and recommendations.
          </p>
          <div
            class="text-muted-foreground flex items-center justify-center space-x-2 text-sm"
          >
            <div class="flex space-x-1">
              <div class="bg-primary h-2 w-2 animate-bounce rounded-full"></div>
              <div
                class="bg-primary h-2 w-2 animate-bounce rounded-full"
                style="animation-delay: 0.1s"
              ></div>
              <div
                class="bg-primary h-2 w-2 animate-bounce rounded-full"
                style="animation-delay: 0.2s"
              ></div>
            </div>
            <span>This may take a few moments</span>
          </div>
        </div>
      </div>

      <!-- Enhanced Error State -->
      <div
        v-else-if="analysisError"
        class="border-destructive/20 bg-destructive/5 rounded-xl border p-6"
      >
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div
              class="bg-destructive/10 flex h-10 w-10 items-center justify-center"
            >
              <svg
                class="text-destructive h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="text-destructive mb-1 text-sm font-semibold">
              Analysis Failed
            </h4>
            <p class="text-muted-foreground text-sm">{{ analysisError }}</p>
          </div>
        </div>
      </div>

      <!-- Enhanced Analysis Tab -->
      <div
        v-else-if="activeTab === 'analysis' && aiAnalysisResult"
        class="space-y-8"
      >
        <!-- AI Analysis Overview Card -->
        <div class="bg-card rounded-2xl border p-8 shadow-sm">
          <div class="mb-6 flex items-start justify-between">
            <div class="flex items-start space-x-6">
              <div
                class="bg-primary/10 ring-primary/20 flex h-20 w-20 items-center justify-center rounded-2xl ring-1"
              >
                <svg
                  v-if="
                    aiAnalysisResult.classification === 'deductible' ||
                    aiAnalysisResult.classification === 'exempt'
                  "
                  class="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <svg
                  v-else-if="
                    aiAnalysisResult.classification === 'non-deductible' ||
                    aiAnalysisResult.classification === 'taxable'
                  "
                  class="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="h-8 w-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <div class="flex-1">
                <div class="mb-2 flex items-center space-x-3">
                  <h4 class="text-2xl font-bold tracking-tight">
                    {{
                      aiAnalysisResult.classification.charAt(0).toUpperCase() +
                      aiAnalysisResult.classification.slice(1)
                    }}
                  </h4>
                  <div
                    class="bg-primary/10 text-primary inline-flex items-center px-3 py-1 text-xs font-semibold"
                  >
                    Tax Classification
                  </div>
                </div>
                <p class="text-muted-foreground max-w-2xl leading-relaxed">
                  {{ aiAnalysisResult.reasoning }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="mb-1 text-3xl font-bold tracking-tight">
                {{
                  formatNumber(
                    selectedExpense.value || selectedExpense.amount || 0,
                  )
                }}
              </div>
              <div class="text-muted-foreground text-sm font-medium">
                Total Amount
              </div>
            </div>
          </div>

          <!-- Enhanced Metrics Grid -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="bg-background rounded-xl border p-6">
              <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="bg-primary h-2 w-2"></div>
                  <span class="text-sm font-semibold">AI Confidence</span>
                </div>
                <span class="text-primary text-2xl font-bold"
                  >{{ aiAnalysisResult.confidence }}%</span
                >
              </div>
              <div class="space-y-2">
                <div class="bg-muted h-3 overflow-hidden">
                  <div
                    class="bg-primary h-full transition-all duration-500 ease-out"
                    :style="`width: ${aiAnalysisResult.confidence}%`"
                  ></div>
                </div>
                <p class="text-muted-foreground text-xs">
                  {{
                    aiAnalysisResult.confidence >= 80
                      ? 'High confidence in analysis'
                      : aiAnalysisResult.confidence >= 60
                        ? 'Moderate confidence'
                        : 'Lower confidence - review recommended'
                  }}
                </p>
              </div>
            </div>

            <div class="bg-background rounded-xl border p-6">
              <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="bg-foreground h-2 w-2"></div>
                  <span class="text-sm font-semibold">Risk Assessment</span>
                </div>
                <span class="text-foreground text-2xl font-bold">{{
                  aiAnalysisResult.riskLevel.toUpperCase()
                }}</span>
              </div>
              <div class="space-y-2">
                <div class="flex space-x-1">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="h-3 flex-1 transition-all duration-300"
                    :class="{
                      'bg-foreground':
                        i <=
                        (aiAnalysisResult.riskLevel === 'high'
                          ? 3
                          : aiAnalysisResult.riskLevel === 'medium'
                            ? 2
                            : 1),
                      'bg-muted':
                        i >
                        (aiAnalysisResult.riskLevel === 'high'
                          ? 3
                          : aiAnalysisResult.riskLevel === 'medium'
                            ? 2
                            : 1),
                    }"
                  ></div>
                </div>
                <p class="text-muted-foreground text-xs">
                  {{
                    aiAnalysisResult.riskLevel === 'low'
                      ? 'Low audit risk'
                      : aiAnalysisResult.riskLevel === 'medium'
                        ? 'Moderate audit risk'
                        : 'Higher audit risk - documentation critical'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 39 Eligibility Analysis -->
        <div
          v-if="aiAnalysisResult.section39"
          class="bg-card rounded-2xl border p-8 shadow-sm"
        >
          <div class="mb-6 flex items-start justify-between">
            <div class="flex items-start space-x-6">
              <div
                class="flex h-20 w-20 items-center justify-center rounded-2xl ring-1"
                :class="{
                  'bg-green-50 ring-green-200':
                    aiAnalysisResult.section39.eligible,
                  'bg-red-50 ring-red-200':
                    !aiAnalysisResult.section39.eligible,
                }"
              >
                <svg
                  v-if="aiAnalysisResult.section39.eligible"
                  class="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div class="flex-1">
                <div class="mb-2 flex items-center space-x-3">
                  <h4 class="text-2xl font-bold tracking-tight">
                    Section 39
                    {{
                      aiAnalysisResult.section39.eligible
                        ? 'Eligible'
                        : 'Not Eligible'
                    }}
                  </h4>
                  <div
                    class="inline-flex items-center px-3 py-1 text-xs font-semibold"
                    :class="{
                      'bg-green-100 text-green-800':
                        aiAnalysisResult.section39.eligible,
                      'bg-red-100 text-red-800':
                        !aiAnalysisResult.section39.eligible,
                    }"
                  >
                    {{ aiAnalysisResult.section39.legalBasis }}
                  </div>
                </div>
                <p class="text-muted-foreground max-w-2xl leading-relaxed">
                  {{ aiAnalysisResult.section39.reason }}
                </p>
                <div class="mt-4">
                  <p class="text-sm leading-relaxed text-gray-600">
                    {{ aiAnalysisResult.section39.detailedReason }}
                  </p>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="mb-1 text-3xl font-bold tracking-tight">
                {{ aiAnalysisResult.section39.confidence }}%
              </div>
              <div class="text-muted-foreground text-sm font-medium">
                Confidence
              </div>
            </div>
          </div>

          <!-- Section 39 Details Grid -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Rule References -->
            <div class="bg-background rounded-xl border p-6">
              <div class="mb-4 flex items-center space-x-2">
                <div class="h-2 w-2 rounded-full bg-blue-500"></div>
                <span class="text-sm font-semibold">Legal References</span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="rule in aiAnalysisResult.section39.ruleReferences"
                  :key="rule"
                  class="rounded-lg border border-blue-200 bg-blue-50 p-3"
                >
                  <p class="text-sm font-medium text-blue-800">{{ rule }}</p>
                </div>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="bg-background rounded-xl border p-6">
              <div class="mb-4 flex items-center space-x-2">
                <div class="h-2 w-2 rounded-full bg-purple-500"></div>
                <span class="text-sm font-semibold">Recommendations</span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(recommendation, index) in aiAnalysisResult.section39
                    .recommendations"
                  :key="index"
                  class="flex items-start space-x-3 rounded-lg border border-purple-200 bg-purple-50 p-3"
                >
                  <div
                    class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-200 text-xs font-bold text-purple-800"
                  >
                    {{ index + 1 }}
                  </div>
                  <p class="flex-1 text-sm text-purple-800">
                    {{ recommendation }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Analysis Details -->
        <div class="grid gap-6">
          <!-- Enhanced AI Analysis Description -->
          <div class="bg-card rounded-2xl border p-8 shadow-sm">
            <div class="mb-6 flex items-center space-x-3">
              <div
                class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl"
              >
                <svg
                  class="text-primary h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h5 class="text-xl font-bold tracking-tight">
                  AI Analysis Insights
                </h5>
                <p class="text-muted-foreground text-sm">
                  Detailed breakdown and reasoning
                </p>
              </div>
            </div>
            <div class="prose prose-sm max-w-none">
              <p class="text-foreground leading-relaxed">
                {{ aiAnalysisResult.description || aiAnalysisResult.reasoning }}
              </p>
            </div>
          </div>

          <!-- Enhanced Documentation Requirements -->
          <div class="bg-card rounded-2xl border p-8 shadow-sm">
            <div class="mb-6 flex items-center space-x-3">
              <div
                class="bg-foreground/10 flex h-10 w-10 items-center justify-center rounded-xl"
              >
                <svg
                  class="text-foreground h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h5 class="text-xl font-bold tracking-tight">
                  Required Documentation
                </h5>
                <p class="text-muted-foreground text-sm">
                  Supporting documents needed for compliance
                </p>
              </div>
            </div>
            <div class="space-y-4">
              <div
                v-for="(doc, index) in aiAnalysisResult.documentation"
                :key="doc"
                class="bg-background flex items-start space-x-4 rounded-xl border p-4"
              >
                <div class="mt-1 flex-shrink-0">
                  <div
                    class="bg-foreground/20 flex h-6 w-6 items-center justify-center"
                  >
                    <span class="text-foreground text-xs font-bold">{{
                      index + 1
                    }}</span>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-foreground font-medium leading-relaxed">
                    {{ doc }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Alternative Classifications -->
          <div
            v-if="
              aiAnalysisResult.alternatives &&
              aiAnalysisResult.alternatives.length > 0
            "
            class="bg-card rounded-2xl border p-8 shadow-sm"
          >
            <div class="mb-6 flex items-center space-x-3">
              <div
                class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl"
              >
                <svg
                  class="text-primary h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h5 class="text-xl font-bold tracking-tight">
                  Alternative Classifications
                </h5>
                <p class="text-muted-foreground text-sm">
                  Other possible tax treatments to consider
                </p>
              </div>
            </div>
            <div class="grid gap-4">
              <div
                v-for="(alt, index) in aiAnalysisResult.alternatives"
                :key="alt.treatment"
                class="bg-background rounded-xl border p-6 transition-all duration-200 hover:shadow-md"
              >
                <div class="mb-4 flex items-start justify-between">
                  <div class="flex items-center space-x-3">
                    <div
                      class="bg-foreground/10 flex h-8 w-8 items-center justify-center rounded-lg"
                    >
                      <span class="text-foreground text-sm font-bold">{{
                        index + 1
                      }}</span>
                    </div>
                    <h6 class="text-lg font-semibold tracking-tight">
                      {{ alt.treatment }}
                    </h6>
                  </div>
                  <div class="text-right">
                    <div
                      class="bg-primary/10 inline-flex items-center px-3 py-1"
                    >
                      <span class="text-primary text-sm font-bold"
                        >{{ alt.confidence }}%</span
                      >
                    </div>
                    <p class="text-muted-foreground mt-1 text-xs">Confidence</p>
                  </div>
                </div>
                <p class="text-muted-foreground leading-relaxed">
                  {{ alt.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Chat Tab -->
      <div v-else-if="activeTab === 'chat'" class="flex h-[500px] flex-col">
        <!-- Chat Messages Container -->
        <div
          ref="chatContainer"
          class="bg-muted/30 mb-4 flex-1 space-y-6 overflow-y-auto rounded-2xl p-6"
        >
          <div
            v-if="chatMessages.length === 0"
            class="flex h-full flex-col items-center justify-center py-12 text-center"
          >
            <div
              class="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            >
              <svg
                class="text-primary h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 class="mb-2 text-lg font-semibold">Start a Conversation</h3>
            <p class="text-muted-foreground max-w-sm">
              Ask questions about this expense, get clarification on tax rules,
              or discuss alternative treatments.
            </p>
          </div>

          <div
            v-for="message in chatMessages"
            :key="message.id"
            class="flex"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div class="flex max-w-[80%] items-start space-x-3">
              <!-- Avatar for assistant messages -->
              <div
                v-if="message.role === 'assistant'"
                class="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center"
              >
                <svg
                  class="text-primary h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>

              <!-- Message bubble -->
              <div
                class="rounded-2xl px-4 py-3 shadow-sm"
                :class="{
                  'bg-primary text-primary-foreground ml-auto':
                    message.role === 'user',
                  'bg-card border': message.role === 'assistant',
                }"
              >
                <p class="whitespace-pre-wrap text-sm leading-relaxed">
                  {{ message.content }}
                </p>
                <p class="mt-1 text-xs opacity-70">
                  {{ new Date(message.timestamp).toLocaleTimeString() }}
                </p>
              </div>

              <!-- Avatar for user messages -->
              <div
                v-if="message.role === 'user'"
                class="bg-foreground/10 flex h-8 w-8 flex-shrink-0 items-center justify-center"
              >
                <svg
                  class="text-foreground h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Enhanced Streaming Message -->
          <div v-if="streamingContent" class="flex justify-start">
            <div class="flex max-w-[80%] items-start space-x-3">
              <div
                class="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center"
              >
                <svg
                  class="text-primary h-4 w-4 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div class="bg-card rounded-2xl border px-4 py-3 shadow-sm">
                <p class="whitespace-pre-wrap text-sm leading-relaxed">
                  {{ streamingContent }}
                </p>
                <div class="mt-2 flex items-center space-x-1">
                  <div class="bg-primary/60 h-2 w-2 animate-bounce"></div>
                  <div
                    class="bg-primary/60 h-2 w-2 animate-bounce"
                    style="animation-delay: 0.1s"
                  ></div>
                  <div
                    class="bg-primary/60 h-2 w-2 animate-bounce"
                    style="animation-delay: 0.2s"
                  ></div>
                  <span class="text-muted-foreground ml-2 text-xs"
                    >AI is typing...</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Chat Input -->
        <div class="bg-background border-t p-4">
          <div class="flex items-end space-x-3">
            <div class="flex-1">
              <div class="relative">
                <input
                  v-model="currentMessage"
                  type="text"
                  placeholder="Ask the AI about this tax item..."
                  class="bg-background focus:border-primary focus:ring-primary/20 w-full rounded-2xl border px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                  @keyup.enter="sendChatMessage"
                  :disabled="isChatLoading"
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2">
                  <button
                    @click="sendChatMessage"
                    :disabled="!currentMessage.trim() || isChatLoading"
                    class="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20 flex h-8 w-8 items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <SendOutlined class="text-sm" />
                  </button>
                </div>
              </div>
              <p class="text-muted-foreground mt-2 px-1 text-xs">
                Press Enter to send • AI responses are for guidance only
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Recommendations Tab -->
      <div
        v-else-if="activeTab === 'recommendations' && aiAnalysisResult"
        class="space-y-8"
      >
        <div
          v-if="
            aiAnalysisResult.recommendations &&
            aiAnalysisResult.recommendations.length > 0
          "
          class="space-y-6"
        >
          <!-- Recommendations Header -->
          <div class="bg-card rounded-2xl border p-8 shadow-sm">
            <div class="mb-6 flex items-center space-x-3">
              <div
                class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl"
              >
                <svg
                  class="text-primary h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h5 class="text-xl font-bold tracking-tight">
                  AI Recommendations
                </h5>
                <p class="text-muted-foreground text-sm">
                  Actionable insights to optimize your tax position
                </p>
              </div>
            </div>

            <!-- Recommendations Grid -->
            <div class="grid gap-6">
              <div
                v-for="(rec, index) in aiAnalysisResult.recommendations"
                :key="index"
                class="bg-background rounded-xl border p-6 transition-all duration-200 hover:shadow-md"
              >
                <div class="flex items-start space-x-4">
                  <div class="flex-shrink-0">
                    <div
                      class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl"
                    >
                      <span class="text-primary text-sm font-bold">{{
                        index + 1
                      }}</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="mb-3 flex items-start justify-between">
                      <h6 class="text-lg font-semibold tracking-tight">
                        Recommendation {{ index + 1 }}
                      </h6>
                      <div
                        class="bg-foreground/10 inline-flex items-center px-3 py-1"
                      >
                        <svg
                          class="text-foreground mr-1 h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span class="text-foreground text-xs font-medium"
                          >Action Item</span
                        >
                      </div>
                    </div>
                    <p class="text-muted-foreground leading-relaxed">
                      {{ rec }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Empty State -->
        <div
          v-else
          class="bg-card rounded-2xl border p-12 text-center shadow-sm"
        >
          <div class="flex flex-col items-center space-y-4">
            <div
              class="bg-muted/50 flex h-16 w-16 items-center justify-center rounded-2xl"
            >
              <svg
                class="text-muted-foreground h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
            </div>
            <div class="space-y-2">
              <h4 class="text-lg font-semibold">
                No Recommendations Available
              </h4>
              <p class="text-muted-foreground max-w-md">
                The AI analysis didn't generate specific recommendations for
                this item. You can ask questions in the chat tab for more
                guidance.
              </p>
            </div>
            <button
              @click="activeTab = 'chat'"
              class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Ask AI Questions</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Fallback to original analysis if AI fails -->
      <div v-else-if="!isAnalyzing && !aiAnalysisResult" class="space-y-6">
        <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div class="flex items-center">
            <svg
              class="mr-2 h-5 w-5 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
            <p class="text-sm text-yellow-700">
              AI analysis unavailable. Showing basic analysis.
            </p>
          </div>
        </div>

        <!-- Original Static Analysis -->
        <div
          class="rounded-lg border p-4"
          :class="
            getItemAnalysisClass(
              selectedExpense.description || '',
              (selectedExpense.description || '').includes('INCOME') ||
                (selectedExpense.description || '').includes('CLAIM') ||
                (selectedExpense.description || '').includes('SCRAP') ||
                (selectedExpense.description || '').includes('DISPOSAL')
                ? 'income'
                : 'expense',
            )
          "
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span
                class="flex items-center justify-center"
                v-html="
                  getItemTagIcon(
                    selectedExpense.description || '',
                    (selectedExpense.description || '').includes('INCOME') ||
                      (selectedExpense.description || '').includes('CLAIM') ||
                      (selectedExpense.description || '').includes('SCRAP') ||
                      (selectedExpense.description || '').includes('DISPOSAL')
                      ? 'income'
                      : 'expense',
                  )
                "
              ></span>
              <div>
                <h4 class="text-lg font-semibold">
                  {{
                    getItemStatus(
                      selectedExpense.description || '',
                      (selectedExpense.description || '').includes('INCOME') ||
                        (selectedExpense.description || '').includes('CLAIM') ||
                        (selectedExpense.description || '').includes('SCRAP') ||
                        (selectedExpense.description || '').includes('DISPOSAL')
                        ? 'income'
                        : 'expense',
                    )
                      .charAt(0)
                      .toUpperCase() +
                    getItemStatus(
                      selectedExpense.description || '',
                      (selectedExpense.description || '').includes('INCOME') ||
                        (selectedExpense.description || '').includes('CLAIM') ||
                        (selectedExpense.description || '').includes('SCRAP') ||
                        (selectedExpense.description || '').includes('DISPOSAL')
                        ? 'income'
                        : 'expense',
                    ).slice(1)
                  }}
                </h4>
                <p class="text-foreground/60 text-sm">
                  {{
                    getItemRuleName(
                      selectedExpense.description || '',
                      (selectedExpense.description || '').includes('INCOME') ||
                        (selectedExpense.description || '').includes('CLAIM') ||
                        (selectedExpense.description || '').includes('SCRAP') ||
                        (selectedExpense.description || '').includes('DISPOSAL')
                        ? 'income'
                        : 'expense',
                    )
                  }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-foreground/90 text-2xl font-bold">
                {{
                  formatNumber(
                    selectedExpense.value || selectedExpense.amount || 0,
                  )
                }}
              </div>
              <div class="text-foreground/50 text-sm">Amount</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="bg-background border-t px-8 py-6">
        <div
          class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
        >
          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3">
            <button
              v-if="activeTab === 'chat' && chatMessages.length > 0"
              @click="chatMessages = []"
              class="bg-background hover:bg-muted/50 focus:ring-primary/20 inline-flex items-center space-x-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
              <span>Clear Chat</span>
            </button>

            <button
              v-if="aiAnalysisResult"
              @click="exportAnalysis"
              class="bg-background hover:bg-muted/50 focus:ring-primary/20 inline-flex items-center space-x-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <span>Export Analysis</span>
            </button>

            <button
              v-if="aiAnalysisResult"
              @click="regenerateAnalysis"
              :disabled="isAnalyzing"
              class="bg-background hover:bg-muted/50 focus:ring-primary/20 inline-flex items-center space-x-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                class="h-4 w-4"
                :class="{ 'animate-spin': isAnalyzing }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              <span>{{
                isAnalyzing ? 'Analyzing...' : 'Regenerate Analysis'
              }}</span>
            </button>
          </div>

          <!-- Close Button -->
          <button
            @click="closeAnalysisModal"
            class="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20 inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </template>
  </AnalysisModal>
</template>

<style scoped>
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.space-x-1 > * + * {
  margin-left: 0.25rem;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-colors {
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
