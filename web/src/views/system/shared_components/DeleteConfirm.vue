<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div
      v-if="visible"
      class="z-overlay fixed inset-0 bg-black/80"
      @click="onCancel"
    ></div>

    <!-- Modal Content -->
    <div
      v-if="visible"
      class="z-popup bg-background fixed left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 p-6 shadow-lg outline-none sm:max-w-[520px] sm:rounded-xl"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex flex-col gap-y-1.5 text-center sm:text-left">
        <h2 class="text-lg font-semibold leading-none tracking-tight">
          {{ title }}
        </h2>
        <p class="text-muted-foreground text-sm">
          {{ message }}
        </p>
      </div>
      <div v-if="targetLabel" class="py-4">
        <p class="font-bold">{{ targetLabel }}</p>
      </div>
      <div
        class="flex flex-col-reverse justify-end gap-x-2 sm:flex-row sm:justify-end sm:space-x-2"
      >
        <Button variant="ghost" @click="onCancel">Cancel</Button>
        <Button variant="destructive" @click="onConfirm">Delete</Button>
      </div>
      <button
        type="button"
        class="data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-accent hover:text-accent-foreground text-foreground flex-center absolute right-3 top-3 h-6 w-6 rounded-full px-1 text-lg opacity-70 opacity-80 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        @click="onCancel"
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
import { computed } from 'vue'; // Add Teleport import
import { Button } from '@vben-core/shadcn-ui';

const props = defineProps<{
  modelValue?: boolean;
  title?: string;
  message?: string;
  targetLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

/**
 * Confirm the delete action.
 *
 * Behaviour:
 * - Emits the `confirm` event to notify the parent.
 * - Closes the modal by updating the v-model.
 */
function onConfirm() {
  emit('confirm');
  visible.value = false;
}

/**
 * Cancel the delete action.
 *
 * Behaviour:
 * - Emits the `cancel` event to notify the parent.
 * - Closes the modal by updating the v-model.
 */
function onCancel() {
  emit('cancel');
  visible.value = false;
}
</script>
