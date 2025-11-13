<template>
  <div class="space-y-4">
    <!-- Display Table -->
    <div class="overflow-x-auto rounded-lg border">
      <table class="w-full text-sm table-fixed">
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
              <td v-if="field.itemStructure.key" class="w-1/4 px-4 py-3 font-medium">
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
              <td v-if="field.itemStructure.key" class="w-1/4 px-4 py-3 font-medium">
                <Select v-model="item.key">
                  <SelectTrigger class="h-auto min-h-0 py-2 text-left">
                    <span v-if="item.key" class="truncate">
                      {{ getKeyLabel(item.key) }}
                    </span>
                    <span v-else class="text-muted-foreground">
                      Select an item...
                    </span>
                  </SelectTrigger>
                  <SelectContent class="max-h-60 w-[--radix-select-trigger-width]">
                    <SelectItem
                      v-for="option in getAvailableKeysForRow(item)"
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
                  :is-edit-mode="!isFieldDisabled(item, valueField.id)"
                  :compact="true"
                  @update:field="
                    (payload) =>
                      handleItemFieldUpdate(item, payload.fieldId, payload.value)
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
import { ref, watch } from 'vue';
import { Plus, X } from 'lucide-vue-next';
import type { FormTemplateField, KeyedRow, UnkeyedRow } from '../types';
import FormField from './fields/FormField.vue';
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@vben-core/shadcn-ui';

const props = defineProps<{
  field: FormTemplateField;
  formData: Record<string, any>;
  isEditMode: boolean;
}>();

const emit = defineEmits(['update:field']);

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
    // If we are transitioning from Edit Mode to View Mode, clean up empty rows
    if (!isEditing && wasEditing) {
      items.value = items.value.filter((item) => {
        if (props.field.itemStructure.key) {
          return (item as KeyedRow).key !== null && (item as KeyedRow).key !== undefined;
        }
        // Add logic for unkeyed items if needed, for now, keep them
        return true;
      });
    }
  },
);

const getAvailableKeysForRow = (currentItem: KeyedRow) => {
  if (!props.field.itemStructure?.key) return [];

  // If repeating keys are allowed, return all options
  if (props.field.allowRepeating) {
    return props.field.itemStructure.key.options;
  }

  // Otherwise, filter out keys used in OTHER rows
  const usedKeysInOtherRows = new Set(
    (items.value as KeyedRow[])
      .filter((item) => item !== currentItem)
      .map((item) => item.key),
  );

  return props.field.itemStructure.key.options.filter(
    (opt) => !usedKeysInOtherRows.has(opt.value),
  );
};

const isFieldDisabled = (item: KeyedRow, fieldId: string): boolean => {
  // Unkeyed items never have disabled fields
  if (!props.field.itemStructure?.key) {
    return false;
  }

  // Disable all value fields if no key is selected for the row
  if (!item.key) {
    return true;
  }

  // Find the selected option for the current row's key
  const selectedOption = props.field.itemStructure.key.options.find(
    (opt) => opt.value === item.key,
  );

  // Check for the disabledFields property on the selected option
  const disabledFields = selectedOption?.disabledFields || [];
  return disabledFields.includes(fieldId);
};

const getKeyLabel = (key: string): string => {
  if (!props.field.itemStructure?.key) return key;
  const option = props.field.itemStructure.key.options.find(
    (opt) => opt.value === key,
  );
  return option?.label || key;
};

const addRow = () => {
  if (props.field.itemStructure?.key) {
    // Keyed
    const newRow: KeyedRow = {
      key: null, // Start with null key
      values: {},
    };
    // Pre-fill value keys to ensure reactivity
    props.field.itemStructure.values.forEach((val) => {
      newRow.values[val.id] = '';
    });
    items.value.push(newRow);
  } else {
    // Unkeyed
    const newRow: UnkeyedRow = {};
    props.field.itemStructure.values.forEach((val) => {
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
</script>

