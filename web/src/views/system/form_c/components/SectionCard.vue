<template>
  <div
    v-if="isVisible"
    class="mb-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
  >
    <h3 class="mb-4 text-xl font-semibold">{{ section.title }}</h3>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField
        v-for="field in section.fields"
        :key="field.id"
        :field="field"
        :form-data="formData"
        :is-edit-mode="isEditMode"
        @update:field="onUpdateField"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRef } from 'vue';
import type { FormTemplateSection } from '../types';
import { useShowIfEngine } from '../composables';
import { FormField } from './fields';

const props = defineProps<{
  section: FormTemplateSection;
  formData: Record<string, any>;
  isEditMode: boolean;
}>();

const emit = defineEmits(['update:field']);

const formDataRef = toRef(props, 'formData');
const { isVisible } = useShowIfEngine(props.section.show_if, formDataRef);

const onUpdateField = (payload: { fieldId: string; value: any }) => {
  emit('update:field', payload);
};
</script>
