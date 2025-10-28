<template>
  <div class="space-y-4">
    <!-- Modal Header -->
    <div class="flex items-center gap-4">
      <div class="bg-primary/10 rounded-2xl p-4">
        <Bot class="text-primary h-6 w-6" />
      </div>
      <div>
        <h3 class="text-primary text-2xl font-bold">
          {{ isEditMode ? 'Edit Agent' : 'View Agent' }}
        </h3>
        <p class="text-foreground/60 text-base">
          {{
            selectedAgent?.name || 'Configure AI agent settings and behavior'
          }}
        </p>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="border-foreground/10 border-b">
      <nav class="flex space-x-10">
        <button
          @click="$emit('update:activeTab', 'configuration')"
          :class="[
            'flex items-center gap-3 border-b-2 pb-4 text-base font-semibold transition-colors',
            activeTab === 'configuration'
              ? 'border-primary text-primary'
              : 'text-foreground/60 hover:text-foreground border-transparent',
          ]"
        >
          <Settings class="h-5 w-5" />
          Configuration
        </button>
        <button
          v-if="isEditMode"
          @click="$emit('update:activeTab', 'testing')"
          :class="[
            'flex items-center gap-3 border-b-2 pb-4 text-base font-semibold transition-colors',
            activeTab === 'testing'
              ? 'border-primary text-primary'
              : 'text-foreground/60 hover:text-foreground border-transparent',
          ]"
        >
          <MessageCircle class="h-5 w-5" />
          Testing
          <span
            v-if="chatMessagesCount > 0"
            class="bg-primary rounded-full px-2.5 py-1 text-xs font-medium text-white"
          >
            {{ chatMessagesCount }}
          </span>
        </button>
        <button
          @click="$emit('update:activeTab', 'settings')"
          :class="[
            'flex items-center gap-3 border-b-2 pb-4 text-base font-semibold transition-colors',
            activeTab === 'settings'
              ? 'border-primary text-primary'
              : 'text-foreground/60 hover:text-foreground border-transparent',
          ]"
        >
          <Zap class="h-5 w-5" />
          Model Settings
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot, Settings, MessageCircle, Zap } from 'lucide-vue-next';
import type { Agent } from '#/api/configuration/agents';

interface Props {
  selectedAgent: Agent | null;
  isEditMode: boolean;
  activeTab: 'configuration' | 'testing' | 'settings';
  chatMessagesCount: number;
}

defineProps<Props>();

defineEmits<{
  'update:activeTab': [tab: 'configuration' | 'testing' | 'settings'];
}>();
</script>
