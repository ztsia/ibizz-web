<template>
  <GenericFormModal>
    <!-- Custom Title Slot -->
    <template #title>
      <div class="flex w-full flex-col pr-12">
        <div class="flex w-full items-center justify-between">
          <span>{{ template?.formName || 'Generic Form' }}</span>
        </div>
        <!-- Manual Tab Navigator -->
        <div
          v-if="pages.length > 1"
          class="bg-muted mt-4 grid w-full grid-cols-4 rounded-md p-1"
        >
          <button
            v-for="page in pages"
            :key="page.id"
            @click="currentTab = page.id"
            :class="[
              'ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              currentTab === page.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background',
            ]"
          >
            {{ page.title }}
          </button>
        </div>
      </div>
    </template>

    <!-- Main Content (default slot) -->
    <!-- Loading/Error States -->
    <div v-if="loading" class="flex h-96 items-center justify-center">
      <VbenSpinner class="h-8 w-8" />
    </div>
    <div v-else-if="error" class="p-4">
      <div
        class="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4"
      >
        {{ error }}
      </div>
    </div>

    <!-- Main Modal Layout (when data is loaded) -->
    <div v-else-if="template">
      <!-- Manually controlled tab content -->
      <div v-for="page in pages" :key="page.id">
        <div v-if="currentTab === page.id">
          <CardPage
            :page="page"
            :form-data="formData"
            :is-edit-mode="true"
            :errors="errors"
            :is-form-valid="isFormValid"
            @update:field="updateField"
          />
        </div>
      </div>
    </div>

    <!-- Custom Footer Slot -->
    <template #footer>
      <div class="flex w-full items-center justify-end">
        <div>
          <FormActionsBar
            :disabled="!hasChanges"
            @save="onSave"
            @cancel="handleCancelAndClose"
          />
        </div>
      </div>
    </template>
  </GenericFormModal>
</template>

<script lang="ts" setup>
import { ref, computed, provide } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';
import {
  getFormTemplate,
  saveFormSubmission,
} from '../../services/generic_form_service';
import type { FormTemplate, FormSubmission } from '../types';
// @ts-ignore
import { CardPage } from '../components';
import FormActionsBar from '../../shared_components/FormActionsBar.vue';
import { useFormValidation, useVisibleFields } from '../composables';
import { VbenSpinner } from '@vben-core/shadcn-ui';

const emit = defineEmits<{
  (e: 'save', payload: any): void;
}>();

// Modal setup
const [GenericFormModal, modalApi] = useVbenModal({
  title: 'Generic Form', // Fallback title
  showConfirmButton: false,
  width: '90%',
  class: 'generic-form-modal',
});

// Component state
const template = ref<FormTemplate | null>(null);
const formData = ref<Record<string, any>>({});
const originalFormData = ref<Record<string, any>>({});
const loading = ref(true);
const error = ref<string | null>(null);
const currentTab = ref<string>('');
const currentFormId = ref<string | null>(null);

// Composables
const { visibleFieldIds } = useVisibleFields(template, formData);
const { errors, validate } = useFormValidation(
  template,
  formData,
  visibleFieldIds,
);

// Computed properties
const isFormValid = computed(() => {
  validate();
  return Object.keys(errors.value).length === 0;
});

const pages = computed(() => {
  if (!template.value || !template.value.pages) return [];
  return template.value.pages;
});

const hasChanges = computed(() => {
  const getSortedStringify = (obj: any) => {
    if (!obj) return '';
    const sortedObj: Record<string, any> = {};
    for (const key of Object.keys(obj).sort()) {
      sortedObj[key] = obj[key];
    }
    return JSON.stringify(sortedObj);
  };
  return (
    getSortedStringify(formData.value) !==
    getSortedStringify(originalFormData.value)
  );
});

// Provide submissionYear to all descendant components
provide(
  'submissionYear',
  computed(() => template.value?.yearOfAssessment || new Date().getFullYear()),
);

// Methods
const load = async (formId: string) => {
  loading.value = true;
  error.value = null;
  try {
    const tmpl = await getFormTemplate(formId);
    template.value = tmpl;

    // Initialize form data with default values
    const initialData: Record<string, any> = {};

    // Helper to traverse and set defaults
    tmpl.pages?.forEach((page) => {
      page.sections?.forEach((section) => {
        section.fields?.forEach((field) => {
          if (field.defaultValue !== undefined) {
            initialData[field.id] = field.defaultValue;
          }
        });
      });
    });

    // Ensure year is set if not already (using yearOfAssessment as fallback or override)
    if (tmpl.yearOfAssessment) {
      // If there's a field named 'year', ensure it matches yearOfAssessment
      initialData.year = String(tmpl.yearOfAssessment);
    }

    formData.value = initialData;
    // eslint-disable-next-line unicorn/prefer-structured-clone
    originalFormData.value = JSON.parse(JSON.stringify(initialData));

    if (pages.value.length > 0) {
      currentTab.value = pages.value[0].id;
    }
  } catch (error_: any) {
    error.value = error_.message || 'Failed to load form template.';
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};

const open = async (formId: string) => {
  currentFormId.value = formId;
  await load(formId);
  modalApi.open();
};

const updateField = ({ fieldId, value }: { fieldId: string; value: any }) => {
  formData.value[fieldId] = value;
  validate();
};

const handleCancelAndClose = () => {
  // eslint-disable-next-line unicorn/prefer-structured-clone
  formData.value = JSON.parse(JSON.stringify(originalFormData.value));
  message.info('Changes cancelled.');
  modalApi.close();
};

const onSave = async () => {
  if (!validate()) {
    message.error('Please fix the validation errors before saving.');
    return;
  }
  if (!template.value) return;

  try {
    const submissionToSave: FormSubmission = {
      submissionId: '', // New submission
      templateId: template.value._id || template.value.id || '',
      year: template.value.yearOfAssessment,
      data: formData.value,
      updated_at: new Date().toISOString(),
    };
    const savedSubmission = await saveFormSubmission(submissionToSave);

    // eslint-disable-next-line unicorn/prefer-structured-clone
    formData.value = JSON.parse(JSON.stringify(savedSubmission.data));
    // eslint-disable-next-line unicorn/prefer-structured-clone
    originalFormData.value = JSON.parse(JSON.stringify(savedSubmission.data));

    message.success('Form saved successfully!');
    emit('save', savedSubmission.data);
    modalApi.close();
  } catch (error_: any) {
    message.error(error_.message || 'Failed to save form.');
  }
};

// Expose open method
defineExpose({ open });
</script>
