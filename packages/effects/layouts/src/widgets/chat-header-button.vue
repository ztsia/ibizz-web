<script setup lang="ts">
import { ref } from 'vue';

import { LucideBotMessageSquare } from '@vben/icons';

import { VbenButton } from '@vben-core/shadcn-ui';

defineOptions({
  name: 'ChatHeaderButton',
});

const emit = defineEmits<{
  toggleChat: [isOpen: boolean];
}>();

// Local state for chat widget
const isChatOpen = ref(false);

// Expose the chat state and toggle function
defineExpose({
  isChatOpen,
  toggleChat: () => {
    isChatOpen.value = !isChatOpen.value;
  },
});

function handleClick() {
  isChatOpen.value = !isChatOpen.value;
  emit('toggleChat', isChatOpen.value);
}
</script>

<template>
  <VbenButton
    class="mr-1 transition-all duration-200"
    :class="[
      {
        'bg-primary/10 text-primary': isChatOpen,
        'hover:bg-primary/5': !isChatOpen,
      },
    ]"
    size="sm"
    variant="ghost"
    @click="handleClick"
  >
    <LucideBotMessageSquare class="mr-2 h-4 w-4" />
    <span class="hidden sm:inline">AI Assistant</span>
    <span class="sm:hidden">AI</span>
  </VbenButton>
</template>
