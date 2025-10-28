<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { Button, InputNumber, Input, message, Modal } from 'ant-design-vue';
import {
  Check,
  Building2,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Calculator,
  ArrowRight,
} from 'lucide-vue-next';
import { useVbenModal } from '@vben/common-ui';
import { useTaxFilingStore } from '#/store/tax-filing';
import type { FinancialItem } from '#/store/tax-filing';
import FinancialItemRow from './FinancialItemRow.vue';
import AddFinancialItemForm from './AddFinancialItemForm.vue';

interface Props {
  disabled?: boolean;
  showSingleReviewButton?: boolean;
  modalType?: 'trading' | 'manufacturing' | 'both';
}

interface Emits {
  (e: 'review-all'): void;
  (e: 'item-updated', data: { item: FinancialItem; category: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showSingleReviewButton: true,
  modalType: 'both',
});

const emit = defineEmits<Emits>();

// Initialize Vben modal for Profit & Loss
const [ProfitLossModal, profitLossModalApi] = useVbenModal({
  title: 'Profit & Loss Statement',
  showConfirmButton: false,
});

// Expose modal API
defineExpose({
  profitLossModalApi,
});

// Store and client data
const taxFilingStore = useTaxFilingStore();
const clientInfo = computed(() => taxFilingStore.selectedClient);

// Initialize review statuses on mount
onMounted(() => {
  taxFilingStore.initializeReviewStatuses(taxFilingStore.plItems);
});

// Client-derived data
const companyName = computed(
  () =>
    clientInfo.value?.basicParticulars.companyName ||
    'Company Name Not Available',
);
const periodFrom = computed(() => {
  const currentYear = new Date().getFullYear();
  return `01/01/${currentYear}`;
});
const periodTo = computed(() => {
  const currentYear = new Date().getFullYear();
  return `31/12/${currentYear}`;
});

// Get financial data from store
const allFinancialItems = computed(() => {
  return taxFilingStore.plItems;
});

// Computed properties for P&L structure
const salesData = computed(() => {
  return allFinancialItems.value.filter((item) => item.type === 'sales');
});

const directCostData = computed(() => {
  return allFinancialItems.value.filter((item) => item.type === 'direct-cost');
});

const otherIncomeData = computed(() => {
  return allFinancialItems.value.filter((item) => item.type === 'other-income');
});

const expensesData = computed(() => {
  return allFinancialItems.value.filter(
    (item) => item.type === 'operating-expense',
  );
});

// Calculate totals
const totalSales = computed(() =>
  salesData.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalDirectCost = computed(() =>
  directCostData.value.reduce((sum, item) => sum + item.amount, 0),
);

const grossProfit = computed(() => totalSales.value - totalDirectCost.value);

const totalOtherIncome = computed(() =>
  otherIncomeData.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalExpenses = computed(() =>
  expensesData.value.reduce((sum, item) => sum + item.amount, 0),
);

const netProfit = computed(
  () => grossProfit.value + totalOtherIncome.value - totalExpenses.value,
);

// Review statistics
const reviewStats = computed(() => {
  const relevantExpenses = taxFilingStore.plItems;
  const totalItems = relevantExpenses.length;

  let reviewedItems = 0;
  let criticalItems = 0;
  let criticalReviewed = 0;

  relevantExpenses.forEach((expense, index) => {
    const itemId = `${expense.type}-${index}`;
    const reviewStatus = taxFilingStore.getReviewStatus(itemId);

    if (reviewStatus?.reviewed) {
      reviewedItems++;
    }

    if (reviewStatus?.critical || expense.amount >= 50_000) {
      criticalItems++;
      if (reviewStatus?.reviewed) {
        criticalReviewed++;
      }
    }
  });

  const allCriticalReviewed =
    criticalItems > 0 && criticalReviewed === criticalItems;
  const overallProgress =
    totalItems > 0 ? Math.round((reviewedItems / totalItems) * 100) : 0;
  const allReviewed = totalItems > 0 && reviewedItems === totalItems;

  return {
    totalItems,
    reviewedItems,
    totalCritical: criticalItems,
    criticalReviewed,
    allCriticalReviewed,
    overallProgress,
    allReviewed,
    canComplete: allCriticalReviewed,
  };
});

// Helper functions
const formatNumber = (value: number) => {
  if (!value) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const formatDescription = (description: string) => {
  return description
    .replaceAll('_', ' ')
    .replaceAll(/\b\w/g, (l) => l.toUpperCase());
};

const getReviewStatus = (itemId: string) => {
  return taxFilingStore.getReviewStatus(itemId);
};

const isItemCritical = (expense: FinancialItem, index: number): boolean => {
  const relevantItems = taxFilingStore.plItems;
  const actualIndex = relevantItems.findIndex(
    (item) =>
      item.type === expense.type &&
      item.description === expense.description &&
      item.amount === expense.amount,
  );

  if (actualIndex === -1) return false;

  const itemId = `${expense.type}-${actualIndex}`;
  const reviewStatus = getReviewStatus(itemId);
  return reviewStatus?.critical || false;
};

const isItemReviewed = (expense: FinancialItem, index: number): boolean => {
  const relevantItems = taxFilingStore.plItems;
  const actualIndex = relevantItems.findIndex(
    (item) =>
      item.type === expense.type &&
      item.description === expense.description &&
      item.amount === expense.amount,
  );

  if (actualIndex === -1) return false;

  const itemId = `${expense.type}-${actualIndex}`;
  const reviewStatus = getReviewStatus(itemId);
  return reviewStatus?.reviewed || false;
};

// Modal functions
const closeModal = () => {
  profitLossModalApi.close();
};

const handleReviewAll = () => {
  taxFilingStore.markAllAsReviewed('profit-loss');
};

// Helper function to check if an item can be edited
const canEditItem = (item: FinancialItem, index: number) => {
  if (props.disabled || reviewStats.value.allReviewed) return false;
  return !isItemReviewed(item, index);
};

// Helper function to check if an item is reviewed by creating proper itemId
const isItemReviewedByItem = (item: FinancialItem) => {
  const itemId = `${item.description}-${item.amount}-${item.sheet_source || ''}`;
  const reviewStatus = taxFilingStore.reviewStatuses.get(itemId);
  return reviewStatus?.reviewed || false;
};

// Store original amounts for review reference
const originalAmounts = ref<Map<string, number>>(new Map());
const showRoundingIndicators = ref<Map<string, boolean>>(new Map());
const roundedItems = ref<Set<string>>(new Set());

// Form input rounding tracking
const formOriginalAmounts = ref<Map<string, number>>(new Map());
const formRoundingPreviews = ref<Map<string, boolean>>(new Map());

// Auto-rounding function for review
const autoRoundAmount = (item: FinancialItem, index: number) => {
  const itemKey = `${item.type}-${item.description}-${item.sheet_source}`;

  // Store original amount if not already stored
  if (!originalAmounts.value.has(itemKey)) {
    originalAmounts.value.set(itemKey, item.amount);
  }

  // Round the amount
  const roundedAmount = Math.round(item.amount);
  if (roundedAmount !== item.amount) {
    roundedItems.value.add(itemKey);
    showRoundingIndicators.value.set(itemKey, true);
    updateExpenseAmountDirect(item, roundedAmount);
  }
};

// Function to round all items
const roundAllItems = () => {
  taxFilingStore.plItems.forEach((item, index) => {
    const itemKey = `${item.type}-${item.description}-${item.sheet_source}`;

    // Store original if not stored and has decimals
    if (!originalAmounts.value.has(itemKey) && item.amount % 1 !== 0) {
      originalAmounts.value.set(itemKey, item.amount);
    }

    // Round if needed
    const roundedAmount = Math.round(item.amount);
    if (roundedAmount !== item.amount) {
      roundedItems.value.add(itemKey);
      showRoundingIndicators.value.set(itemKey, true);
      updateExpenseAmountDirect(item, roundedAmount);
    }
  });
  message.success('All decimal amounts have been rounded');
};

// Function to approve rounding for an item
const approveRounding = (item: FinancialItem) => {
  const itemKey = `${item.type}-${item.description}-${item.sheet_source}`;
  const originalAmount = originalAmounts.value.get(itemKey);

  if (originalAmount !== undefined) {
    const roundedAmount = Math.round(originalAmount);
    updateExpenseAmountDirect(item, roundedAmount);
    message.success('Rounding approved and applied');
  }
};

// Function to reject rounding for an item
const rejectRounding = (item: FinancialItem) => {
  const itemKey = `${item.type}-${item.description}-${item.sheet_source}`;
  const originalAmount = originalAmounts.value.get(itemKey);

  if (originalAmount !== undefined) {
    // Clear rounding indicators
    originalAmounts.value.delete(itemKey);
    showRoundingIndicators.value.set(itemKey, false);
    roundedItems.value.delete(itemKey);
    message.success('Rounding rejected, original value kept');
  }
};

// Get original amount for display
const getOriginalAmount = (item: FinancialItem) => {
  const itemKey = `${item.type}-${item.description}-${item.sheet_source}`;
  return originalAmounts.value.get(itemKey) || item.amount;
};

// Check if item has rounding indicator
const hasRoundingIndicator = (item: FinancialItem) => {
  const itemKey = `${item.type}-${item.description}-${item.sheet_source}`;
  return (
    roundedItems.value.has(itemKey) &&
    originalAmounts.value.has(itemKey) &&
    item.amount % 1 !== 0
  );
};

// Check if amount was rounded (improved logic)
const wasAmountRounded = (item: FinancialItem) => {
  const itemKey = `${item.type}-${item.description}-${item.sheet_source}`;
  const original = originalAmounts.value.get(itemKey);
  // Check if we have an original amount and it's different from current rounded amount
  return (
    original !== undefined &&
    original !== item.amount &&
    Math.round(original) === item.amount
  );
};

// Get rounding status for styling
const getRoundingStatus = (item: FinancialItem) => {
  const itemKey = `${item.type}-${item.description}-${item.sheet_source}`;
  return {
    hasOriginal: originalAmounts.value.has(itemKey),
    wasRounded: roundedItems.value.has(itemKey),
    showIndicator: hasRoundingIndicator(item),
  };
};

// Form input rounding functions
const handleFormInput = (sectionType: string, value: number) => {
  const formKey = `form-${sectionType}`;

  // If the input has decimals, show rounding preview
  if (value % 1 === 0) {
    formRoundingPreviews.value.set(formKey, false);
  } else {
    formOriginalAmounts.value.set(formKey, value);
    formRoundingPreviews.value.set(formKey, true);
  }
};

const getFormOriginalAmount = (sectionType: string) => {
  const formKey = `form-${sectionType}`;
  return formOriginalAmounts.value.get(formKey) || 0;
};

const hasFormRoundingPreview = (sectionType: string) => {
  const formKey = `form-${sectionType}`;
  return formRoundingPreviews.value.get(formKey) || false;
};

const clearFormRounding = (sectionType: string) => {
  const formKey = `form-${sectionType}`;
  formOriginalAmounts.value.delete(formKey);
  formRoundingPreviews.value.set(formKey, false);
};

// Instant update functions
const updateExpenseAmount = (expense: FinancialItem, newAmount: any) => {
  if (props.disabled) return;
  if (isItemReviewedByItem(expense)) return;

  const numAmount = Number(newAmount) || 0;
  expense.amount = numAmount;

  // Find the index of the item in the profit & loss items
  const index = taxFilingStore.plItems.findIndex(
    (item) =>
      item.type === expense.type &&
      item.description === expense.description &&
      item.sheet_source === expense.sheet_source,
  );
  if (index !== -1) {
    taxFilingStore.updateHardcodedItem(index, expense, 'pl');
  }

  // Store original amount and show rounding indicator if decimal input
  if (numAmount % 1 !== 0) {
    const itemKey = `${expense.type}-${expense.description}-${expense.sheet_source}`;
    originalAmounts.value.set(itemKey, numAmount);
    showRoundingIndicators.value.set(itemKey, true);
    roundedItems.value.add(itemKey);
  }
};

// Enhanced update function that bypasses decimal detection (for internal use)
const updateExpenseAmountDirect = (
  expense: FinancialItem,
  newAmount: number,
) => {
  if (props.disabled) return;
  if (isItemReviewedByItem(expense)) return;

  expense.amount = newAmount;

  // Find the index of the item in the profit & loss items
  const index = taxFilingStore.plItems.findIndex(
    (item) =>
      item.type === expense.type &&
      item.description === expense.description &&
      item.sheet_source === expense.sheet_source,
  );
  if (index !== -1) {
    taxFilingStore.updateHardcodedItem(index, expense, 'pl');
  }
};

// New row addition functionality
const newRowData = ref({
  sales: { description: '', amount: 0, sheet_source: 'Manual Entry' },
  directCost: { description: '', amount: 0, sheet_source: 'Manual Entry' },
  otherIncome: { description: '', amount: 0, sheet_source: 'Manual Entry' },
  expenses: { description: '', amount: 0, sheet_source: 'Manual Entry' },
});

const showAddRowForm = ref({
  sales: false,
  directCost: false,
  otherIncome: false,
  expenses: false,
});

const addNewRow = (sectionType: string) => {
  const data = newRowData.value[sectionType as keyof typeof newRowData.value];

  if (!data.description.trim() || data.amount <= 0) {
    message.error('Please enter a valid description and amount');
    return;
  }

  const newItem: FinancialItem = {
    description: data.description,
    amount: data.amount,
    sheet_source: data.sheet_source,
    type: getItemTypeForSection(sectionType),
    editable: false,
  };

  taxFilingStore.addPLItem(newItem);

  // Reset form
  data.description = '';
  data.amount = 0;
  showAddRowForm.value[sectionType as keyof typeof showAddRowForm.value] =
    false;

  message.success('New item added successfully');
};

const getItemTypeForSection = (sectionType: string): FinancialItem['type'] => {
  const typeMap: Record<string, FinancialItem['type']> = {
    sales: 'sales',
    directCost: 'direct-cost',
    otherIncome: 'other-income',
    expenses: 'operating-expense',
  };
  return typeMap[sectionType] || 'operating-expense';
};

const cancelAddRow = (sectionType: string) => {
  const data = newRowData.value[sectionType as keyof typeof newRowData.value];
  data.description = '';
  data.amount = 0;
  showAddRowForm.value[sectionType as keyof typeof showAddRowForm.value] =
    false;
};

// Delete functionality with confirmation
const removeItem = (item: FinancialItem) => {
  if (props.disabled) return;
  if (isItemReviewedByItem(item)) return;

  Modal.confirm({
    title: 'Confirm Deletion',
    content: `Are you sure you want to remove '${formatDescription(item.description)}'?`,
    okText: 'Yes, Remove',
    cancelText: 'Cancel',
    okType: 'danger',
    onOk() {
      const index = taxFilingStore.plItems.findIndex(
        (plItem) =>
          plItem.type === item.type &&
          plItem.description === item.description &&
          plItem.sheet_source === item.sheet_source,
      );
      if (index !== -1) {
        taxFilingStore.removePLItem(index);
        message.success('Item removed successfully');
      }
    },
  });
};
</script>

<template>
  <ProfitLossModal class="financial-modal">
    <!-- Enhanced Modal Header -->
    <div class="border-b p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="rounded border p-3">
            <Building2 class="h-8 w-8" />
          </div>
          <div>
            <h2 class="text-2xl font-bold">{{ companyName }}</h2>
            <p class="text-lg font-semibold">
              Statement of Comprehensive Income From {{ periodFrom }} to
              {{ periodTo }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 rounded border p-2">
            <Calendar class="h-5 w-5" />
            <span class="text-sm">
              Financial Year {{ new Date().getFullYear() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-8">
      <!-- Simple Header Controls -->
      <div class="rounded border p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-3">
              <DollarSign class="h-6 w-6" />
              <div>
                <h4 class="text-xl font-bold">Profit & Loss Statement</h4>
                <p class="text-sm text-gray-600">
                  Real-time financial data with advanced analytics
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <!-- Simple Review Status Badge -->
            <div class="flex items-center gap-3">
              <div
                class="inline-flex items-center rounded border px-4 py-2 text-sm"
              >
                <span class="mr-2">
                  {{ reviewStats.allReviewed ? '✓' : '' }}
                </span>
                {{
                  reviewStats.allReviewed ? 'All Reviewed' : 'Pending Review'
                }}
              </div>
              <div class="rounded border px-3 py-2">
                <span class="text-sm font-bold">
                  {{ reviewStats.reviewedItems }}/{{ reviewStats.totalItems }}
                </span>
                <span class="ml-1 text-xs text-gray-500">items</span>
              </div>
            </div>

            <!-- Simple Action Button -->
            <div class="flex items-center gap-3">
              <Button
                v-if="showSingleReviewButton && !reviewStats.allReviewed"
                type="primary"
                :disabled="disabled"
                @click="handleReviewAll"
              >
                <Check class="mr-2 h-4 w-4" />
                Mark All Reviewed
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Simple Statement Content -->
      <div class="overflow-hidden rounded border">
        <div class="p-8">
          <!-- P&L Content -->
          <div class="space-y-8">
            <!-- Sales Section -->
            <div class="rounded border p-6">
              <div class="mb-6 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="rounded border p-2">
                    <DollarSign class="h-6 w-6" />
                  </div>
                  <div>
                    <h4 class="text-2xl font-bold">SALES REVENUE</h4>
                    <p class="text-sm text-gray-600">
                      Total income from business operations
                    </p>
                  </div>
                </div>
                <div class="rounded border px-4 py-2">
                  <span class="text-sm font-bold">Current Year</span>
                </div>
              </div>
              <div class="space-y-3">
                <FinancialItemRow
                  v-for="(item, index) in salesData"
                  :key="`sales-${index}`"
                  :item="item"
                  :index="index"
                  :disabled="props.disabled"
                  :can-edit="canEditItem(item, index)"
                  :is-reviewed="isItemReviewed(item, index)"
                  :is-critical="isItemCritical(item, index)"
                  :has-rounding-indicator="hasRoundingIndicator(item)"
                  :was-rounded="wasAmountRounded(item)"
                  :original-amount="getOriginalAmount(item)"
                  @update-amount="updateExpenseAmount"
                  @approve-rounding="approveRounding"
                  @reject-rounding="rejectRounding"
                  @auto-round="autoRoundAmount"
                  @remove-item="removeItem"
                />
              </div>
              <!-- Sales Total -->
              <div class="mt-4 rounded border-t p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="rounded border p-2">
                      <DollarSign class="h-5 w-5" />
                    </div>
                    <span class="text-xl font-bold">Total Sales Revenue</span>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold">
                      ${{ formatNumber(totalSales) }}
                    </div>
                    <div class="text-sm">Gross Revenue</div>
                  </div>
                </div>
              </div>

              <!-- Add New Sales Row -->
              <AddFinancialItemForm
                section-type="sales"
                section-label="Sales Item"
                :form-data="newRowData.sales"
                :show-form="showAddRowForm.sales"
                :disabled="props.disabled"
                :has-rounding-preview="hasFormRoundingPreview('sales')"
                :original-amount="getFormOriginalAmount('sales')"
                @add-item="addNewRow"
                @cancel-form="cancelAddRow"
                @show-form="(sectionType) => showAddRowForm.sales = true"
                @form-input="handleFormInput"
                @clear-rounding="clearFormRounding"
              />
            </div>

            <!-- Direct Cost Section -->
            <div class="border-b pb-4">
              <div class="mb-3 flex items-center justify-between">
                <h4 class="text-lg font-semibold underline">DIRECT COST</h4>
              </div>
              <div class="space-y-2">
                <FinancialItemRow
                  v-for="(item, index) in directCostData"
                  :key="`direct-cost-${index}`"
                  :item="item"
                  :index="index"
                  :disabled="props.disabled"
                  :can-edit="canEditItem(item, index)"
                  :is-reviewed="isItemReviewed(item, index)"
                  :is-critical="isItemCritical(item, index)"
                  :has-rounding-indicator="hasRoundingIndicator(item)"
                  :was-rounded="wasAmountRounded(item)"
                  :original-amount="getOriginalAmount(item)"
                  @update-amount="updateExpenseAmount"
                  @approve-rounding="approveRounding"
                  @reject-rounding="rejectRounding"
                  @auto-round="autoRoundAmount"
                  @remove-item="removeItem"
                />
                <!-- Direct Cost Total -->
                <div
                  class="flex items-center justify-between border-t py-2 font-semibold"
                >
                  <span>Total Direct Cost</span>
                  <span class="min-w-[100px] text-right underline">
                    {{ formatNumber(totalDirectCost) }}
                  </span>
                </div>

                <!-- Add New Direct Cost Row -->
                <AddFinancialItemForm
                  section-type="directCost"
                  section-label="Direct Cost Item"
                  :form-data="newRowData.directCost"
                  :show-form="showAddRowForm.directCost"
                  :disabled="props.disabled"
                  :has-rounding-preview="hasFormRoundingPreview('directCost')"
                  :original-amount="getFormOriginalAmount('directCost')"
                  @add-item="addNewRow"
                  @cancel-form="cancelAddRow"
                  @show-form="(sectionType) => showAddRowForm.directCost = true"
                  @form-input="handleFormInput"
                  @clear-rounding="clearFormRounding"
                  class="mt-3"
                />
              </div>
            </div>

            <!-- Gross Profit -->
            <div class="border-b pb-4">
              <div
                class="flex items-center justify-between rounded border p-3 text-lg font-bold"
              >
                <span>GROSS PROFIT/(LOSS)</span>
                <span class="min-w-[100px] text-right">
                  {{ formatNumber(grossProfit) }}
                </span>
              </div>
            </div>

            <!-- Other Incomes -->
            <div class="border-b pb-4">
              <div class="mb-3 flex items-center justify-between">
                <h4 class="text-lg font-semibold underline">OTHER INCOMES</h4>
              </div>
              <div class="space-y-2">
                <FinancialItemRow
                  v-for="(item, index) in otherIncomeData"
                  :key="`other-income-${index}`"
                  :item="item"
                  :index="index"
                  :disabled="props.disabled"
                  :can-edit="canEditItem(item, index)"
                  :is-reviewed="isItemReviewed(item, index)"
                  :is-critical="isItemCritical(item, index)"
                  :has-rounding-indicator="hasRoundingIndicator(item)"
                  :was-rounded="wasAmountRounded(item)"
                  :original-amount="getOriginalAmount(item)"
                  @update-amount="updateExpenseAmount"
                  @approve-rounding="approveRounding"
                  @reject-rounding="rejectRounding"
                  @auto-round="autoRoundAmount"
                  @remove-item="removeItem"
                />
                <!-- Other Income Total -->
                <div
                  class="flex items-center justify-between border-t py-2 font-semibold"
                >
                  <span>Total Other Income</span>
                  <span class="min-w-[100px] text-right underline">
                    {{ formatNumber(totalOtherIncome) }}
                  </span>
                </div>

                <!-- Add New Other Income Row -->
                <AddFinancialItemForm
                  section-type="otherIncome"
                  section-label="Other Income Item"
                  :form-data="newRowData.otherIncome"
                  :show-form="showAddRowForm.otherIncome"
                  :disabled="props.disabled"
                  :has-rounding-preview="hasFormRoundingPreview('otherIncome')"
                  :original-amount="getFormOriginalAmount('otherIncome')"
                  @add-item="addNewRow"
                  @cancel-form="cancelAddRow"
                  @show-form="(sectionType) => showAddRowForm.otherIncome = true"
                  @form-input="handleFormInput"
                  @clear-rounding="clearFormRounding"
                  class="mt-3"
                />
              </div>
            </div>

            <!-- Expenses Section -->
            <div class="border-b pb-4">
              <div class="mb-3 flex items-center justify-between">
                <h4 class="text-lg font-semibold underline">EXPENSES</h4>
              </div>
              <div class="max-h-96 space-y-2 overflow-y-auto">
                <FinancialItemRow
                  v-for="(item, index) in expensesData"
                  :key="`expenses-${index}`"
                  :item="item"
                  :index="index"
                  :disabled="props.disabled"
                  :can-edit="canEditItem(item, index)"
                  :is-reviewed="isItemReviewed(item, index)"
                  :is-critical="isItemCritical(item, index)"
                  :has-rounding-indicator="hasRoundingIndicator(item)"
                  :was-rounded="wasAmountRounded(item)"
                  :original-amount="getOriginalAmount(item)"
                  @update-amount="updateExpenseAmount"
                  @approve-rounding="approveRounding"
                  @reject-rounding="rejectRounding"
                  @auto-round="autoRoundAmount"
                  @remove-item="removeItem"
                />
                <!-- Expenses Total -->
                <div
                  class="flex items-center justify-between border-t py-2 font-semibold"
                >
                  <span>Total Expenses</span>
                  <span class="min-w-[100px] text-right underline">
                    {{ formatNumber(totalExpenses) }}
                  </span>
                </div>

                <!-- Add New Expense Row -->
                <AddFinancialItemForm
                  section-type="expenses"
                  section-label="Expense Item"
                  :form-data="newRowData.expenses"
                  :show-form="showAddRowForm.expenses"
                  :disabled="props.disabled"
                  :has-rounding-preview="hasFormRoundingPreview('expenses')"
                  :original-amount="getFormOriginalAmount('expenses')"
                  @add-item="addNewRow"
                  @cancel-form="cancelAddRow"
                  @show-form="(sectionType) => showAddRowForm.expenses = true"
                  @form-input="handleFormInput"
                  @clear-rounding="clearFormRounding"
                  class="mt-3"
                />
              </div>
            </div>

            <!-- Net Profit -->
            <div class="border-b pb-4">
              <div
                class="flex items-center justify-between rounded border p-4 text-xl font-bold"
              >
                <span>NET PROFIT/(LOSS)</span>
                <span class="min-w-[100px] text-right">
                  {{ formatNumber(netProfit) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ProfitLossModal>
</template>

<style scoped>
.financial-modal .ant-modal-header {
  display: none;
}

.financial-modal .ant-modal-body {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
}

.financial-modal .ant-modal-content {
  border-radius: 12px;
  border: none;
  overflow: hidden;
}

.financial-modal .ant-modal-close {
  top: 20px;
  right: 20px;
  font-size: 20px;
  z-index: 10;
}

.financial-modal .ant-modal-close:hover {
  color: rgba(0, 0, 0, 0.6);
}

/* Add Item Styling with Tailwind */
.add-row-section {
  @apply mt-4 rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-3 transition-all duration-300;
}

.add-row-section:hover {
  @apply border-primary from-primary-50 to-primary-100 shadow-primary/15 -translate-y-0.5 bg-gradient-to-br shadow-lg;
}

.add-row-btn {
  @apply flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-transparent font-semibold text-slate-500 transition-all duration-300;
}

.add-row-btn:hover {
  @apply border-primary text-primary bg-primary/5 shadow-primary/20 -translate-y-0.5 shadow-lg;
}

.add-row-btn:active {
  @apply shadow-primary/30 translate-y-0 shadow-md;
}

.add-row-form {
  @apply mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-lg;
  animation: slideDown 0.3s ease-out;
}

.form-row {
  @apply flex flex-wrap items-start gap-4;
}

.description-input {
  @apply h-11 min-w-[200px] flex-[2] rounded-lg border-2 border-slate-200 px-4 text-sm transition-all duration-300;
}

.description-input:focus {
  @apply border-primary shadow-primary/10 -translate-y-0.5 shadow-lg outline-none;
}

.amount-input {
  @apply h-11 min-w-[150px] flex-1 rounded-lg border-2 border-slate-200 transition-all duration-300;
}

.amount-input:focus-within {
  @apply -translate-y-0.5 border-emerald-500 shadow-lg shadow-emerald-500/10;
}

.form-actions {
  @apply flex flex-shrink-0 items-center gap-3;
}

.form-actions .ant-btn {
  @apply h-11 rounded-lg border-2 px-5 font-semibold transition-all duration-300;
}

.form-actions .ant-btn-primary {
  @apply from-primary to-primary-600 border-primary shadow-primary/30 bg-gradient-to-r shadow-md;
}

.form-actions .ant-btn-primary:hover {
  @apply from-primary-600 to-primary-700 border-primary-600 shadow-primary/40 -translate-y-0.5 bg-gradient-to-r shadow-lg;
}

.form-actions .ant-btn:not(.ant-btn-primary) {
  @apply border-slate-200 bg-white text-slate-500;
}

.form-actions .ant-btn:not(.ant-btn-primary):hover {
  @apply -translate-y-0.5 border-red-400 bg-red-50 text-red-400 shadow-lg shadow-red-400/20;
}

/* Responsive Design with Tailwind */
@media (max-width: 768px) {
  .form-row {
    @apply flex-col;
  }

  .description-input,
  .amount-input {
    @apply w-full min-w-0;
  }

  .form-actions {
    @apply w-full justify-between;
  }

  .form-actions .ant-btn {
    @apply flex-1;
  }
}

/* Animation for form appearance */
@keyframes slideDown {
  from {
    @apply -translate-y-2 opacity-0;
  }

  to {
    @apply translate-y-0 opacity-100;
  }
}

/* Enhanced hover effects for existing items */
.add-row-section:not(:hover) .add-row-btn {
  @apply opacity-80;
}

.add-row-section:hover .add-row-btn {
  @apply opacity-100;
}

/* Focus states for better accessibility */
.add-row-btn:focus {
  @apply outline-primary outline-2 outline-offset-2;
}
</style>
