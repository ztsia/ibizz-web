<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div
      v-if="visible"
      class="z-overlay fixed inset-0 bg-black/80"
      @click="onClose"
    ></div>

    <!-- Modal Content -->
    <div
      v-if="visible"
      class="z-popup bg-background fixed left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 p-6 shadow-lg outline-none sm:max-w-[600px] sm:rounded-xl"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex flex-col gap-y-1.5 text-center sm:text-left">
        <h2 class="text-lg font-semibold leading-none tracking-tight">
          Test Modal
        </h2>
        <p class="text-muted-foreground text-sm">
          This is a simple test modal to check custom modal behavior.
        </p>
      </div>
      <div class="p-4">
        <p>If you see this, the custom modal is rendering!</p>
        <p>Check your console for messages.</p>
      </div>
      <div
        class="flex flex-col-reverse justify-end gap-x-2 sm:flex-row sm:justify-end sm:space-x-2"
      >
        <button
          type="button"
          class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          @click="onClose"
        >
          Close Test Modal
        </button>
      </div>
      <button
        type="button"
        class="data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-accent hover:text-accent-foreground text-foreground/80 flex-center absolute right-3 top-3 h-6 w-6 rounded-full px-1 text-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        @click="onClose"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-x-icon lucide-x h-4 w-4"
        >
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue'; // Import Teleport

const props = defineProps<{
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'close'): void;
}>();

const visible = computed({
  get: () => {
    return props.modelValue;
  },
  set: (value) => {
    emit('update:modelValue', value);
  },
});

onMounted(() => {});

onUnmounted(() => {});

function onClose() {
  visible.value = false;
}
</script>
