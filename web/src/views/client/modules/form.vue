<script lang="ts" setup>
import type { SystemClient } from '../data';

import { computed, nextTick, onUnmounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import { Steps } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createClient, updateClient } from '#/api/system/client';

import {
  useStep1Schema,
  useStep2Schema,
  useStep3Schema,
  useStep4Schema,
} from '../data';

const emit = defineEmits<{
  success: [];
}>();

// Create Iconify icons
const UserPlusIcon = createIconifyIcon('lucide:user-plus');
const UserEditIcon = createIconifyIcon('lucide:user-edit');
const CheckCircleIcon = createIconifyIcon('lucide:check-circle');
const AlertCircleIcon = createIconifyIcon('lucide:alert-circle');
const BuildingIcon = createIconifyIcon('lucide:building');
const MapPinIcon = createIconifyIcon('lucide:map-pin');
const SettingsIcon = createIconifyIcon('lucide:settings');

const formData = ref<SystemClient | undefined>();
const currentStep = ref(0);
const isSubmitting = ref(false);

const getTitle = computed(() => {
  return formData.value?.id
    ? `Edit Client - ${formData.value.name}`
    : 'Create New Client';
});

// Step configuration
const steps = [
  {
    title: 'Company Information',
    description: 'Setup Company Details',
    icon: BuildingIcon,
  },
  {
    title: 'Local Organization Info',
    description: 'Setup Organization Details',
    icon: UserPlusIcon,
  },
  {
    title: 'Group Information',
    description: 'Setup Group Details',
    icon: MapPinIcon,
  },
  {
    title: 'Group Business',
    description: 'Setup Group Business',
    icon: SettingsIcon,
  },
];

// Form instances for each step
const [Step1Form, step1FormApi] = useVbenForm({
  schema: useStep1Schema(),
  showDefaultActions: false,
  layout: 'horizontal',
  labelAlign: 'left',
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
});

const [Step2Form, step2FormApi] = useVbenForm({
  schema: useStep2Schema(),
  showDefaultActions: false,
  layout: 'horizontal',
  labelAlign: 'left',
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
});

const [Step3Form, step3FormApi] = useVbenForm({
  schema: useStep3Schema(),
  showDefaultActions: false,
  layout: 'horizontal',
  labelAlign: 'left',
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
});

const [Step4Form, step4FormApi] = useVbenForm({
  schema: useStep4Schema(),
  showDefaultActions: false,
  layout: 'horizontal',
  labelAlign: 'left',
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
});

// Get current form API based on step
const getCurrentFormApi = () => {
  switch (currentStep.value) {
    case 0: {
      return step1FormApi;
    }
    case 1: {
      return step2FormApi;
    }
    case 2: {
      return step3FormApi;
    }
    case 3: {
      return step4FormApi;
    }
    default: {
      return step1FormApi;
    }
  }
};

// Validate current step
const validateCurrentStep = async () => {
  const formApi = getCurrentFormApi();
  const { valid } = await formApi.validate();
  return valid;
};

// Get all form values
const getAllFormValues = async () => {
  const [step1Values, step2Values, step3Values, step4Values] =
    await Promise.all([
      step1FormApi.getValues(),
      step2FormApi.getValues(),
      step3FormApi.getValues(),
      step4FormApi.getValues(),
    ]);

  return {
    ...step1Values,
    ...step2Values,
    ...step3Values,
    ...step4Values,
  };
};

// Set all form values
const setAllFormValues = (data: SystemClient) => {
  step1FormApi.setValues(data);
  step2FormApi.setValues(data);
  step3FormApi.setValues(data);
  step4FormApi.setValues(data);
};

// Reset all forms
const resetAllForms = () => {
  step1FormApi.resetForm();
  step2FormApi.resetForm();
  step3FormApi.resetForm();
  step4FormApi.resetForm();
};

// Navigation functions
const nextStep = async () => {
  const isValid = await validateCurrentStep();
  if (isValid && currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const [Modal, modalApi] = useVbenModal({
  centered: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  class: 'modern-client-modal',
  width: 1200,
  onCancel() {
    // Override the default cancel behavior
    handleCancel();
    return false; // Prevent default modal close
  },
  async onConfirm() {
    try {
      // Validate current step first
      const isCurrentStepValid = await validateCurrentStep();
      if (!isCurrentStepValid) {
        return;
      }

      // If not on the last step, go to next step
      if (currentStep.value < steps.length - 1) {
        await nextStep();
        return;
      }

      // If on the last step, submit the form
      const values = await getAllFormValues();
      modalApi.lock();
      isSubmitting.value = true;

      try {
        await (formData.value?.id
          ? updateClient(formData.value.id, values)
          : createClient(values as any));
        emit('success');
        modalApi.close();
      } catch (error) {
        console.error('Error saving client:', error);
        throw error;
      } finally {
        modalApi.unlock();
        isSubmitting.value = false;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      isSubmitting.value = false;
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      nextTick(() => {
        const data = modalApi.getData<SystemClient>();
        currentStep.value = 0;
        resetAllForms();
        if (data && Object.keys(data).length > 0) {
          formData.value = { ...data };
          setAllFormValues(data);
        } else {
          formData.value = undefined;
        }
      });
    } else {
      formData.value = undefined;
      currentStep.value = 0;
    }
  },
});

// Computed properties for modal actions
const confirmText = computed(() => {
  if (isSubmitting.value) {
    return formData.value?.id ? 'Updating...' : 'Creating...';
  }
  return currentStep.value < steps.length - 1
    ? 'Next'
    : formData.value?.id
      ? 'Update Client'
      : 'Create Client';
});

const showCancelButton = computed(() => currentStep.value > 0);

// Override modal cancel action for step navigation
const handleCancel = () => {
  console.log('handleCancel called, currentStep:', currentStep.value);
  if (currentStep.value > 0) {
    // If not on first step, go to previous step
    console.log('Going to previous step');
    prevStep();
  } else {
    // If on first step, close the modal (Cancel button)
    console.log('Closing modal');
    modalApi.close();
  }
};

// Cleanup on component unmount
onUnmounted(() => {
  formData.value = undefined;
  currentStep.value = 0;
});
</script>

<template>
  <Modal
    :title="getTitle"
    :confirm-text="confirmText"
    :cancel-text="showCancelButton ? 'Previous' : 'Cancel'"
    :show-cancel-button="true"
  >
    <template #header>
      <div class="modal-header">
        <div class="header-icon-wrapper">
          <div class="header-icon">
            <component
              :is="formData?.id ? UserEditIcon : UserPlusIcon"
              class="icon"
            />
          </div>
        </div>
        <div class="header-content">
          <h2 class="header-title">
            {{ formData?.id ? 'Edit Client' : 'Create New Client' }}
          </h2>
          <p class="header-subtitle">
            {{
              formData?.id
                ? 'Update client information and save changes'
                : 'Fill in the required information to create a new client account'
            }}
          </p>
        </div>
      </div>
    </template>

    <div class="modal-body">
      <!-- Steps Navigation -->
      <div class="steps-container">
        <Steps :current="currentStep" class="custom-steps">
          <Steps.Step
            v-for="(step, index) in steps"
            :key="index"
            :title="step.title"
            :description="step.description"
          >
            <template #icon>
              <div class="step-icon" :class="{ active: index <= currentStep }">
                <component :is="step.icon" class="h-4 w-4" />
              </div>
            </template>
          </Steps.Step>
        </Steps>
      </div>

      <!-- Form Content -->
      <div class="form-content">
        <!-- Step 1: Personal Information -->
        <div v-show="currentStep === 0" class="step-form">
          <Step1Form class="client-form" />
        </div>

        <!-- Step 2: Company Information -->
        <div v-show="currentStep === 1" class="step-form">
          <Step2Form class="client-form" />
        </div>

        <!-- Step 3: Group Information -->
        <div v-show="currentStep === 2" class="step-form">
          <Step3Form class="client-form" />
        </div>

        <!-- Step 4: Group Business -->
        <div v-show="currentStep === 3" class="step-form">
          <Step4Form class="client-form" />
        </div>
      </div>

      <!-- Client Info Footer for Edit Mode -->
      <div class="client-info-footer" v-if="formData?.id">
        <div class="info-grid">
          <div class="info-card">
            <div class="info-icon">
              <CheckCircleIcon class="h-4 w-4" />
            </div>
            <div class="info-content">
              <span class="info-label">Created</span>
              <span class="info-value">{{
                formData.createdTime || 'N/A'
              }}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="info-icon">
              <AlertCircleIcon class="h-4 w-4" />
            </div>
            <div class="info-content">
              <span class="info-label">Last Modified</span>
              <span class="info-value">{{
                formData.lastModifiedTime || 'N/A'
              }}</span>
            </div>
          </div>
          <div class="info-card" v-if="formData.lastContactTime">
            <div class="info-icon">
              <CheckCircleIcon class="h-4 w-4" />
            </div>
            <div class="info-content">
              <span class="info-label">Last Contact</span>
              <span class="info-value">{{ formData.lastContactTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>


/* Animation classes */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .modern-client-modal :deep(.vben-modal) {
    width: 95% !important;
    max-width: 1000px;
  }
}

@media (max-width: 768px) {
  .modal-header {
    @apply flex-col space-x-0 space-y-4 text-center;
  }

  .info-grid {
    @apply grid-cols-1;
  }

  .modern-client-modal :deep(.vben-modal-content) {
    @apply mx-4;
  }

  .steps-container {
    @apply px-2;
  }

  .client-form :deep(.ant-form-item-label),
  .client-form :deep(.ant-form-item-control) {
    @apply w-full;
  }

  .form-content {
    @apply px-2;
  }
}

.modal-header {
  @apply flex items-center space-x-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6;
}

.header-icon-wrapper {
  @apply flex-shrink-0;
}

.header-icon {
  @apply flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-lg;
}

.header-icon .icon {
  @apply h-6 w-6 text-blue-600;
}

.header-content {
  @apply flex-1;
}

.header-title {
  @apply mb-1 text-xl font-bold text-gray-900;
}

.header-subtitle {
  @apply text-sm text-gray-600;
}

/* Modal Body Styling */
.modal-body {
  @apply p-6;
}

/* Steps Styling */
.steps-container {
  @apply mb-8 px-4;
}

.custom-steps :deep(.ant-steps-item-title) {
  @apply text-sm font-semibold;
}

.custom-steps :deep(.ant-steps-item-description) {
  @apply text-xs text-gray-500;
}

.step-icon {
  @apply flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition-all duration-200;
}

.step-icon.active {
  @apply border-blue-500 bg-blue-500 text-white;
}

.step-icon:not(.active) {
  @apply text-gray-400;
}

/* Form Content */
.form-content {
  @apply min-h-[500px] px-4;
}

.step-form {
  @apply animate-in fade-in-50 duration-300;
}

.client-form :deep(.ant-form-item) {
  @apply mb-6;
}

.client-form :deep(.ant-form-item-label) {
  @apply text-left font-medium text-gray-700;

  text-align: left !important;
}

.client-form :deep(.ant-form-item-label > label) {
  @apply text-sm font-semibold;
}

.client-form :deep(.ant-divider) {
  @apply my-8;
}

.client-form :deep(.ant-input),
.client-form :deep(.ant-select-selector),
.client-form :deep(.ant-picker) {
  @apply border-gray-300 hover:border-blue-400 focus:border-blue-500;
}

.client-form :deep(.rich-text-editor) {
  @apply rounded-lg border border-gray-300;
}

/* Client Info Footer */
.client-info-footer {
  @apply mt-8 border-t border-gray-200 pt-6;
}

.info-grid {
  @apply grid grid-cols-1 gap-4 md:grid-cols-3;
}

.info-card {
  @apply flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-4;
}

.info-icon {
  @apply flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm;
}

.info-content {
  @apply flex-1;
}

.info-label {
  @apply block text-xs font-medium uppercase tracking-wide text-gray-500;
}

.info-value {
  @apply mt-1 block text-sm font-semibold text-gray-900;
}

.animate-in {
  animation: fade-in 0.3s ease-out;
}

.fade-in-50 {
  animation-duration: 0.3s;
}

.duration-300 {
  animation-duration: 0.3s;
}

/* Responsive Design */
</style>
