<template>
  <div>
    <LookupTable
      v-if="group"
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
    <div v-else class="text-muted-foreground text-sm">Loading...</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import type { FormTemplateField } from '../../types';
import { LookupTable } from '../../../lookup/components';
import * as lookupService from '../../../services';

const props = defineProps<{
  field: FormTemplateField;
  formData: Record<string, any>;
  isEditMode: boolean;
}>();

const emit = defineEmits(['update:field']);

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
