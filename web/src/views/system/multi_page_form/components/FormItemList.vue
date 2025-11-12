<template>
  <div class="space-y-4">
    <!-- Items List -->
    <div
      v-for="(item, index) in items"
      :key="index"
      class="space-y-3 rounded-lg border p-4"
    >
      <!-- Keyed -->
      <template v-if="field.itemStructure.key">
        <div class="mb-2 text-sm font-medium">{{ getKeyLabel(item.key) }}</div>
        <div
          v-for="valueField in field.itemStructure.values"
          :key="valueField.id"
          class="space-y-1"
        >
          <Label :for="`${field.id}-${index}-${valueField.id}`">{{
            valueField.label
          }}</Label>
          <Input
            v-if="isEditMode"
            :id="`${field.id}-${index}-${valueField.id}`"
            v-model="item.values[valueField.id]"
          />
          <div v-else class="text-muted-foreground text-sm">
            {{ item.values[valueField.id] || '—' }}
          </div>
        </div>
      </template>
      <!-- Unkeyed -->
      <template v-else>
        <div
          v-for="valueField in field.itemStructure.values"
          :key="valueField.id"
          class="space-y-1"
        >
          <Label :for="`${field.id}-${index}-${valueField.id}`">{{
            valueField.label
          }}</Label>
          <Input
            v-if="isEditMode"
            :id="`${field.id}-${index}-${valueField.id}`"
            v-model="item[valueField.id]"
          />
          <div v-else class="text-muted-foreground text-sm">
            {{ item[valueField.id] || '—' }}
          </div>
        </div>
      </template>

      <Button
        v-if="isEditMode"
        @click="removeItem(index)"
        variant="destructive"
        size="sm"
        class="mt-2"
      >
        <Trash2 class="mr-1 h-4 w-4" />
        Remove
      </Button>
    </div>

    <!-- Add Item Controls (Edit Mode Only) -->
    <div v-if="isEditMode" class="pt-2">
      <!-- Keyed variant -->
      <div v-if="field.itemStructure.key" class="flex gap-2">
        <Select v-model="newItemKey">
          <SelectTrigger class="w-[200px]">
            <SelectValue placeholder="Select item type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in availableKeys"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button @click="addItem" :disabled="!newItemKey">
          <Plus class="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>
      <!-- Unkeyed variant -->
      <div v-else>
        <Button @click="addItem">
          <Plus class="mr-1 h-4 w-4" />
          Add New Item
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
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

const items = ref(props.formData[props.field.id] || []);
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

const availableKeys = computed(() => {
  if (!props.field.itemStructure?.key) {
    return [];
  }
  const usedKeys = new Set(items.value.map((item: KeyedRow) => item.key));
  return props.field.itemStructure.key.options.filter(
    (opt) => !usedKeys.has(opt.value),
  );
});

const newItemKey = ref(availableKeys.value[0]?.value);

watch(availableKeys, (newKeys) => {
  if (!newKeys.some((k) => k.value === newItemKey.value)) {
    newItemKey.value = newKeys[0]?.value;
  }
});

const getKeyLabel = (key: string): string => {
  if (!props.field.itemStructure?.key) return key;
  const option = props.field.itemStructure.key.options.find(
    (opt) => opt.value === key,
  );
  return option?.label || key;
};

const addItem = () => {
  if (props.field.itemStructure?.key) {
    // Keyed
    if (!newItemKey.value) return;
    const newRow: KeyedRow = {
      key: newItemKey.value,
      values: {},
    };
    props.field.itemStructure.values.forEach((val) => {
      newRow.values[val.id] = ''; // default value
    });
    items.value.push(newRow);
  } else {
    // Unkeyed
    const newRow: UnkeyedRow = {};
    props.field.itemStructure?.values.forEach((val) => {
      newRow[val.id] = ''; // default value
    });
    items.value.push(newRow);
  }
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
};
</script>
