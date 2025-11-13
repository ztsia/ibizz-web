<template>
  <Select v-model="model">
    <SelectTrigger>
      <SelectValue placeholder="Select an option" />
    </SelectTrigger>
    <SelectContent class="max-h-60">
      <SelectGroup>
        <SelectItem
          v-for="item in items"
          :key="item.id"
          :value="item.columns[valueKey]"
        >
          {{ item.columns[displayKey] }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import * as lookupService from '../services';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vben-core/shadcn-ui';

const props = defineProps<{
  modelValue: any;
  lookupSlug: string;
}>();

const emit = defineEmits(['update:modelValue']);

const items = ref<any[]>([]);
const displayKey = ref('value');
const valueKey = ref('value');

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

onMounted(async () => {
  try {
    const result = await lookupService.listItems(props.lookupSlug, {
      perPage: 1000,
    });
    const fetchedItems = Array.isArray(result) ? result : result?.items || [];

    if (fetchedItems.length > 0) {
      const keys = Object.keys(fetchedItems[0].columns || {});

      const rankedKeywords = [
        'name',
        'title',
        'label',
        'display',
        'description',
        'desc',
        'value',
      ];
      let descriptiveKey = '';

      for (const keyword of rankedKeywords) {
        const foundKey = keys.find((key) =>
          key.toLowerCase().includes(keyword),
        );
        if (foundKey) {
          descriptiveKey = foundKey;
          break; // Stop at the first, highest-ranked match
        }
      }

      if (!descriptiveKey) {
        descriptiveKey = keys[0] || 'id'; // Fallback
      }

      displayKey.value = descriptiveKey;
      valueKey.value = descriptiveKey; // Set both to the same key
    }
    items.value = fetchedItems;
  } catch (error) {
    console.error(
      `[LookupSelect] Failed to load items for lookup slug "${props.lookupSlug}":`,
      error,
    );
    emit('lookup-error', error);
  }
});
</script>
