<template>
  <div v-if="isVisible" class="mb-4">
    <Accordion
      type="single"
      collapsible
      class="w-full"
      :model-value="openSectionId"
      @update:model-value="emit('update:openSectionId', $event)"
    >
      <AccordionItem
        :value="sectionId"
        class="border-border bg-card w-full overflow-hidden rounded-xl border shadow-sm"
      >
        <AccordionTrigger
          class="text-foreground hover:text-primary hover:bg-muted w-full rounded-t-xl px-4 py-3 text-lg font-semibold transition-colors hover:no-underline"
        >
          <div class="flex w-full items-center justify-between">
            <span>{{ section.title }}</span>
            <span
              v-if="errorCount > 0"
              class="bg-destructive ml-4 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
            >
              {{ errorCount }}
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent
          class="bg-card data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden rounded-b-xl px-4 py-4 text-sm transition-all"
        >
          <!-- Responsive 2-column grid for fields: 1 col on xs, 2 cols from sm -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              v-for="field in section.fields"
              :key="field.id"
              :field="field"
              :form-data="formData"
              :is-edit-mode="isEditMode"
              :error="props.errors[field.id]"
              @update:field="onUpdateField"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue';
import type { FormTemplateSection } from '../types';
import { useShowIfEngine } from '../composables';
// SFC runtime import - TypeScript may not recognize the default export typing for .vue files in some configs.
// @ts-ignore-next-line
import FormField from './fields/FormField.vue';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@vben-core/shadcn-ui';

const props = defineProps<{
  section: FormTemplateSection;
  formData: Record<string, any>;
  isEditMode: boolean;
  errors: Record<string, string>;
  openSectionId?: string;
  errorCount: number;
}>();

const emit = defineEmits(['update:field', 'update:openSectionId']);

const formDataRef = toRef(props, 'formData');
const { isVisible } = useShowIfEngine(props.section.show_if, formDataRef);

// Section id may not be typed on FormTemplateSection; coerce safely for template usage
const sectionId = computed(
  () => (props.section as any).id ?? props.section.title,
);

const onUpdateField = (payload: { fieldId: string; value: any }) => {
  emit('update:field', payload);
};
</script>
