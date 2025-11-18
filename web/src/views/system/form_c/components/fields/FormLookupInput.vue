<template>
  <div>
    <div v-if="group">
      <div
        v-if="isEditMode"
        class="border-primary bg-primary/10 mb-4 flex items-start space-x-3 border-l-4 p-3"
      >
        <div>
          <Info class="text-primary h-5 w-5" />
        </div>
        <p class="text-primary text-sm">
          Use the checkboxes to select all items you want to include in your
          form. Unchecked items will be ignored and not saved.
        </p>
      </div>
      <LookupTable
        :key="tableSlug"
        :group-id="tableSlug"
        :group="group"
        :columns="tableColumns"
        :selectable="true"
        :selection="fieldValue"
        :show-actions="isEditMode"
        :selection-disabled="!isEditMode"
        :has-pager="true"
        :per-page="5"
        @update:selection="handleSelectionChange"
      />
      <GeneratePdfControl
        v-if="!isEditMode"
        :title="group.title || group.name || group.slug || props.field.label"
        :submission-year="submissionYear"
        :headers="tableColumns"
        :lookup-slug="tableSlug"
        :selected-row-ids="fieldValue"
      />
    </div>
    <div v-else class="text-muted-foreground text-sm">Loading...</div>
  </div>
</template>

<script lang="ts" setup>
import { Info } from 'lucide-vue-next';
import { ref, computed, onMounted, inject } from 'vue';
import type { FormTemplateField } from '../../types';
import { LookupTable } from '../../../lookup/components';
import * as lookupService from '../../../services';
// @ts-ignore
import { GeneratePdfControl } from '../';

const props = defineProps<{
  field: FormTemplateField;
  formData: Record<string, any>;
  isEditMode: boolean;
}>();

const emit = defineEmits(['update:field']);

// Inject submissionYear with fallback
const submissionYear = inject(
  'submissionYear',
  computed(() => new Date().getFullYear()),
);

const group = ref<any>(null);

const fieldValue = computed({
  get: () => props.formData[props.field.id] || [],
  set: (value) => emit('update:field', { fieldId: props.field.id, value }),
});

const tableSlug = computed(() => props.field.label);

const tableColumns = computed(() => {
  const g = group.value;
  if (!g || !Array.isArray(g.columns_schema)) return [];
  return g.columns_schema.map((c: any) => ({
    name: c.key || c.name || c.label,
    label: c.label || c.key || c.name,
    type: c.type || 'text',
    required: !!c.required,
    multiline: !!c.multiline,
  }));
});

function handleSelectionChange(newSelection: string[]) {
  fieldValue.value = newSelection;
}

onMounted(async () => {
  if (tableSlug.value) {
    group.value = await lookupService.findGroupBySlug(tableSlug.value);
  }
});
</script>
