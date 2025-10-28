<template>
  <div class="space-y-6">
    <!-- Chat Interface -->
    <div class="bg-card border-foreground/5 overflow-hidden rounded-2xl border">
      <!-- Chat Messages -->
      <div
        ref="chatContainer"
        class="bg-foreground/5 h-96 space-y-6 overflow-y-auto p-6"
      >
        <div v-if="chatMessages.length === 0" class="py-16 text-center">
          <div class="bg-primary/10 mx-auto mb-6 h-20 w-20 rounded-2xl p-6">
            <MessageCircle class="text-primary h-8 w-8" />
          </div>
          <p class="text-foreground/60 text-base">
            Start a conversation to test the agent
          </p>
        </div>

        <div
          v-for="message in chatMessages"
          :key="message.id"
          :class="[
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start',
          ]"
        >
          <div
            :class="[
              'max-w-sm rounded-2xl px-5 py-4 lg:max-w-lg',
              message.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-card border-foreground/10 border',
            ]"
          >
            <div class="mb-3 flex items-center gap-3">
              <component
                :is="message.role === 'user' ? User : Bot"
                class="h-5 w-5"
              />
              <span class="text-sm font-semibold opacity-75">
                {{
                  message.role === 'user'
                    ? 'You'
                    : selectedAgent?.name || 'Agent'
                }}
              </span>
            </div>
            <p class="text-sm leading-relaxed">{{ message.content }}</p>
          </div>
        </div>

        <!-- Streaming Message -->
        <div v-if="streamingContent" class="flex justify-start">
          <div
            class="bg-card border-foreground/20 max-w-xs rounded-xl border px-4 py-3 lg:max-w-md"
          >
            <div class="mb-2 flex items-center gap-2">
              <Bot class="h-4 w-4" />
              <span class="text-xs font-medium opacity-75">{{
                selectedAgent?.name || 'Agent'
              }}</span>
            </div>
            <p class="text-sm leading-relaxed">{{ streamingContent }}</p>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="bg-card border-foreground/10 border-t p-6">
        <div class="flex gap-4">
          <input
            :value="currentMessage"
            @input="$emit('update:currentMessage', $event.target.value)"
            @keyup.enter="$emit('sendMessage')"
            type="text"
            placeholder="Type a message to test the agent..."
            :disabled="isChatLoading"
            class="bg-card border-foreground/20 text-foreground placeholder-foreground/50 focus:border-primary flex-1 rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0 disabled:opacity-50"
          />
          <button
            @click="$emit('sendMessage')"
            :disabled="!currentMessage.trim() || isChatLoading"
            class="bg-primary hover:bg-primary/90 flex items-center gap-3 rounded-xl px-6 py-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send class="h-5 w-5" />
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { MessageCircle, Bot, User, Send } from 'lucide-vue-next';
import type { Agent } from '#/api/configuration/agents';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Props {
  selectedAgent: Agent | null;
  chatMessages: ChatMessage[];
  currentMessage: string;
  isChatLoading: boolean;
  streamingContent: string;
}

const props = defineProps<Props>();

const _emit = defineEmits<{
  'update:currentMessage': [message: string];
  sendMessage: [];
}>();

const chatContainer = ref<HTMLElement | null>(null);

// Auto-scroll to bottom when new messages are added
watch(
  () => props.chatMessages,
  async () => {
    await nextTick();
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  },
  { deep: true },
);

// Expose the chat container ref for parent component access
defineExpose({
  chatContainer,
});
</script>
