<template>
  <div class="space-y-4">
    <AccordionSection
      v-for="section in visibleSections"
      :key="section.id"
      :section="section"
      :form-data="formData"
      :is-edit-mode="isEditMode"
      @update:field="emit('update:field', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue';
import AccordionSection from './AccordionSection.vue';
import type { FormTemplatePage } from '../types';
import { useShowIfEngine } from '../composables';

interface Props {
  page: FormTemplatePage;
  formData: Record<string, any>;
  isEditMode: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:field']);

// Create a proper ref for formData so useShowIfEngine can read .value
const formDataRef = toRef(props, 'formData');

// Compute visible sections based on show_if conditions
const visibleSections = computed(() => {
  return props.page.sections.filter((section) => {
    if (!section.show_if) return true;
    const { isVisible } = useShowIfEngine(section.show_if, formDataRef);
    return isVisible.value;
  });
});
</script>
