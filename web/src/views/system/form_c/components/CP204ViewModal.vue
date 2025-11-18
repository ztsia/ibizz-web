<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 bg-black/80"
      @click="onClose"
    ></div>

    <!-- Modal Content -->
    <div
      v-if="modelValue"
      class="bg-background fixed left-1/2 top-1/2 z-[60] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 p-6 shadow-lg outline-none sm:rounded-xl"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex flex-col gap-y-1.5 text-center sm:text-left">
        <h2 class="text-lg font-semibold leading-none tracking-tight">
          View Form: {{ pageTitle }}
        </h2>
        <p class="text-muted-foreground text-sm">
          This is a read-only view of the form data.
        </p>
      </div>

      <div class="max-h-[70vh] overflow-y-auto p-4">
        <CP204PrintTemplate
          v-if="pageId === 'page_cp204'"
          :form-data="formData"
        />
        <CP204APrintTemplate
          v-else-if="pageId === 'page_cp204a'"
          :form-data="formData"
        />
        <CP204BPrintTemplate
          v-else-if="pageId === 'page_cp204b'"
          :form-data="formData"
        />
        <div v-else class="text-muted-foreground text-center">
          No print template available for this page.
        </div>
      </div>

      <div
        class="flex flex-col-reverse justify-end gap-x-2 sm:flex-row sm:justify-end sm:space-x-2"
      >
        <Button type="button" variant="outline" @click="onClose">Close</Button>
      </div>

      <button
        type="button"
        class="data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-accent hover:text-accent-foreground text-foreground flex-center absolute right-3 top-3 h-6 w-6 rounded-full px-1 text-lg opacity-70 opacity-80 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
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
import { computed } from 'vue';
import { Button } from '@vben-core/shadcn-ui';
import {
  CP204PrintTemplate,
  CP204APrintTemplate,
  CP204BPrintTemplate,
} from '../print_templates';

const props = defineProps<{
  modelValue: boolean;
  formData: Record<string, any>;
  pageId: string | null;
}>();

const emit = defineEmits(['update:modelValue']);

const pageTitle = computed(() => {
  switch (props.pageId) {
    case 'page_cp204': {
      return 'CP204 - Estimation of Tax Payable';
    }
    case 'page_cp204a': {
      return 'CP204A - Revision of Estimation';
    }
    case 'page_cp204b': {
      return 'CP204B - Notification of Non-Chargeability';
    }
    default: {
      return 'Unknown Form';
    }
  }
});

const onClose = () => {
  emit('update:modelValue', false);
};
</script>
