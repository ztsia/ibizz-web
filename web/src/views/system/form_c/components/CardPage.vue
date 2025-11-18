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

defineProps<{
  page: FormTemplatePage;
  formData: Record<string, any>;
  isEditMode: boolean;
  errors?: Record<string, string>;
}>();

const emit = defineEmits(['update:field']);

const onUpdateField = (payload: { fieldId: string; value: any }) => {
  emit('update:field', payload);
};
</script>
