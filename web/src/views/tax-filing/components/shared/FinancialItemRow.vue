<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Input, InputNumber, Tooltip } from 'ant-design-vue';
import { Calculator, ArrowRight, Trash2, Info } from 'lucide-vue-next';
import type { FinancialItem } from '#/store/tax-filing';

interface Props {
  item: FinancialItem;
  index: number;
  disabled?: boolean;
  canEdit?: boolean;
  isReviewed?: boolean;
  isCritical?: boolean;
  hasRoundingIndicator?: boolean;
  wasRounded?: boolean;
  originalAmount?: number;
}

interface Emits {
  (e: 'update-amount', item: FinancialItem, value: any): void;
  (e: 'update-description', item: FinancialItem, value: string): void;
  (e: 'auto-round', item: FinancialItem, index: number): void;
  (e: 'remove-item', item: FinancialItem): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  canEdit: true,
  isReviewed: false,
  isCritical: false,
  hasRoundingIndicator: false,
  wasRounded: false,
  originalAmount: 0,
});

const emit = defineEmits<Emits>();

// Local state for tracking rounding
const originalAmountBeforeRounding = ref<number | null>(null);
const wasAutoRounded = ref(false);

// Helper functions
const formatNumber = (value: number) => {
  if (value === 0) return '0';
  if (!value) return '0';

  // Handle negative numbers properly
  const absValue = Math.abs(value);
  const formattedValue = absValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

const formatDescription = (description: string) => {
  return description
    .replaceAll('_', ' ')
    .replaceAll(/\b\w/g, (l) => l.toUpperCase());
};

// Event handlers
const handleAmountChange = (value: any) => {
  if (value && Math.round(value) !== value) {
    // Store original amount before rounding
    originalAmountBeforeRounding.value = value;
    wasAutoRounded.value = true;
    // Auto-round the value
    const roundedValue = Math.round(value);
    emit('update-amount', props.item, roundedValue);
  } else {
    // Reset rounding state if value is already rounded
    if (value && Math.round(value) === value) {
      wasAutoRounded.value = false;
      originalAmountBeforeRounding.value = null;
    }
    emit('update-amount', props.item, value);
  }
};

const handleDescriptionChange = (value: string) => {
  emit('update-description', props.item, value);
};

const handleRemoveItem = () => {
  emit('remove-item', props.item);
};

// Computed properties
const shouldShowRoundingIcon = computed(() => {
  return wasAutoRounded.value || props.wasRounded || props.hasRoundingIndicator;
});

const displayOriginalAmount = computed(() => {
  return originalAmountBeforeRounding.value || props.originalAmount || 0;
});
</script>

<template>
  <div
    :class="[
      'flex items-center justify-between rounded px-2 py-1',
      isReviewed
        ? 'border border-gray-200 bg-gray-50 opacity-75'
        : 'hover:bg-gray-50',
    ]"
  >
    <div class="flex items-center gap-2">
      <Input
        v-if="canEdit"
        v-model:value="item.description"
        @change="(e) => handleDescriptionChange(e.target.value)"
        class="w-48"
        size="small"
        placeholder="Enter description"
      />
      <span v-else>{{ formatDescription(item.description) }}</span>
      <div class="flex items-center gap-1">
        <span
          v-if="isCritical"
          class="inline-flex items-center rounded border px-2 py-0.5 text-xs"
        >
          Critical
        </span>
        <span
          v-if="isReviewed"
          class="inline-flex items-center rounded border px-2 py-0.5 text-xs"
        >
          ✓ Reviewed
        </span>
        <span
          v-else
          class="inline-flex items-center rounded border px-2 py-0.5 text-xs"
        >
          Pending
        </span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div v-if="canEdit" class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <InputNumber
            v-model:value="item.amount"
            :precision="0"
            :step="1"
            :class="[
              'w-32',
              shouldShowRoundingIcon ? 'border-orange-300 bg-orange-50' : ''
            ]"
            @change="handleAmountChange"
          />
          <Tooltip v-if="shouldShowRoundingIcon" placement="top">
            <template #title>
              <div class="flex items-center gap-2">
                <Calculator class="h-3 w-3" />
                <span>Original: {{ formatNumber(displayOriginalAmount) }}</span>
                <ArrowRight class="h-3 w-3" />
                <span>Rounded: {{ formatNumber(item.amount) }}</span>
              </div>
            </template>
            <Info class="h-4 w-4 text-orange-500 cursor-help hover:text-orange-600" />
          </Tooltip>
        </div>

        <button
          @click="handleRemoveItem"
          class="ml-2 hover:text-red-600"
          title="Delete Item"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
      <div v-else class="flex items-center gap-2">
        <div class="flex items-center gap-3">
          <span class="min-w-[100px] text-right font-medium">
            {{ formatNumber(item.amount) }}
          </span>
          <Tooltip v-if="shouldShowRoundingIcon" placement="top">
            <template #title>
              <div class="flex items-center gap-2">
                <Calculator class="h-3 w-3" />
                <span>Original: {{ formatNumber(displayOriginalAmount) }}</span>
                <ArrowRight class="h-3 w-3" />
                <span>Rounded: {{ formatNumber(item.amount) }}</span>
              </div>
            </template>
            <Info class="h-4 w-4 text-orange-500 cursor-help hover:text-orange-600" />
          </Tooltip>
        </div>
        <span class="text-xs italic text-gray-400"> Reviewed </span>
      </div>
    </div>
  </div>
</template>
