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
      <div class="flex w-full items-center justify-between">
        <GeneratePdfControl
          v-if="pdfTemplateName"
          :template="pdfTemplateName"
          :data-provider="providePdfData"
          :file-name="pdfFileName"
        />
        <Button type="button" variant="outline" @click="onClose" class="mt-4"
          >Close</Button
        >
      </div>
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
import GeneratePdfControl from './GeneratePdfControl.vue';
import { formatNumber } from '../../lookup/utils';

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

const getDisplayValue = (fieldId: string, value: any) => {
  if (!template.value || value === undefined || value === null) {
    return value;
  }

  for (const page of template.value.pages) {
    for (const section of page.sections) {
      const field = section.fields.find((f) => f.id === fieldId);
      if (
        field &&
        (field.inputType === 'select' || field.inputType === 'radio')
      ) {
        const option = field.options?.find((o) => o.value === value);
        return option ? option.label : value;
      }
    }
  }
  return value;
};

const pdfTemplateName = computed(() => {
  switch (pageId.value) {
    case 'page_cp204': {
      return 'cp204-template';
    }
    case 'page_cp204a': {
      return 'cp204a-template';
    }
    case 'page_cp204b': {
      return 'cp204b-template';
    }
    default: {
      return null;
    }
  }
});

const pdfData = computed(() => {
  const data: Record<string, any> = {};
  if (!template.value) return data;

  // Find the current page's fields
  const currentPage = template.value.pages.find((p) => p.id === pageId.value);
  if (!currentPage) return data;

  const allFields = currentPage.sections
    .flatMap((s) => s.fields)
    .filter((f) => f.inputType !== 'placeholder' && !f.id.endsWith('_toggle'));

  for (const field of allFields) {
    const rawValue = formData.value[field.id];
    if (field.inputType === 'boolean') {
      // For PDF, send 'checked' if true, otherwise omit
      if (rawValue) {
        data[`${field.id}_checked`] = 'checked';
      }
    } else if (field.inputType === 'currency' || field.inputType === 'number') {
      data[field.id] = formatNumber(rawValue);
    } else {
      data[field.id] = getDisplayValue(field.id, rawValue) || '';
    }
  }
  return data;
});

const pdfFileName = computed(() => {
  const year = template.value?.yearOfAssessment || new Date().getFullYear();
  const title = pageTitle.value.replaceAll(' ', '_');
  return `${title}_${year}.pdf`;
});

async function providePdfData(): Promise<Record<string, any>> {
  return pdfData.value;
}

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
