<template>
  <div v-if="isVisible" class="mb-4">
    <!-- Card-like accordion section: rounded card with subtle header/content contrast -->
    <Accordion type="single" collapsible>
      <AccordionItem
        :value="sectionId"
        class="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <!-- Trigger must be a direct child of AccordionItem for proper behavior -->
        <AccordionTrigger
          class="w-full rounded-t-xl bg-gray-50 px-4 py-3 text-lg font-semibold text-gray-800"
        >
          {{ section.title }}
        </AccordionTrigger>

        <AccordionContent class="rounded-b-xl bg-white px-4 py-4">
          <!-- Responsive 2-column grid for fields: 1 col on xs, 2 cols from sm -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              v-for="field in section.fields"
              :key="field.id"
              class="w-full"
              :class="{
                'sm:col-span-2':
                  field.inputType === 'lookup' ||
                  field.inputType === 'itemList',
              }"
            >
              <FormField
                :field="field"
                :form-data="formData"
                :is-edit-mode="isEditMode"
                @update:field="onUpdateField"
              />
            </div>
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
}>();

const emit = defineEmits(['update:field']);

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
