<template>
  <div class="space-y-6">
    <!-- Display Table -->
    <div v-if="items.length > 0" class="overflow-x-auto rounded-lg border">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 border-b">
          <tr>
            <th
              v-if="field.itemStructure.key"
              class="text-muted-foreground px-4 py-3 text-left font-medium"
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
          <tr
            v-for="(item, index) in items"
            :key="index"
            class="hover:bg-muted/50 border-b transition-colors"
          >
            <!-- Keyed -->
            <td v-if="field.itemStructure.key" class="px-4 py-3 font-medium">
              {{ getKeyLabel(item.key) }}
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
            <td v-if="isEditMode" class="px-4 py-3 text-center">
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
        </tbody>
      </table>
    </div>
    <div
      v-else-if="!isEditMode"
      class="text-muted-foreground rounded-lg border border-dashed p-6 text-center"
    >
      No items have been added.
    </div>

    <!-- Add Item Form (Edit Mode Only) -->
    <div v-if="isEditMode" class="bg-muted/20 space-y-4 rounded-lg border p-4">
      <h3 class="font-medium">Add New Item</h3>

      <!-- Keyed: Dropdown to select item type -->
      <div v-if="field.itemStructure.key" class="space-y-1">
        <Label>Item Type</Label>
        <Select v-model="selectedKey">
          <SelectTrigger>
            <SelectValue placeholder="Select an item..." />
          </SelectTrigger>
          <SelectContent class="max-h-60">
            <SelectItem
              v-for="option in availableKeys"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Input fields for the selected item type -->
      <div
        v-if="selectedKey || !field.itemStructure.key"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div
          v-for="valueField in field.itemStructure.values"
          :key="valueField.id"
          class="space-y-1"
        >
          <Label :for="`new-item-${valueField.id}`">{{
            valueField.label
          }}</Label>
          <Input
            :id="`new-item-${valueField.id}`"
            v-model="newItemData[valueField.id]"
            :disabled="isFieldDisabled(valueField.id)"
            :placeholder="
              isFieldDisabled(valueField.id) ? 'Not applicable' : ''
            "
          />
        </div>
      </div>

      <!-- Add Button -->
      <Button @click="addItem" :disabled="!canAddItem">
        <Plus class="mr-1 h-4 w-4" />
        Add Item
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { Plus, X } from 'lucide-vue-next';
import type { FormTemplateField, KeyedRow, UnkeyedRow } from '../types';
import {
  Button,
  Input,
  Label,
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

const items = ref<KeyedRow[] | UnkeyedRow[]>(
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
    emit('update:field', { fieldId: props.field.id, value: newItems });
  },
  { deep: true },
);

// --- State for adding new items ---
const selectedKey = ref<string | null>(null);
const newItemData = ref<Record<string, any>>({});

// --- Computed properties for UI logic ---
const availableKeys = computed(() => {
  if (!props.field.itemStructure?.key) {
    return [];
  }
  const usedKeys = new Set((items.value as KeyedRow[]).map((item) => item.key));
  return props.field.itemStructure.key.options.filter(
    (opt) => !usedKeys.has(opt.value),
  );
});

const selectedKeyOption = computed(() => {
  if (!selectedKey.value || !props.field.itemStructure?.key) {
    return null;
  }
  return props.field.itemStructure.key.options.find(
    (opt) => opt.value === selectedKey.value,
  );
});

const isFieldDisabled = (fieldId: string): boolean => {
  // Unkeyed items never have disabled fields
  if (!props.field.itemStructure?.key) {
    return false;
  }
  // Check for the disabledFields property on the selected option
  const disabledFields = selectedKeyOption.value?.disabledFields || [];
  return disabledFields.includes(fieldId);
};

const canAddItem = computed(() => {
  // For unkeyed, just check if all fields are filled
  if (!props.field.itemStructure.key) {
    return props.field.itemStructure.values.every(
      (field) =>
        newItemData.value[field.id] !== '' &&
        newItemData.value[field.id] !== null &&
        newItemData.value[field.id] !== undefined,
    );
  }

  // For keyed, check that a key is selected
  if (!selectedKey.value) {
    return false;
  }

  // And that all ENABLED fields are filled
  return props.field.itemStructure.values.every((field) => {
    if (isFieldDisabled(field.id)) {
      return true; // Ignore disabled fields
    }
    return (
      newItemData.value[field.id] !== '' &&
      newItemData.value[field.id] !== null &&
      newItemData.value[field.id] !== undefined
    );
  });
});

// --- Watchers ---
watch(selectedKey, () => {
  // Reset input fields when the selected item type changes
  newItemData.value = {};
});

// --- Methods ---
const getKeyLabel = (key: string): string => {
  if (!props.field.itemStructure?.key) return key;
  const option = props.field.itemStructure.key.options.find(
    (opt) => opt.value === key,
  );
  return option?.label || key;
};

const addItem = () => {
  if (!canAddItem.value) return;

  if (props.field.itemStructure?.key) {
    // Keyed
    const newRow: KeyedRow = {
      key: selectedKey.value!,
      values: { ...newItemData.value },
    };
    // Ensure all possible values are present, even if empty/disabled
    props.field.itemStructure.values.forEach((val) => {
      if (!(val.id in newRow.values)) {
        newRow.values[val.id] = '';
      }
    });
    items.value.push(newRow);
  } else {
    // Unkeyed
    const newRow: UnkeyedRow = { ...newItemData.value };
    items.value.push(newRow);
  }

  // Reset form
  selectedKey.value = null;
  newItemData.value = {};
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
};
</script>
