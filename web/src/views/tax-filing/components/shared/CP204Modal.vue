<template>
  <CP204Modal>
    <!-- Custom Title Slot -->
    <template #title>
      <div class="flex w-full flex-col pr-12">
        <div class="flex w-full items-center justify-between">
          <span>{{ template?.formName || 'CP204 Form' }}</span>
        </div>
        <!-- Manual Tab Navigator -->
        <div class="mt-4 grid w-full grid-cols-4 bg-muted p-1 rounded-md">
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
            @view-page="openViewModal"
          />
        </div>
      </div>
    </div>

    <!-- Custom Footer Slot -->
    <template #footer>
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center">
          <Button
            v-if="template"
            variant="outline"
            @click="openViewModal(currentTab)"
          >
            <Eye class="mr-2 h-4 w-4" />
            Print Preview
          </Button>
        </div>

        <div>
          <FormActionsBar
            v-if="canEdit"
            :disabled="!hasChanges"
            @save="onSave"
            @cancel="handleCancelAndClose"
          />
        </div>
      </div>
    </template>

    <!-- The Print Preview Modal (nested) -->
    <CP204ViewModal ref="viewModalRef" />
  </CP204Modal>
</template>

<script lang="ts" setup>
import { ref, computed, provide } from 'vue';
import { message } from 'ant-design-vue';
import { Eye } from 'lucide-vue-next';
import { useVbenModal } from '@vben/common-ui';
import {
  getFormContext,
  saveFormSubmission,
} from '../../../system/services/cp204_service';
import type {
  FormTemplate,
  FormSubmission,
} from '../../../system/form_c/types';
// @ts-ignore
import { CardPage } from '../../../system/form_c/components';
import FormActionsBar from '../../../system/shared_components/FormActionsBar.vue';
import CP204ViewModal from '../../../system/form_c/components/CP204ViewModal.vue';
import {
  useFormValidation,
  useVisibleFields,
} from '../../../system/form_c/composables';
import { VbenSpinner, Button } from '@vben-core/shadcn-ui';

// Modal setup
const [CP204Modal, cp204ModalApi] = useVbenModal({
  title: 'CP204 Form', // Fallback title, will be overridden by custom header
  showConfirmButton: false,
  width: '90%',
  class: 'cp204-form-modal',
});

// Component state
const template = ref<FormTemplate | null>(null);
const formData = ref<Record<string, any>>({});
const originalFormData = ref<Record<string, any>>({});
const canEdit = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);
const currentTab = ref<string>('');

const viewModalRef = ref<InstanceType<typeof CP204ViewModal> | null>(null);

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
const load = async () => {
  loading.value = true;
  error.value = null;
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

    if (pages.value.length > 0) {
      currentTab.value = pages.value[0].id;
    }
  } catch (error_: any) {
    error.value = error_.message || 'Failed to load form context.';
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};

const open = async () => {
  await load();
  cp204ModalApi.open();
};

const updateField = ({ fieldId, value }: { fieldId: string; value: any }) => {
  formData.value[fieldId] = value;
  validate();
};

const openViewModal = (pageId: string) => {
  if (template.value) {
    viewModalRef.value?.open(formData.value, pageId, template.value);
  }
};

const handleCancelAndClose = () => {
  // eslint-disable-next-line unicorn/prefer-structured-clone
  formData.value = JSON.parse(JSON.stringify(originalFormData.value));
  message.info('Changes cancelled.');
  cp204ModalApi.close();
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
    message.success('Form saved successfully!');
    cp204ModalApi.close();
  } catch (error_: any) {
    message.error(error_.message || 'Failed to save form.');
  }
};

// Expose open method
defineExpose({ open });
</script>
