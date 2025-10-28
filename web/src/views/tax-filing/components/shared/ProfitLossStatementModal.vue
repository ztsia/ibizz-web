<script lang="ts" setup>
import { computed, ref, nextTick } from 'vue';
import ProfitLossModal from './ProfitLossModal.vue';
import BalanceSheetModal from './BalanceSheetModal.vue';
import type { ExtractedItem } from '#/store/tax-filing';

interface Props {
  disabled?: boolean;
  showSingleReviewButton?: boolean;
  modalType?: 'trading' | 'manufacturing' | 'both';
  statementType?: 'profit-loss' | 'balance-sheet';
}

interface Emits {
  (e: 'review-all'): void;
  (e: 'item-updated', data: { item: ExtractedItem; category: string }): void;
  (e: 'update:statementType', value: 'profit-loss' | 'balance-sheet'): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showSingleReviewButton: true,
  modalType: 'both',
  statementType: 'profit-loss',
});

const emit = defineEmits<Emits>();

// Component refs
const profitLossModalRef = ref<InstanceType<typeof ProfitLossModal> | null>(null);
const balanceSheetModalRef = ref<InstanceType<typeof BalanceSheetModal> | null>(null);

// Internal state for current modal type
const currentModalType = ref<'profit-loss' | 'balance-sheet'>(props.statementType);

// Determine which modal to show based on internal state
const showProfitLossModal = computed(
  () => currentModalType.value === 'profit-loss',
);
const showBalanceSheetModal = computed(
  () => currentModalType.value === 'balance-sheet',
);

// Modal opening functions with proper state management
const openProfitLossModal = async () => {
  currentModalType.value = 'profit-loss';
  emit('update:statementType', 'profit-loss');
  await nextTick();
  profitLossModalRef.value?.profitLossModalApi?.open();
};

const openBalanceSheetModal = async () => {
  currentModalType.value = 'balance-sheet';
  emit('update:statementType', 'balance-sheet');
  await nextTick();
  balanceSheetModalRef.value?.balanceSheetModalApi?.open();
};

// Expose modal APIs
defineExpose({
  profitLossModalApi: () => profitLossModalRef.value?.profitLossModalApi,
  balanceSheetModalApi: () => balanceSheetModalRef.value?.balanceSheetModalApi,
  openProfitLossModal,
  openBalanceSheetModal,
  closeProfitLossModal: () => profitLossModalRef.value?.profitLossModalApi?.close(),
  closeBalanceSheetModal: () => balanceSheetModalRef.value?.balanceSheetModalApi?.close(),
});
</script>

<template>
  <!-- Profit & Loss Modal -->
  <ProfitLossModal
    v-if="showProfitLossModal"
    ref="profitLossModalRef"
    :disabled="disabled"
    :show-single-review-button="showSingleReviewButton"
    :modal-type="modalType"
    @review-all="emit('review-all')"
    @item-updated="emit('item-updated', $event)"
  />

  <!-- Balance Sheet Modal -->
  <BalanceSheetModal
    v-if="showBalanceSheetModal"
    ref="balanceSheetModalRef"
    :disabled="disabled"
    :show-single-review-button="showSingleReviewButton"
    :modal-type="modalType"
    @review-all="emit('review-all')"
    @item-updated="emit('item-updated', $event)"
  />
</template>
