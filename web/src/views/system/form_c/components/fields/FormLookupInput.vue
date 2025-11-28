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
      <component
        :is="isFormLookup ? FormLookupTable : LookupTable"
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
        :add-form="props.field.addForm"
        @update:selection="handleSelectionChange"
      />
      <GeneratePdfControl
        v-if="!isEditMode"
        template="table-template"
        :data-provider="providePdfData"
        :file-name="`${tableSlug}_${submissionYear}.pdf`"
      />
    </div>
    <div v-else class="text-muted-foreground text-sm">Loading...</div>
  </div>
</template>

<script lang="ts" setup>
import { Info } from 'lucide-vue-next';
import { ref, computed, onMounted, inject, watch } from 'vue';
import type { FormTemplateField } from '../../types';
import { LookupTable } from '../../../lookup/components';
import { FormLookupTable } from '.';
import * as lookupService from '../../../services';
import * as formLookupService from '../../services/formLookupManager.service';
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

const isFormLookup = computed(() => !!props.field.columns);

const tableSlug = computed(() => {
  if (isFormLookup.value) {
    return props.field.id; // Use field ID as the slug for form lookups
  }
  return props.field.label; // Legacy: use label for shared lookups
});

const tableColumns = computed(() => {
  // Check if columns are defined inline (Form Lookup Mode)
  if (isFormLookup.value && Array.isArray(props.field.columns)) {
    return props.field.columns.map((c: any) => ({
      key: c.key || c.name || c.label,
      name: c.key || c.name || c.label,
      label: c.label || c.key || c.name,
      type: c.type || 'text',
      required: !!c.required,
      multiline: !!c.multiline,
    }));
  }
  
  // Fallback to shared lookup group (Legacy Mode)
  const g = group.value;
  if (!g || !Array.isArray(g.columns_schema)) return [];
  return g.columns_schema.map((c: any) => ({
    key: c.key || c.name || c.label,
    name: c.key || c.name || c.label, // `name` is needed by LookupTable
    label: c.label || c.key || c.name,
    type: c.type || 'text',
    required: !!c.required,
    multiline: !!c.multiline,
  }));
});

function handleSelectionChange(newSelection: string[]) {
  fieldValue.value = newSelection;
}

async function providePdfData(): Promise<Record<string, any>> {
  const service = isFormLookup.value ? formLookupService : lookupService;
  // 1. Fetch fresh data
  const result = await service.listItems(tableSlug.value || null, {
    perPage: 9999,
  });
  const rawRows = Array.isArray(result) ? result : result?.items || [];

  // 2. Transform rows to the required { id, columns } format
  const allRows = rawRows.map((row: any) => {
    if (row.columns && typeof row.columns === 'object') {
      return {
        id: row.id || row._id || String(Math.random()),
        columns: row.columns,
      };
    }
    const { id, _id, ...columns } = row;
    return {
      id: id || _id || String(Math.random()),
      columns,
    };
  });

  // 3. Assemble and return the payload
  const title =
    group.value?.title ||
    group.value?.name ||
    group.value?.slug ||
    props.field.label;

  const headers = tableColumns.value.map((col: any) => ({
    key: col.key,
    label: col.label,
  }));

  return {
    title,
    submissionYear: submissionYear.value,
    headers,
    allRows,
    selectedRowIds: fieldValue.value,
    printSelectedOnly: true,
  };
}

onMounted(async () => {
  if (isFormLookup.value) {
    // Form Lookup Mode: create a virtual group object
    group.value = {
      slug: tableSlug.value,
      title: props.field.label,
      columns_schema: props.field.columns,
    };
  } else {
    // Shared Lookup Mode: fetch from lookup service
    if (tableSlug.value) {
      group.value = await lookupService.findGroupBySlug(tableSlug.value);
    }
  }
});

watch(
  () => fieldValue.value,
  async (newIds) => {
    if (!newIds || newIds.length === 0) {
      // eslint-disable-next-line vue/no-mutating-props
      props.formData[`${props.field.id}_data`] = [];
      return;
    }
    if (tableSlug.value) {
      try {
        const service = isFormLookup.value ? formLookupService : lookupService;
        const items = await service.getItems(tableSlug.value, newIds);
        const mappedData = items.map((i: any) => i.columns);
        // eslint-disable-next-line vue/no-mutating-props
        props.formData[`${props.field.id}_data`] = mappedData;
      } catch (error) {
        console.error('Failed to fetch lookup items data:', error);
        // eslint-disable-next-line vue/no-mutating-props
        props.formData[`${props.field.id}_data`] = [];
      }
    }
  },
  { immediate: true },
);
</script>
