<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <div
        class="border-input relative flex items-center overflow-hidden rounded-md border focus-within:border-blue-500"
      >
        <Input
          v-model="displayedValue"
          type="text"
          placeholder="Select or type..."
          class="h-10 w-full rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          @input="handleTyping"
          @keydown.down.prevent="handleArrowDown"
          @keydown.up.prevent="handleArrowUp"
          @keydown.enter.prevent="handleEnter"
          @keydown.esc.prevent="handleEscape"
        />
        <Button
          type="button"
          variant="outline"
          class="-ml-px h-10 rounded-l-none border-l-0 px-3 focus-visible:ring-0 focus-visible:ring-offset-0"
          @mousedown.prevent
        >
          <ChevronsUpDown class="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    </PopoverTrigger>
    <PopoverContent class="z-[999] w-[--radix-popover-trigger-width] p-0">
      <div class="max-h-60 overflow-y-auto">
        <div v-if="filteredItems.length === 0" class="py-6 text-center text-sm">
          No results found.
        </div>
        <div
          v-for="(item, index) in filteredItems"
          :key="item.id"
          :ref="
            (el) => {
              if (el) itemRefs[index] = el;
            }
          "
          class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none"
          :class="{
            'bg-accent text-accent-foreground': highlightedIndex === index,
          }"
          @click="handleSelect(item)"
        >
          {{ item.columns[displayKey] }}
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import * as lookupService from '../services';
import { ChevronsUpDown } from 'lucide-vue-next';
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@vben-core/shadcn-ui';

const props = defineProps<{
  modelValue: any;
  lookupSlug: string;
}>();

const emit = defineEmits(['update:modelValue', 'lookup-error']);

const items = ref<any[]>([]);
const displayKey = ref('value');
const valueKey = ref('value');
const open = ref(false);

// The value displayed in the input. Can be user input or a highlighted item's label.
const displayedValue = ref('');
// The query used for filtering. Only updated when the user types.
const internalSearchQuery = ref('');

const highlightedIndex = ref(-1);
const itemRefs = ref<HTMLElement[]>([]);

// Sync displayedValue with modelValue when the component loads or modelValue changes externally
watch(
  () => props.modelValue,
  (newValue) => {
    displayedValue.value = newValue;
    internalSearchQuery.value = ''; // Reset internal search
  },
  { immediate: true },
);

// When popover closes, reset state
watch(open, (isOpen) => {
  if (!isOpen) {
    highlightedIndex.value = -1;
    // Revert the displayed value to the last saved value
    displayedValue.value = props.modelValue;
  }
});

const filteredItems = computed(() => {
  if (!internalSearchQuery.value) {
    return items.value;
  }
  return items.value.filter((item) => {
    const value = item.columns[displayKey.value];
    return (
      value &&
      typeof value === 'string' &&
      value.toLowerCase().includes(internalSearchQuery.value.toLowerCase())
    );
  });
});

watch(filteredItems, () => {
  highlightedIndex.value = -1;
  itemRefs.value = [];
});

// Only update the displayed value during navigation, not the internal search query
watch(highlightedIndex, (newIndex) => {
  if (newIndex > -1) {
    const highlightedItem = filteredItems.value[newIndex];
    if (highlightedItem) {
      displayedValue.value = highlightedItem.columns[displayKey.value];
      itemRefs.value[newIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }
});

function handleTyping(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  internalSearchQuery.value = value;
  if (!open.value) {
    open.value = true;
  }
}

function handleSelect(item: any) {
  const selectedValue = item.columns[valueKey.value];
  emit('update:modelValue', selectedValue);
  displayedValue.value = selectedValue;
  internalSearchQuery.value = '';
  open.value = false;
}

function handleArrowDown() {
  if (!open.value) open.value = true;
  if (filteredItems.value.length > 0) {
    highlightedIndex.value =
      (highlightedIndex.value + 1) % filteredItems.value.length;
  }
}

function handleArrowUp() {
  if (!open.value) open.value = true;
  if (filteredItems.value.length > 0) {
    highlightedIndex.value =
      (highlightedIndex.value - 1 + filteredItems.value.length) %
      filteredItems.value.length;
  }
}

function handleEnter() {
  if (highlightedIndex.value > -1) {
    const highlightedItem = filteredItems.value[highlightedIndex.value];
    handleSelect(highlightedItem);
  } else {
    // Commit the custom typed text
    emit('update:modelValue', displayedValue.value);
    open.value = false;
  }
}

function handleEscape() {
  open.value = false;
}

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
          break;
        }
      }
      if (!descriptiveKey) {
        descriptiveKey = keys[0] || 'id';
      }
      displayKey.value = descriptiveKey;
      valueKey.value = descriptiveKey;
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
