<template>
  <div v-if="field.itemStructure" class="space-y-4">
    <!-- PDF Control (View Mode Only) -->
    <div v-if="!isEditMode" class="flex justify-end">
      <GeneratePdfControl
        :title="field.label"
        :submission-year="submissionYear"
        :headers="pdfHeaders"
        :all-rows="pdfRows"
        :selected-row-ids="[]"
      />
    </div>

    <!-- Display Table -->
    <div class="overflow-x-auto rounded-lg border">
      <table class="w-full table-fixed text-sm">
        <thead class="bg-muted/50 border-b">
          <tr>
            <th
              v-if="field.itemStructure.key"
              class="text-muted-foreground w-1/4 px-4 py-3 text-left font-medium"
            >
              {{ field.itemStructure.key.label }}
            </th>
            <th
              v-for="valueField in field.itemStructure.values"
              :key="valueField.id"
              class="text-muted-foreground px-4 py-3 text-left font-medium"
            >
              {{ valueField.label }}
            </th>
            <th v-if="isEditMode" class="w-[50px]">
              <span class="sr-only">Remove</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- VIEW MODE ROWS -->
          <template v-if="!isEditMode">
            <tr
              v-for="(item, index) in items"
              :key="index"
              class="hover:bg-muted/50 border-b transition-colors"
            >
              <td
                v-if="field.itemStructure.key"
                class="w-1/4 px-4 py-3 font-medium"
              >
                {{ getKeyLabel((item as KeyedRow).key || '') }}
              </td>
              <td
                v-for="valueField in field.itemStructure.values"
                :key="valueField.id"
                class="text-muted-foreground px-4 py-3"
              >
                {{
                  field.itemStructure.key
                    ? item.values[valueField.id]
                    : item[valueField.id] || '—'
                }}
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td
                :colspan="
                  (field.itemStructure.key ? 1 : 0) +
                  field.itemStructure.values.length +
                  (isEditMode ? 1 : 0)
                "
                class="text-muted-foreground border-t p-6 text-center"
              >
                No items have been added.
              </td>
            </tr>
          </template>

          <!-- EDIT MODE ROWS -->
          <template v-else>
            <tr
              v-for="(item, index) in items"
              :key="index"
              class="hover:bg-muted/50 border-b transition-colors"
            >
              <!-- Key Dropdown -->
              <td
                v-if="field.itemStructure.key"
                class="w-1/4 px-4 py-3 font-medium"
              >
                <Select v-model="item.key">
                  <SelectTrigger class="h-auto min-h-0 py-2 text-left">
                    <span v-if="item.key" class="truncate">
                      {{ getKeyLabel(item.key) }}
                    </span>
                    <span v-else class="text-muted-foreground">
                      Select an item...
                    </span>
                  </SelectTrigger>
                  <SelectContent
                    class="max-h-60 w-[--radix-select-trigger-width]"
                  >
                    <SelectItem
                      v-for="option in getAvailableKeysForRow(item as KeyedRow)"
                      :key="option.value"
                      :value="option.value"
                      class="whitespace-normal"
                    >
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <!-- Value Inputs -->
              <td
                v-for="valueField in field.itemStructure.values"
                :key="valueField.id"
                class="px-4 py-3"
              >
                <FormField
                  :field="logAndReturnField(valueField)"
                  :form-data="item.values"
                  :is-edit-mode="
                    !isFieldDisabled(item as KeyedRow, valueField.id)
                  "
                  :compact="true"
                  @update:field="
                    (payload) =>
                      handleItemFieldUpdate(
                        item as KeyedRow,
                        payload.fieldId,
                        payload.value,
                      )
                  "
                />
              </td>
              <!-- Remove Button -->
              <td class="px-4 py-3 text-center">
                <Button
                  @click="removeItem(index)"
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                >
                  <X class="h-4 w-4" />
                </Button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Add Row Button -->
    <div v-if="isEditMode">
      <Button @click="addRow" variant="outline">
        <Plus class="mr-1 h-4 w-4" />
        Add Row
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, inject } from 'vue';
import { Plus, X } from 'lucide-vue-next';
import type { FormTemplateField, KeyedRow, UnkeyedRow } from '../../types';
// @ts-ignore
import { FormField } from './';
// @ts-ignore
import { GeneratePdfControl } from '../';
import {
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@vben-core/shadcn-ui';

const props = defineProps<{
  field: FormTemplateField;
  formData: Record<string, any>;
  isEditMode: boolean;
  showPdf?: boolean;
  pdfTitle?: string;
  pdfSubmissionYear?: number;
  pdfHeaders?: any[];
  pdfLookupSlug?: string;
  pdfSelectedRowIds?: string[];
}>();

const emit = defineEmits(['update:field']);

// Inject submissionYear with fallback
const submissionYear = inject(
  'submissionYear',
  computed(() => new Date().getFullYear()),
);

const items = ref<Array<KeyedRow | UnkeyedRow>>(
  props.formData[props.field.id] || [],
);

watch(
  () => props.formData[props.field.id],
  (newVal) => {
    items.value = newVal || [];
  },
);

watch(
  items,
  (newItems) => {
    // Emit the current state, including empty rows, to the parent
    emit('update:field', { fieldId: props.field.id, value: newItems });
  },
  { deep: true },
);

// Watch for changes in edit mode to clean up empty rows
watch(
  () => props.isEditMode,
  (isEditing, wasEditing) => {
    if (!isEditing && wasEditing) {
      if (!props.field.itemStructure) return;
      items.value = items.value.filter((item) => {
        if (props.field.itemStructure.key) {
          return (
            (item as KeyedRow).key !== null &&
            (item as KeyedRow).key !== undefined
          );
        }
        return true;
      });
    }
  },
);

const getAvailableKeysForRow = (currentItem: KeyedRow) => {
  const options = props.field.itemStructure?.key?.options;
  if (!options) return [];

  if (props.field.allowRepeating) {
    return options;
  }

  const usedKeysInOtherRows = new Set(
    (items.value as KeyedRow[])
      .filter((item) => item !== currentItem)
      .map((item) => item.key),
  );

  return options.filter((opt) => !usedKeysInOtherRows.has(opt.value));
};

const isFieldDisabled = (item: KeyedRow, fieldId: string): boolean => {
  const options = props.field.itemStructure?.key?.options;
  if (!options) {
    return false;
  }

  if (!item.key) {
    return true;
  }

  const selectedOption = options.find((opt) => opt.value === item.key);
  const disabledFields = selectedOption?.disabledFields || [];
  return disabledFields.includes(fieldId);
};

const getKeyLabel = (key: string): string => {
  const options = props.field.itemStructure?.key?.options;
  if (!options) return key;
  const option = options.find((opt) => opt.value === key);
  return option?.label || key;
};

const addRow = () => {
  const itemStructure = props.field.itemStructure;
  if (!itemStructure) return;

  if (itemStructure.key) {
    const newRow: KeyedRow = {
      key: null,
      values: {},
    };
    itemStructure.values.forEach((val) => {
      newRow.values[val.id] = '';
    });
    items.value.push(newRow);
  } else {
    const newRow: UnkeyedRow = {};
    itemStructure.values.forEach((val) => {
      newRow[val.id] = '';
    });
    items.value.push(newRow);
  }
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
};

const handleItemFieldUpdate = (item: KeyedRow, fieldId: string, value: any) => {
  item.values[fieldId] = value;
};

const logAndReturnField = (valueField) => {
  const syntheticField = {
    ...valueField,
    inputType: valueField.inputType || 'text',
    isLabelHidden: true,
  };
  console.log('Passing to FormField:', syntheticField);
  return syntheticField;
};

// Computed: PDF Headers
const pdfHeaders = computed(() => {
  const itemStructure = props.field.itemStructure;
  if (!itemStructure) return [];

  const headers: Array<{ key: string; label: string }> = [];

  if (itemStructure.key) {
    headers.push({
      key: 'key',
      label: itemStructure.key.label,
    });
  }

  itemStructure.values.forEach((valueField) => {
    headers.push({
      key: valueField.id,
      label: valueField.label,
    });
  });

  return headers;
});

// Computed: PDF Rows
const pdfRows = computed(() => {
  const itemStructure = props.field.itemStructure;
  if (!itemStructure) return [];

  return items.value.map((item, index) => {
    const columns: Record<string, any> = {};

    if (itemStructure.key) {
      const keyedItem = item as KeyedRow;
      columns.key = getKeyLabel(keyedItem.key || '');

      itemStructure.values.forEach((valueField) => {
        columns[valueField.id] = keyedItem.values[valueField.id] || '';
      });
    } else {
      const unkeyedItem = item as UnkeyedRow;
      itemStructure.values.forEach((valueField) => {
        columns[valueField.id] = unkeyedItem[valueField.id] || '';
      });
    }

    return {
      id: String(index),
      columns,
    };
  });
});
</script>
