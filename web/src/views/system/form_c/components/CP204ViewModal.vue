<template>
  <ViewModal>
    <template #title>
      <div class="flex flex-col gap-y-1.5 text-center sm:text-left">
        <h2 class="text-lg font-semibold leading-none tracking-tight">
          View Form: {{ pageTitle }}
        </h2>
        <p class="text-muted-foreground text-sm">
          This is a read-only view of the form data.
        </p>
      </div>
    </template>

    <div class="mx-auto max-w-3xl">
      <CP204PrintTemplate
        v-if="pageId === 'page_cp204'"
        :form-data="formData"
        :template="template"
      />
      <CP204APrintTemplate
        v-else-if="pageId === 'page_cp204a'"
        :form-data="formData"
        :template="template"
      />
      <CP204BPrintTemplate
        v-else-if="pageId === 'page_cp204b'"
        :form-data="formData"
        :template="template"
      />
      <div v-else class="text-muted-foreground text-center">
        No print template available for this page.
      </div>
    </div>

    <template #footer>
      <Button type="button" variant="outline" @click="onClose">Close</Button>
    </template>
  </ViewModal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { Button } from '@vben-core/shadcn-ui';
import type { FormTemplate } from '../types';
import {
  CP204PrintTemplate,
  CP204APrintTemplate,
  CP204BPrintTemplate,
} from '../print_templates';

// Internal state for the modal content
const formData = ref<Record<string, any>>({});
const pageId = ref<string | null>(null);
const template = ref<FormTemplate | null>(null);

// VbenModal setup
const [ViewModal, viewModalApi] = useVbenModal({
  // The title is set dynamically in the #title slot
  showConfirmButton: false, // We use a custom footer
  width: '900px',
});

const pageTitle = computed(() => {
  switch (pageId.value) {
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
  viewModalApi.close();
};

const open = (data: Record<string, any>, id: string, tmpl: FormTemplate) => {
  formData.value = data;
  pageId.value = id;
  template.value = tmpl;
  viewModalApi.open();
};

// Expose the open method to the parent component
defineExpose({ open });
</script>
