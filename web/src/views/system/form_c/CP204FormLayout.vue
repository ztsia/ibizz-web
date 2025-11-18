<template>
  <div v-if="loading" class="flex min-h-screen items-center justify-center">
    <VbenSpinner class="h-8 w-8" />
  </div>
  <div v-else-if="error" class="p-4">
    <div
      class="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4"
    >
      {{ error }}
    </div>
  </div>
  <div v-else-if="template" class="mx-auto max-w-5xl p-6">
    <!-- Header with title -->
    <div class="mb-6 flex items-center justify-between border-b pb-4">
      <h1 class="text-3xl font-bold">{{ template.formName }}</h1>
    </div>

    <!-- Tabs Navigation -->
    <Tabs v-model="currentTab" class="w-full">
      <TabsList class="mb-6 grid w-full grid-cols-4">
        <TabsTrigger v-for="page in pages" :key="page.id" :value="page.id">
          {{ page.title }}
        </TabsTrigger>
      </TabsList>

      <!-- Tab Content -->
      <TabsContent v-for="page in pages" :key="page.id" :value="page.id">
        <CardPage
          :page="page"
          :form-data="formData"
          :is-edit-mode="true"
          :errors="errors"
          :is-form-valid="isFormValid"
          @update:field="updateField"
          @view-page="openViewModal"
        />
      </TabsContent>
    </Tabs>

    <!-- Save Button (bottom right, always in edit mode) -->
    <div v-if="canEdit" class="mt-6 flex justify-end">
      <Button @click="onSave" :disabled="!hasChanges">
        <Save class="mr-2 h-4 w-4" />
        Save
      </Button>
    </div>
  </div>

  <CP204ViewModal
    v-model="isViewModalOpen"
    :form-data="formData"
    :page-id="pageIdToView"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, provide } from 'vue';
import { message } from 'ant-design-vue';
import { Save } from 'lucide-vue-next';
import { getFormContext, saveFormSubmission } from '../services/cp204_service';
import type { FormTemplate, FormSubmission } from './types';
// @ts-ignore
import { CardPage } from './components';
import CP204ViewModal from './components/CP204ViewModal.vue';
import { useFormValidation, useVisibleFields } from './composables';
import {
  VbenSpinner,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vben-core/shadcn-ui';

const template = ref<FormTemplate | null>(null);
const formData = ref<Record<string, any>>({});
const originalFormData = ref<Record<string, any>>({});
const canEdit = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);
const isEditMode = ref(true); // Default to edit mode
const currentTab = ref<string>('');

const isViewModalOpen = ref(false);
const pageIdToView = ref<string | null>(null);

const { visibleFieldIds } = useVisibleFields(template, formData);
const { errors, validate } = useFormValidation(
  template,
  formData,
  visibleFieldIds,
);

const isFormValid = computed(() => {
  // Trigger validation to update errors, then check if errors object is empty
  validate();
  return Object.keys(errors.value).length === 0;
});

// All pages are visible in CP204 (no show_if filtering at page level)
const pages = computed(() => {
  if (!template.value || !template.value.pages) return [];
  return template.value.pages;
});

// Watch for changes in edit mode to reset data on cancel
// This watch is no longer needed as the main form is always in edit mode
// and there's no inline view/edit toggle.
// watch(isEditMode, (isEditing, wasEditing) => {
//   if (!isEditing && wasEditing) {
//     formData.value = JSON.parse(JSON.stringify(originalFormData.value));
//     errors.value = {}; // Clear all validation errors
//     message.info('Changes cancelled.');
//   }
// });

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

onMounted(async () => {
  try {
    const context = await getFormContext();
    template.value = context.template;
    if (context.submission) {
      // eslint-disable-next-line unicorn/prefer-structured-clone
      formData.value = JSON.parse(JSON.stringify(context.submission.data));
      // eslint-disable-next-line unicorn/prefer-structured-clone
      originalFormData.value = JSON.parse(
        JSON.stringify(context.submission.data),
      );
    }
    canEdit.value = context.canEdit;

    // Set default tab to first page
    if (pages.value.length > 0) {
      currentTab.value = pages.value[0].id;
    }
  } catch (error_: any) {
    error.value = error_.message || 'Failed to load form context.';
    message.error(error.value);
  } finally {
    loading.value = false;
  }
});

// Provide submissionYear to all descendant components
provide(
  'submissionYear',
  computed(() => template.value?.yearOfAssessment || new Date().getFullYear()),
);

const updateField = ({ fieldId, value }: { fieldId: string; value: any }) => {
  formData.value[fieldId] = value;
  validate(); // Trigger validation on every field update
};

const openViewModal = (pageId: string) => {
  pageIdToView.value = pageId;
  isViewModalOpen.value = true;
};

const onSave = async () => {
  if (!validate()) {
    message.error('Please fix the validation errors before saving.');
    return;
  }

  if (!template.value) return;

  try {
    const submissionToSave: FormSubmission = {
      submissionId: originalFormData.value.submissionId || '',
      templateId: template.value._id,
      year: template.value.yearOfAssessment,
      data: formData.value,
      updated_at: new Date().toISOString(),
    };

    const savedSubmission = await saveFormSubmission(submissionToSave);
    // eslint-disable-next-line unicorn/prefer-structured-clone
    formData.value = JSON.parse(JSON.stringify(savedSubmission.data));
    // eslint-disable-next-line unicorn/prefer-structured-clone
    originalFormData.value = JSON.parse(JSON.stringify(savedSubmission.data));
    // isEditMode.value = false; // No longer needed as it's always true

    message.success('Form saved successfully!');
  } catch (error_: any) {
    message.error(error_.message || 'Failed to save form.');
  }
};
</script>
