<template>
  <div class="space-y-4">
    <div class="overflow-x-auto rounded-lg border">
      <table class="w-full table-fixed text-sm">
        <thead class="bg-muted/50 border-b">
          <tr>
            <th
              v-for="column in field.options.columns"
              :key="column.id"
              class="text-muted-foreground px-4 py-3 text-left font-medium"
            >
              {{ column.label }}
            </th>
            <th
              v-if="isEditMode && field.options.allowAddRow"
              class="w-[50px] px-4 py-3"
            >
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="displayTableData.length > 0">
            <tr
              v-for="(row, rowIndex) in displayTableData"
              :key="rowIndex"
              class="hover:bg-muted/50 border-b transition-colors"
            >
              <td
                v-for="column in field.options.columns"
                :key="column.id"
                class="px-4 py-3 align-top"
              >
                <FormField
                  v-if="isCellRendered(rowIndex, column.id)"
                  :field="createCellField(column)"
                  :form-data="row"
                  :is-edit-mode="isCellEditable(rowIndex, column.id)"
                  :compact="true"
                  @update:field="onCellUpdate(rowIndex, $event)"
                />
                <div v-else class="h-10 w-full">
                  <!-- Placeholder to maintain consistent height -->
                </div>
              </td>

              <td
                v-if="isEditMode && field.options.allowAddRow"
                class="px-4 py-3 text-center align-middle"
              >
                <Button
                  v-if="isRowRemovable(rowIndex)"
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="removeRow(rowIndex)"
                >
                  <span class="sr-only">Remove row</span>
                  <X class="h-4 w-4" />
                </Button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td
              :colspan="
                (field.options.columns?.length || 0) +
                (isEditMode && field.options.allowAddRow ? 1 : 0)
              "
              class="text-muted-foreground p-6 text-center"
            >
              No items to display.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isEditMode && field.options.allowAddRow">
      <Button variant="outline" @click="addRow">
        <Plus class="mr-1 h-4 w-4" />
        Add Row
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue';
import { Button } from '@vben-core/shadcn-ui';
import { X, Plus } from 'lucide-vue-next';
import FormField from './FormField.vue';
import { useFormulaEngine } from '../../composables';
import type { TableData, RowData } from '../../composables';
import type { FormTemplateField } from '../../types';

const props = defineProps<{
  field: FormTemplateField;
  formData: Record<string, any>;
  isEditMode: boolean;
}>();

const emit = defineEmits(['update:field']);

const rawTableData = ref<TableData>([]);
const { displayTableData } = useFormulaEngine(rawTableData);

const formId = toRef(props.field, 'id');

const createEmptyRow = (): RowData => {
  const newRow: RowData = {};
  props.field.options?.columns?.forEach((col) => {
    newRow[col.id] = col.defaultValue ?? null;
  });
  return newRow;
};

watch(
  () => [props.formData[formId.value], props.field.options],
  () => {
    const savedData = props.formData[formId.value];
    const fixedRows = props.field.options?.fixedRows || [];
    let initialData: TableData = [];

    // 1. Start with fixed rows as the base
    if (fixedRows.length > 0) {
      // eslint-disable-next-line unicorn/prefer-structured-clone
      initialData = JSON.parse(JSON.stringify(fixedRows));
    }

    // 2. Layer saved data on top
    if (Array.isArray(savedData) && savedData.length > 0) {
      savedData.forEach((savedRow, index) => {
        if (initialData[index]) {
          // Merge saved data onto the fixed row structure
          Object.assign(initialData[index], savedRow);
        } else {
          // Append extra rows the user might have added
          // eslint-disable-next-line unicorn/prefer-structured-clone
          initialData.push(JSON.parse(JSON.stringify(savedRow)));
        }
      });
    }

    // 3. If still empty, create initial rows
    if (initialData.length === 0) {
      const numInitialRows = props.field.options?.initialRows || 0;
      for (let i = 0; i < numInitialRows; i++) {
        initialData.push(createEmptyRow());
      }
    }

    // Ensure all rows have all columns to prevent reactivity issues
    initialData.forEach((row) => {
      props.field.options?.columns?.forEach((col) => {
        if (!(col.id in row)) {
          row[col.id] = col.defaultValue ?? null;
        }
      });
    });

    rawTableData.value = initialData;
  },
  { immediate: true, deep: true },
);

const createCellField = (column: any): FormTemplateField => {
  return {
    ...column,
    isLabelHidden: true, // Labels are always hidden in table cells
  };
};

const isFormula = (rowIndex: number, colId: string): boolean => {
  const rawCell = rawTableData.value[rowIndex]?.[colId];
  return (
    typeof rawCell === 'object' && rawCell !== null && 'formula' in rawCell
  );
};

const isCellEditable = (rowIndex: number, colId: string): boolean => {
  const column = props.field.options?.columns?.find((c) => c.id === colId);
  if (!props.isEditMode || column?.readonly || isFormula(rowIndex, colId)) {
    return false;
  }
  return true;
};

const isCellRendered = (rowIndex: number, colId: string): boolean => {
  const fixedRows = props.field.options?.fixedRows;
  // If this row is a fixed row and its definition explicitly sets this cell to null, don't render.
  if (
    fixedRows &&
    fixedRows.length > rowIndex &&
    fixedRows[rowIndex]?.[colId] === null
  ) {
    return false;
  }
  return true;
};

const isRowRemovable = (rowIndex: number): boolean => {
  const fixedRowsCount = props.field.options?.fixedRows?.length || 0;
  return (
    rowIndex >= fixedRowsCount && props.field.options?.allowAddRow === true
  );
};

const onCellUpdate = (
  rowIndex: number,
  payload: { fieldId: string; value: any },
) => {
  if (rawTableData.value[rowIndex]) {
    rawTableData.value[rowIndex][payload.fieldId] = payload.value;
    emit('update:field', { fieldId: formId.value, value: rawTableData.value });
  }
};

const addRow = () => {
  rawTableData.value.push(createEmptyRow());
  emit('update:field', { fieldId: formId.value, value: rawTableData.value });
};

const removeRow = (rowIndex: number) => {
  rawTableData.value.splice(rowIndex, 1);
  emit('update:field', { fieldId: formId.value, value: rawTableData.value });
};
</script>

<style scoped>
/* Remove margin from FormField when it's compact inside a table */
:deep(.form-field-compact) {
  margin-bottom: 0;
}
</style>
