<template>
  <div class="space-y-4">
    <AccordionSection
      v-for="section in visibleSections"
      :key="getSectionKey(section)"
      :section="section"
      :form-data="formData"
      :is-edit-mode="isEditMode"
      :errors="props.errors"
      :open-section-id="openSectionId"
      :error-count="sectionErrorCounts[getSectionKey(section)] || 0"
      @update:field="emit('update:field', $event)"
      @update:open-section-id="openSectionId = $event"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRef, watch } from 'vue';
import { AccordionSection } from './';
import type { FormTemplatePage } from '../types';
import { useShowIfEngine } from '../composables';

interface Props {
  page: FormTemplatePage;
  formData: Record<string, any>;
  isEditMode: boolean;
  errors: Record<string, string>;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:field']);

// Create a proper ref for formData so useShowIfEngine can read .value
const formDataRef = toRef(props, 'formData');

// Helper to get a consistent, unique key for a section
const getSectionKey = (section: any): string => {
  return section.id || section.title;
};

// Compute visible sections based on show_if conditions
const visibleSections = computed(() => {
  return props.page.sections.filter((section) => {
    if (!section.show_if) return true;
    const { isVisible } = useShowIfEngine(section.show_if, formDataRef);
    return isVisible.value;
  });
});

const openSectionId = ref<string | undefined>(undefined);

const sectionErrorCounts = computed(() => {
  const counts: Record<string, number> = {};
  if (!props.errors || Object.keys(props.errors).length === 0) {
    return counts;
  }

  for (const section of visibleSections.value) {
    const key = getSectionKey(section);
    let count = 0;
    for (const field of section.fields) {
      if (props.errors[field.id]) {
        count++;
      }
    }
    if (count > 0) {
      counts[key] = count;
    }
  }
  return counts;
});

watch(
  () => props.errors,
  (newErrors) => {
    if (newErrors && Object.keys(newErrors).length > 0) {
      const firstErrorFieldId = Object.keys(newErrors)[0];
      const sectionWithFirstError = visibleSections.value.find((section) =>
        section.fields.some((field) => field.id === firstErrorFieldId),
      );
      if (sectionWithFirstError) {
        openSectionId.value = getSectionKey(sectionWithFirstError);
      }
    }
  },
  { deep: true },
);
</script>
