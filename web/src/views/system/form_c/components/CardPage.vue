<template>
  <div class="space-y-4">
    <SectionCard
      v-for="section in page.sections"
      :key="section.part"
      :section="section"
      :form-data="formData"
      :is-edit-mode="isEditMode"
      @update:field="onUpdateField"
    />
  </div>
</template>

<script lang="ts" setup>
import type { FormTemplatePage } from '../types';
// @ts-ignore
import { SectionCard } from './';
import { Button } from '@vben-core/shadcn-ui';
import { Eye } from 'lucide-vue-next';

defineProps<{
  page: FormTemplatePage;
  formData: Record<string, any>;
  isEditMode: boolean;
  errors?: Record<string, string>;
  isFormValid: boolean;
}>();

const emit = defineEmits(['update:field', 'view-page']);

const onUpdateField = (payload: { fieldId: string; value: any }) => {
  emit('update:field', payload);
};
</script>
