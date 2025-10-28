<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

import { CornerDownLeft, LucideBotMessageSquare, X } from '@vben/icons';
import { useChatStore } from '@vben/stores';

import { VbenButton } from '@vben-core/shadcn-ui';

import { storeToRefs } from 'pinia';

interface ChatMessage {
  content: string;
  id: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'guidance' | 'normal' | 'welcome' | 'workflow';
}

// Use chat store for state management
const chatStore = useChatStore();
const { isChatOpen, isChatMinimized, messages, isTyping, unreadCount } =
  storeToRefs(chatStore);

const toggleChat = () => {
  chatStore.toggleChat();
};

const toggleMinimize = () => {
  chatStore.toggleMinimize();
};

const closeChat = () => {
  chatStore.closeChat();
};

// Expose functions for external use
defineExpose({
  toggleChat,
  toggleMinimize,
  closeChat,
  isChatOpen,
  isChatMinimized,
});

const message = ref('');
// Initialize chat store
chatStore.initializeChat();
const chatContainer = ref<HTMLElement>();

// Watch for chat opening to scroll to bottom
watch(isChatOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      scrollToBottom();
    });
  }
});

// Watch for new messages to auto-scroll
watch(
  messages,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  },
  { deep: true },
);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!message.value.trim()) return;

  // Add user message to store
  chatStore.addMessage({
    content: message.value,
    isUser: true,
    type: 'normal',
  });

  const userInput = message.value;
  message.value = '';

  await scrollToBottom();

  // Simulate AI typing
  chatStore.setTyping(true);

  // Simulate AI response delay
  setTimeout(
    () => {
      // Add AI response to store
      chatStore.addMessage({
        content: generateAIResponse(userInput),
        isUser: false,
        type: 'normal',
      });

      chatStore.setTyping(false);
      scrollToBottom();
    },
    1000 + Math.random() * 2000,
  );
};

const generateAIResponse = (input: string): string => {
  const lowerInput = input.toLowerCase();
  const currentContext = chatStore.currentPageContext;

  // Tax filing specific responses
  if (
    currentContext === 'tax-filing-create' ||
    lowerInput.includes('tax') ||
    lowerInput.includes('filing')
  ) {
    if (
      lowerInput.includes('document') ||
      lowerInput.includes('file') ||
      lowerInput.includes('upload')
    ) {
      return "📄 **Document Requirements for Tax Filing:**\n\n**Individual Filing:**\n• W-2 forms from employers\n• 1099 forms (interest, dividends, etc.)\n• Receipts for deductions\n• Previous year's tax return\n\n**Business Filing:**\n• Profit & Loss statements\n• Balance sheets\n• Expense receipts\n• Payroll records\n\nMake sure all documents are clear and legible before uploading!";
    }

    if (
      lowerInput.includes('type') ||
      lowerInput.includes('individual') ||
      lowerInput.includes('corporate')
    ) {
      return "🏢 **Filing Types Explained:**\n\n**Individual (1040):** For personal income tax\n**Corporate (1120):** For C-corporations\n**Partnership (1065):** For business partnerships\n**S-Corp (1120S):** For S-corporations\n\nChoose based on your client's business structure. Need help determining the right type?";
    }

    if (
      lowerInput.includes('deadline') ||
      lowerInput.includes('when') ||
      lowerInput.includes('due')
    ) {
      return '⏰ **Important Tax Deadlines:**\n\n**Individual Returns:** April 15th\n**Corporate Returns:** March 15th (C-Corp) / March 15th (S-Corp)\n**Partnership Returns:** March 15th\n**Extensions:** Available for 6 months\n\n💡 **Tip:** File early to avoid last-minute issues!';
    }
  }

  // Workflow specific responses
  if (
    currentContext === 'tax-filing-workflow' ||
    lowerInput.includes('workflow') ||
    lowerInput.includes('step')
  ) {
    if (lowerInput.includes('next') || lowerInput.includes('continue')) {
      return '➡️ **Next Steps in Your Workflow:**\n\n1. **Review** all uploaded documents\n2. **Verify** extracted data accuracy\n3. **Complete** any missing information\n4. **Preview** the final return\n5. **Submit** for processing\n\nWhich step would you like help with?';
    }

    if (lowerInput.includes('review') || lowerInput.includes('check')) {
      return '🔍 **Review Checklist:**\n\n✅ All required documents uploaded\n✅ Client information accurate\n✅ Income amounts verified\n✅ Deductions properly categorized\n✅ Tax calculations reviewed\n\nDouble-check everything before final submission!';
    }
  }

  // General help responses
  if (lowerInput.includes('help') || lowerInput.includes('how')) {
    return "🤝 **I'm here to help!** I can assist you with:\n\n• **Tax Filing Guidance** - Step-by-step process\n• **Document Requirements** - What you need\n• **Form Completion** - Tips and best practices\n• **Workflow Navigation** - Moving through steps\n• **Troubleshooting** - Solving issues\n\nWhat specifically would you like help with?";
  }

  if (lowerInput.includes('navigation') || lowerInput.includes('menu')) {
    return '🧭 **Navigation Help:**\n\nUse the sidebar menu to access:\n• **Dashboard** - Overview and metrics\n• **Tax Filing** - Create and manage filings\n• **Clients** - Client management\n• **Reports** - Analytics and reports\n\nNeed help finding a specific feature?';
  }

  if (
    lowerInput.includes('error') ||
    lowerInput.includes('problem') ||
    lowerInput.includes('issue')
  ) {
    return '🔧 **Troubleshooting Assistant:**\n\nI can help resolve issues! Please tell me:\n• What were you trying to do?\n• What error message did you see?\n• When did the problem occur?\n\nWith these details, I can provide specific solutions!';
  }

  // Default responses
  const contextualResponses = [
    "💡 I'm here to make your tax filing process smoother! What would you like to know?",
    '🎯 Great question! I can help you navigate through any part of the tax filing workflow.',
    "📋 I'd be happy to assist you with that. What specific aspect of tax filing can I help with?",
    '⚡ Let me help you get this done efficiently! What do you need guidance on?',
    "🚀 I'm your AI assistant for tax filing success! How can I support you today?",
  ];

  return contextualResponses[
    Math.floor(Math.random() * contextualResponses.length)
  ];
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};
</script>

<template>
  <!-- Chat Widget Panel -->
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 scale-90 translate-y-8"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-90 translate-y-8"
  >
    <div
      v-if="isChatOpen"
      class="fixed bottom-10 right-6 z-50 max-h-[calc(100vh-8rem)]"
    >
      <div
        class="bg-background/95 border-border/50 flex h-[min(700px,calc(100vh-10rem))] w-[28rem] max-w-[calc(100vw-3rem)] flex-col rounded-2xl border shadow-2xl ring-1 ring-black/5 backdrop-blur-xl"
      >
        <!-- Chat Header -->
        <div
          class="border-border/30 from-primary/5 to-primary/10 flex items-center justify-between rounded-t-2xl border-b bg-gradient-to-r p-5"
        >
          <div class="flex items-center space-x-3">
            <div
              class="from-primary to-primary/80 ring-primary/20 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br shadow-lg ring-2"
            >
              <LucideBotMessageSquare class="h-5 w-5 " />
            </div>
            <div>
              <h3 class="text-foreground text-base font-bold">AI Assistant</h3>
              <div class="flex items-center space-x-1">
                <div
                  class="h-2 w-2 animate-pulse rounded-full bg-green-500"
                ></div>
                <p class="text-muted-foreground text-xs font-medium">
                  Online & Ready
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center">
            <button
              class="text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:bg-red-50 hover:text-red-500"
              @click="closeChat"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Chat Content -->
        <div
          v-if="!isChatMinimized"
          class="from-background/50 to-background flex flex-1 flex-col bg-gradient-to-b"
        >
          <!-- Messages Container -->
          <div
            ref="chatContainer"
            class="max-h-[500px] flex-1 space-y-4 overflow-y-auto p-6"
          >
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="animate-in slide-in-from-bottom-2 flex duration-300"
              :class="[msg.isUser ? 'justify-end' : 'justify-start']"
            >
              <div
                class="flex max-w-[85%] items-end space-x-2"
                :class="[
                  msg.isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row',
                ]"
              >
                <!-- Avatar -->
                <div
                  v-if="!msg.isUser"
                  class="from-primary/20 to-primary/10 ring-primary/20 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ring-1"
                >
                  <LucideBotMessageSquare class="text-primary h-4 w-4" />
                </div>
                <div
                  v-else
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white"
                >
                  You
                </div>

                <!-- Message Bubble -->
                <div
                  class="rounded-2xl px-4 py-3 text-sm shadow-sm"
                  :class="[
                    msg.isUser
                      ? 'from-primary to-primary/90 text-primary-foreground rounded-br-md bg-gradient-to-br'
                      : 'border-border/50 text-foreground rounded-bl-md border ',
                  ]"
                >
                  <p class="whitespace-pre-wrap leading-relaxed">
                    {{ msg.content }}
                  </p>
                  <p
                    class="mt-2 text-xs opacity-60"
                    :class="[msg.isUser ? 'text-right' : 'text-left']"
                  >
                    {{ formatTime(msg.timestamp) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div
              v-if="isTyping"
              class="animate-in slide-in-from-bottom-2 flex justify-start duration-300"
            >
              <div class="flex max-w-[85%] items-end space-x-2">
                <!-- AI Avatar -->
                <div
                  class="from-primary/20 to-primary/10 ring-primary/20 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ring-1"
                >
                  <LucideBotMessageSquare class="text-primary h-4 w-4" />
                </div>

                <!-- Typing Bubble -->
                <div
                  class="border-border/50 text-foreground rounded-2xl rounded-bl-md border bg-white px-4 py-3 shadow-sm"
                >
                  <div class="flex items-center space-x-1">
                    <span class="text-muted-foreground mr-2 text-xs">
                      AI is typing
                    </span>
                    <div class="flex space-x-1">
                      <div
                        class="bg-primary/60 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"
                      ></div>
                      <div
                        class="bg-primary/60 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"
                      ></div>
                      <div
                        class="bg-primary/60 h-2 w-2 animate-bounce rounded-full"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div
            class="border-border/30 from-background/80 to-background border-t bg-gradient-to-r p-5"
          >
            <div class="flex items-end space-x-3">
              <textarea
                v-model="message"
                class="border-input/50 bg-background/80 text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 focus:bg-background min-h-[2.75rem] w-full flex-1 resize-none rounded-xl border px-4 py-3 text-sm backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2"
                placeholder="Type your message..."
                rows="2"
                @keydown="handleKeyPress"
              ></textarea>
              <VbenButton
                :disabled="!message.trim() || isTyping"
                size="sm"
                class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                @click="sendMessage"
              >
                <CornerDownLeft class="h-4 w-4" />
              </VbenButton>
            </div>
            <div class="mt-2 text-center">
              <p class="text-muted-foreground text-xs">
                Press Enter to send • Shift+Enter for new line
              </p>
              <p class="text-muted-foreground text-xs">
                AI Assistant • Powered by Advanced AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Enhanced animations */
@keyframes slide-in-from-bottom-2 {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--primary) / 30%);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary) / 50%);
}

.animate-in {
  animation-fill-mode: both;
}

.slide-in-from-bottom-2 {
  animation-name: slide-in-from-bottom-2;
}

.duration-300 {
  animation-duration: 300ms;
}

/* Backdrop blur support */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Custom scrollbar for chat container */
</style>
