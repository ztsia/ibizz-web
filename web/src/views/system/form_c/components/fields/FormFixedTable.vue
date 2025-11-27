<template>
  <div class="space-y-4">
    <div
      v-if="isEditMode && selectable && selectedIndices.size > 0"
      class="flex justify-end"
    >
      <Button variant="destructive" size="sm" @click="deleteSelected">
        Delete Selected ({{ selectedIndices.size }})
      </Button>
    </div>
    <div class="overflow-x-auto rounded-lg border">
      <table class="w-full table-fixed text-sm">
        <thead class="bg-muted/50 border-b">
          <tr>
            <th
              v-if="isEditMode && selectable"
              class="w-[50px] px-4 py-3 text-center"
            >
              <input
                type="checkbox"
                class="border-input text-primary focus:ring-primary h-4 w-4 rounded disabled:opacity-50"
                :checked="isAllSelected"
                :disabled="removableRowsIndices.length === 0"
                title="Select All"
                @change="toggleSelectAll"
              />
            </th>
            <th
              v-for="column in field.options?.columns"
              :key="column.id"
              class="text-muted-foreground px-4 py-3 text-left font-medium"
            >
              {{ column.label }}
            </th>
            <th
              v-if="isEditMode && field.options?.allowAddRow"
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
                v-if="isEditMode && selectable"
                class="px-4 py-3 text-center align-middle"
              >
                <input
                  v-if="isRowRemovable(rowIndex)"
                  type="checkbox"
                  class="border-input text-primary focus:ring-primary h-4 w-4 rounded"
                  :checked="selectedIndices.has(rowIndex)"
                  @change="
                    (e) =>
                      toggleRowSelection(
                        rowIndex,
                        (e.target as HTMLInputElement).checked,
                      )
                  "
                />
              </td>
              <td
                v-for="column in field.options?.columns"
                :key="column.id"
                class="px-4 py-3 align-top"
              >
                <FormField
                  v-if="isCellRendered(rowIndex, column.id)"
                  :field="createCellField(column, rowIndex)"
                  :form-data="row"
                  :is-edit-mode="isEditMode"
                  :compact="true"
                  @update:field="onCellUpdate(rowIndex, $event)"
                />
                <div v-else class="h-10 w-full">
                  <!-- Placeholder to maintain consistent height -->
                </div>
              </td>

              <td
                v-if="isEditMode && field.options?.allowAddRow"
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
                (field.options?.columns?.length || 0) +
                (isEditMode && field.options?.allowAddRow ? 1 : 0) +
                (isEditMode && selectable ? 1 : 0)
              "
              class="text-muted-foreground p-6 text-center"
            >
              No items to display.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isEditMode && field.options?.allowAddRow">
      <Button variant="outline" @click="addRow">
        <Plus class="mr-1 h-4 w-4" />
        Add Row
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRef, computed, nextTick } from 'vue';
import { Button } from '@vben-core/shadcn-ui';
import { X, Plus } from 'lucide-vue-next';
import FormField from './FormField.vue';
import { useFormulaEngine } from '../../composables';
import type { TableData, RowData } from '../../composables';
import type { FormTemplateField, Option } from '../../types';
import { notifyError } from '../../../lookup/utils/notifications';

const props = defineProps<{
  field: FormTemplateField;
  formData: Record<string, any>;
  isEditMode: boolean;
  selectable?: boolean;
}>();

const emit = defineEmits(['update:field']);

const rawTableData = ref<TableData>([]);
const formDataRef = toRef(props, 'formData');
const { displayTableData } = useFormulaEngine(rawTableData, formDataRef);

const formId = toRef(props.field, 'id');

const createEmptyRow = (): RowData => {
  const newRow: RowData = {};
  props.field.options?.columns?.forEach((col: FormTemplateField) => {
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
      props.field.options?.columns?.forEach((col: FormTemplateField) => {
        if (!(col.id in row)) {
          row[col.id] = col.defaultValue ?? null;
        }
      });
    });

    if (JSON.stringify(initialData) !== JSON.stringify(rawTableData.value)) {
      rawTableData.value = initialData;
    }
  },
  { immediate: true, deep: true },
);

const checkCondition = (condition: any, row: any) => {
  if (!condition || !row) return false;
  const val = row[condition.fieldId];
  switch (condition.operator) {
    case 'equals': {
      return val === condition.value;
    }
    case 'not_equals': {
      return val !== condition.value;
    }
    default: {
      return false;
    }
  }
};

const getConditionalOverrides = (
  column: FormTemplateField,
  rowIndex: number,
) => {
  const row = rawTableData.value[rowIndex];
  if (!row || !column.conditionalProperties) return {};

  for (const prop of column.conditionalProperties) {
    if (checkCondition(prop.condition, row)) {
      const { condition: _condition, value: _value, ...overrides } = prop;
      return overrides;
    }
  }
  return {};
};

// Watch for conditional value updates
watch(
  () => rawTableData.value,
  (newData) => {
    newData.forEach((row) => {
      props.field.options?.columns?.forEach((col: FormTemplateField) => {
        if (col.conditionalProperties) {
          col.conditionalProperties.forEach((prop: any) => {
            const conditionMet = checkCondition(prop.condition, row);
            if (conditionMet && prop.value !== undefined) {
              // Only set if different
              if (JSON.stringify(row[col.id]) !== JSON.stringify(prop.value)) {
                row[col.id] = prop.value;
              }
            } else if (
              !conditionMet &&
              prop.value !== undefined && // Revert if it matches the conditional value
              JSON.stringify(row[col.id]) === JSON.stringify(prop.value)
            ) {
              row[col.id] = col.defaultValue ?? null;
            }
          });
        }

        // Handle conditional sign (auto-negate for deduct, auto-positive for add back)
        if (col.conditionalSign && col.conditionalSign.watchField) {
          const watchFieldValue = row[col.conditionalSign.watchField];
          const currentValue = row[col.id];

          if (
            currentValue !== null &&
            currentValue !== undefined &&
            currentValue !== ''
          ) {
            const numValue =
              typeof currentValue === 'number'
                ? currentValue
                : Number.parseFloat(
                    String(currentValue).replaceAll(/[^0-9.-]/g, ''),
                  );

            if (!Number.isNaN(numValue)) {
              const { negateWhen = [], positiveWhen = [] } =
                col.conditionalSign;

              // Check if should be negative
              if (negateWhen.includes(watchFieldValue)) {
                const shouldBeNegative = -Math.abs(numValue);
                if (row[col.id] !== shouldBeNegative) {
                  row[col.id] = shouldBeNegative;
                }
              }
              // Check if should be positive
              else if (positiveWhen.includes(watchFieldValue)) {
                const shouldBePositive = Math.abs(numValue);
                if (row[col.id] !== shouldBePositive) {
                  row[col.id] = shouldBePositive;
                }
              }
            }
          }
        }
      });
    });
  },
  { deep: true },
);

const createCellField = (
  column: FormTemplateField,
  rowIndex: number,
): FormTemplateField => {
  // eslint-disable-next-line unicorn/prefer-structured-clone
  const cellField = JSON.parse(JSON.stringify(column));
  cellField.isLabelHidden = true; // Labels are always hidden in table cells

  // Handle unique columns (like 'key' in FormItemList)
  if (column.unique && column.options) {
    cellField.options = getAvailableOptions(rowIndex, column);
  }

  // Apply conditional overrides
  const overrides = getConditionalOverrides(column, rowIndex);
  Object.assign(cellField, overrides);

  // If field is disabled by another column's selection, mark it as readonly
  if (isFieldDisabled(rowIndex, column.id)) {
    cellField.readonly = true;
  }

  return cellField;
};

const getAvailableOptions = (
  rowIndex: number,
  column: FormTemplateField,
): Option[] => {
  const options = column.options as Option[];
  if (!options || !Array.isArray(options)) return [];

  // If repeating is allowed globally for the table, we might still want to respect 'unique' on a specific column
  // But usually 'unique' implies no repeating for that column.
  // If the column is explicitly marked unique, we filter.
  if (!column.unique) {
    return options;
  }

  const usedValues = new Set();
  rawTableData.value.forEach((row, index) => {
    if (index !== rowIndex) {
      const val = row[column.id];
      if (val) {
        usedValues.add(val);
      }
    }
  });

  return options.filter((opt) => !usedValues.has(opt.value));
};

const isFieldDisabled = (rowIndex: number, colId: string): boolean => {
  const row = rawTableData.value[rowIndex];
  if (!row) return false;

  // Check all other columns to see if their selected value disables this column
  for (const column of props.field.options?.columns || []) {
    if (column.id === colId) continue; // Don't check self

    const val = row[column.id];
    if (val && column.options && Array.isArray(column.options)) {
      const selectedOption = (column.options as Option[]).find(
        (opt) => opt.value === val,
      );
      if (
        selectedOption?.disabledFields &&
        selectedOption.disabledFields.includes(colId)
      ) {
        return true;
      }
    }
  }
  return false;
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
    const currentPropValue = props.formData[formId.value] || [];
    if (
      JSON.stringify(rawTableData.value) !== JSON.stringify(currentPropValue)
    ) {
      nextTick(() => {
        emit('update:field', {
          fieldId: formId.value,
          value: rawTableData.value,
        });
      });
    }
  }
};

const addRow = () => {
  // Validation: Check if any unique column has exhausted its options
  const columns = props.field.options?.columns || [];
  for (const column of columns) {
    if (
      column.unique &&
      column.options &&
      Array.isArray(column.options) &&
      rawTableData.value.length >= column.options.length
    ) {
      notifyError(`All options for ${column.label} have been used.`);
      return;
    }
  }

  rawTableData.value.push(createEmptyRow());
  const currentPropValue = props.formData[formId.value] || [];
  if (JSON.stringify(rawTableData.value) !== JSON.stringify(currentPropValue)) {
    nextTick(() => {
      emit('update:field', {
        fieldId: formId.value,
        value: rawTableData.value,
      });
    });
  }
};

const removeRow = (rowIndex: number) => {
  rawTableData.value.splice(rowIndex, 1);
  const currentPropValue = props.formData[formId.value] || [];
  if (JSON.stringify(rawTableData.value) !== JSON.stringify(currentPropValue)) {
    nextTick(() => {
      emit('update:field', {
        fieldId: formId.value,
        value: rawTableData.value,
      });
    });
  }
};

const selectedIndices = ref<Set<number>>(new Set());

const removableRowsIndices = computed(() => {
  return rawTableData.value
    .map((_, index) => index)
    .filter((index) => isRowRemovable(index));
});

const isAllSelected = computed(() => {
  const removable = removableRowsIndices.value;
  return (
    removable.length > 0 &&
    removable.every((index) => selectedIndices.value.has(index))
  );
});

function toggleSelectAll() {
  const removable = removableRowsIndices.value;
  if (isAllSelected.value) {
    selectedIndices.value.clear();
  } else {
    removable.forEach((index) => selectedIndices.value.add(index));
  }
}

function toggleRowSelection(index: number, checked: boolean) {
  if (checked) {
    selectedIndices.value.add(index);
  } else {
    selectedIndices.value.delete(index);
  }
}

function deleteSelected() {
  const indices = [...selectedIndices.value].sort((a, b) => b - a);
  indices.forEach((index) => {
    if (isRowRemovable(index)) {
      rawTableData.value.splice(index, 1);
    }
  });
  selectedIndices.value.clear();
  const currentPropValue = props.formData[formId.value] || [];
  if (JSON.stringify(rawTableData.value) !== JSON.stringify(currentPropValue)) {
    nextTick(() => {
      emit('update:field', {
        fieldId: formId.value,
        value: rawTableData.value,
      });
    });
  }
}
</script>

<style scoped>
/* Remove margin from FormField when it's compact inside a table */
:deep(.form-field-compact) {
  margin-bottom: 0;
}
</style>
