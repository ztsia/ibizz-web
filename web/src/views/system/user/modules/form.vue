<script lang="ts" setup>
import type { SystemUser } from '../data';

import { computed, nextTick, onUnmounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import { useVbenForm } from '#/adapter/form';
import { createUser, updateUser } from '#/api/system/user';

import { useFormSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();

// Create Iconify icons
const UserPlusIcon = createIconifyIcon('lucide:user-plus');
const UserEditIcon = createIconifyIcon('lucide:user-edit');
const CheckCircleIcon = createIconifyIcon('lucide:check-circle');
const AlertCircleIcon = createIconifyIcon('lucide:alert-circle');

const formData = ref<SystemUser | undefined>();

const getTitle = computed(() => {
  return formData.value?.id
    ? `Edit User - ${formData.value.name}`
    : 'Create New User';
});

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  centered: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  class: 'modern-user-modal',
  async onConfirm() {
    try {
      const { valid } = await formApi.validate();
      if (!valid) return;

      const values = await formApi.getValues();
      modalApi.lock();

      try {
        await (formData.value?.id
          ? updateUser(formData.value.id, values)
          : createUser(values as any));
        emit('success');
        modalApi.close();
      } catch (error) {
        console.error('Error saving user:', error);
        throw error;
      } finally {
        modalApi.unlock();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      nextTick(() => {
        const data = modalApi.getData<SystemUser>();
        formApi.resetForm();
        if (data && Object.keys(data).length > 0) {
          formData.value = { ...data };
          formApi.setValues(data);
        } else {
          formData.value = undefined;
        }
      });
    } else {
      formData.value = undefined;
    }
  },
});

// Cleanup on component unmount
onUnmounted(() => {
  formData.value = undefined;
});
</script>

<template>
  <Modal :title="getTitle">
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
            {{ formData?.id ? 'Edit User' : 'Create New User' }}
          </h2>
          <p class="header-subtitle">
            {{
              formData?.id
                ? 'Update user information and save changes'
                : 'Fill in the required information to create a new user account'
            }}
          </p>
        </div>
      </div>
    </template>

    <div class="modal-body">
      <Form class="user-form" />

      <!-- User Info Footer for Edit Mode -->
      <div class="user-info-footer" v-if="formData?.id">
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
          <div class="info-card" v-if="formData.lastLoginTime">
            <div class="info-icon">
              <CheckCircleIcon class="h-4 w-4" />
            </div>
            <div class="info-content">
              <span class="info-label">Last Login</span>
              <span class="info-value">{{ formData.lastLoginTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
/* Responsive Design */
@media (max-width: 768px) {
  .modal-header {
    @apply flex-col space-x-0 space-y-4 text-center;
  }

  .info-grid {
    @apply grid-cols-1;
  }

  .modern-user-modal :deep(.vben-modal-content) {
    @apply mx-4;
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

/* User Info Footer */
.user-info-footer {
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
</style>
