<template>
  <OtherParticularsModal>
    <template #title>
      <div class="w-full">
        <!-- Header with title and toggle -->
        <div class="flex items-center justify-between pb-2">
          <h1 class="text-2xl font-bold">
            {{
              currentPage && currentPage.title
                ? currentPage.title
                : template && template.formName
            }}
          </h1>
          <ToggleEditViewButton v-if="canEdit" v-model:isEditing="isEditMode" />
        </div>

        <!-- Progress + Navigation (buttons left/right of the progress bar) -->
        <div class="flex items-center gap-4 pt-2">
          <!-- Left: Previous (hide on first page but keep width for alignment) -->
          <div class="w-32">
            <div v-if="currentPageIndex > 0">
              <Button @click="previousPage" variant="outline" class="w-full">
                <ChevronLeft class="mr-1 h-4 w-4" />
                Previous
              </Button>
            </div>
            <div v-else class="h-full w-full" aria-hidden="true"></div>
          </div>

          <!-- Center: Progress & indicators -->
          <div class="flex-1 space-y-2">
            <div class="text-muted-foreground flex justify-between text-sm">
              <span
                >Page {{ currentPageIndex + 1 }} of
                {{ visiblePages.length }}</span
              >
              <span>{{ Math.round(progressPercentage) }}% Complete</span>
            </div>

            <!-- Page indicators -->
            <div class="flex items-center gap-2 pt-2">
              <button
                v-for="(page, index) in visiblePages"
                :key="page.id"
                @click="goToPage(index)"
                :disabled="!canNavigateToPage(index)"
                class="h-2 flex-1 rounded-full transition-all"
                :class="[
                  index === currentPageIndex
                    ? 'bg-primary'
                    : index < currentPageIndex
                      ? 'bg-primary/50'
                      : 'bg-gray-300',
                  canNavigateToPage(index)
                    ? 'hover:bg-primary/70 cursor-pointer'
                    : 'cursor-not-allowed',
                ]"
                :title="page.title"
              ></button>
            </div>
          </div>

          <!-- Right: Next / Save (Save only visible when editing on last page) -->
          <div class="flex w-32 justify-end">
            <div>
              <Button
                v-if="currentPageIndex < visiblePages.length - 1"
                @click="nextPage"
                class="w-full"
              >
                Next
                <ChevronRight class="ml-1 h-4 w-4" />
              </Button>

              <div v-else>
                <Button
                  v-if="isEditMode"
                  @click="onSave"
                  class="w-full"
                  :disabled="!hasChanges"
                >
                  <Save class="mr-1 h-4 w-4" />
                  Save
                </Button>
                <div v-else class="h-full w-full" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-if="loading" class="flex min-h-[50vh] items-center justify-center">
      <VbenSpinner class="h-8 w-8" />
    </div>
    <div v-else-if="error" class="p-4">
      <div
        class="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4"
      >
        {{ error }}
      </div>
    </div>
    <div v-else-if="template" class="p-6">
      <!-- Current Page -->
      <div v-if="currentPage" class="space-y-4">
        <AccordionPage
          :page="currentPage"
          :form-data="formData"
          :is-edit-mode="isEditMode"
          :errors="errors"
          @update:field="updateField"
        />
      </div>
    </div>
  </OtherParticularsModal>
</template>

<script lang="ts" setup>
import { ref, computed, watch, provide } from 'vue';
import { message } from 'ant-design-vue';
import { ChevronLeft, ChevronRight, Save } from 'lucide-vue-next';
import { useVbenModal } from '@vben/common-ui';
import { getFormContext, saveFormSubmission } from '../../../system/services';
import type {
  FormTemplate,
  FormSubmission,
} from '../../../system/form_c/types';
import { AccordionPage } from '../../../system/form_c/components';
import { ToggleEditViewButton } from '../../../system/shared_components';
import {
  useShowIfEngine,
  useFormValidation,
  useVisibleFields,
} from '../../../system/form_c/composables';
/* useShowIfEngine is used in other components; page-level evaluation uses inline helper to ensure reactivity */
import { VbenSpinner, Button } from '@vben-core/shadcn-ui';

const [OtherParticularsModal, otherParticularsModalApi] = useVbenModal({
  title: 'Other Particulars', // This will be replaced by the #title slot
  showConfirmButton: false,
  showCancelButton: false,
  width: '90%',
  class: 'other-particulars-modal',
});

const template = ref<FormTemplate | null>(null);
const formData = ref<Record<string, any>>({});
const originalFormData = ref<Record<string, any>>({});
const canEdit = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);
const isEditMode = ref(false);
const currentPageIndex = ref(0);
const isSaving = ref(false);

const { visibleFieldIds } = useVisibleFields(template, formData);
const { errors, validate, validatePage } = useFormValidation(
  template,
  formData,
  visibleFieldIds,
);
// Compute visible pages based on show_if conditions
const visiblePages = computed(() => {
  if (!template.value || !template.value.pages) return [];

  // Evaluate each page and return visibility
  const pages = template.value.pages.filter((page) => {
    if (!page.show_if) {
      return true;
    }
    const { isVisible } = useShowIfEngine(page.show_if, formData);
    return isVisible.value;
  });

  return pages;
});

// Watch for changes in visible pages and adjust current page index if needed
watch(visiblePages, (newPages) => {
  if (currentPageIndex.value >= newPages.length && newPages.length > 0) {
    currentPageIndex.value = newPages.length - 1;
  }
  if (newPages.length === 0) {
    currentPageIndex.value = 0;
  }
});

// When user cancels editing by toggling back to view mode
watch(isEditMode, (isEditing, wasEditing) => {
  if (isSaving.value) {
    return;
  }
  if (!isEditing && wasEditing) {
    // eslint-disable-next-line unicorn/prefer-structured-clone
    formData.value = JSON.parse(JSON.stringify(originalFormData.value));
    errors.value = {}; // Clear all validation errors
    message.info('Changes cancelled.');
  }
});

// Current page being displayed
const currentPage = computed(() => {
  return visiblePages.value[currentPageIndex.value] || null;
});

// Progress percentage
const progressPercentage = computed(() => {
  if (visiblePages.value.length === 0) return 0;
  return ((currentPageIndex.value + 1) / visiblePages.value.length) * 100;
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

// Navigation functions
const nextPage = () => {
  if (
    isEditMode.value &&
    currentPage.value &&
    !validatePage(currentPage.value.id)
  ) {
    message.error('Please fix the errors on this page before proceeding.');
    return;
  }
  if (currentPageIndex.value < visiblePages.value.length - 1) {
    currentPageIndex.value++;
    scrollToTop();
  }
};

const previousPage = () => {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--;
    scrollToTop();
  }
};

const goToPage = (index: number) => {
  if (
    isEditMode.value &&
    currentPage.value &&
    index > currentPageIndex.value &&
    !validatePage(currentPage.value.id)
  ) {
    message.error('Please fix the errors on this page before proceeding.');
    return;
  }

  if (canNavigateToPage(index)) {
    currentPageIndex.value = index;
    scrollToTop();
  }
};

const canNavigateToPage = (index: number): boolean => {
  return index <= currentPageIndex.value || index < visiblePages.value.length;
};

const scrollToTop = () => {
  const modalBody = document.querySelector(
    '.other-particulars-modal .ant-modal-body',
  );
  if (modalBody) {
    modalBody.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

async function load() {
  loading.value = true;
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
  } catch (error_: any) {
    error.value = error_.message || 'Failed to load form context.';
    message.error(error.value);
  } finally {
    loading.value = false;
  }
}

async function open(pageId?: string) {
  await load();
  if (pageId) {
    const index = visiblePages.value.findIndex((p) => p.id === pageId);
    if (index !== -1) {
      currentPageIndex.value = index;
    }
  } else {
    currentPageIndex.value = 0; // Default to first page
  }
  otherParticularsModalApi.open();
}

// Provide submissionYear to all descendant components
provide(
  'submissionYear',
  computed(() => template.value?.yearOfAssessment || new Date().getFullYear()),
);

const updateField = ({ fieldId, value }: { fieldId: string; value: any }) => {
  formData.value[fieldId] = value;
};

const onSave = async () => {
  if (!validate()) {
    message.error('Please fix the validation errors before saving.');
    return;
  }
  if (!template.value) return;

  isSaving.value = true;
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
    isEditMode.value = false;
    message.success('Form saved successfully!');
  } catch (error_: any) {
    message.error(error_.message || 'Failed to save form.');
  } finally {
    setTimeout(() => {
      isSaving.value = false;
    }, 0);
  }
};

defineExpose({ open, visiblePages });
</script>
