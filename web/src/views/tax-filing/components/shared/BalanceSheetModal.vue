<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { Button, InputNumber, Input, message, Modal } from 'ant-design-vue';
import {
  Check,
  Building2,
  Calendar,
  DollarSign,
  Plus,
  Brain,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calculator,
  ArrowRight,
} from 'lucide-vue-next';
import { useVbenModal } from '@vben/common-ui';
import { useTaxFilingStore } from '#/store/tax-filing';
import type { FinancialItem } from '#/store/tax-filing';
import { openaiService } from '#/services/openai';
import type { BalanceSheetAnalysisResult } from '#/services/openai';
import FinancialItemRow from './FinancialItemRow.vue';
import AddFinancialItemForm from './AddFinancialItemForm.vue';

// Auto-incrementing counters for unique keys
const keyCounters = ref({
  intangible: 0,
  currentAssets: 0,
  nonCurrentAssets: 0,
  currentLiabilities: 0,
  nonCurrentLiabilities: 0,
  capital: 0,
});

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

// Initialize Vben modal for Balance Sheet
const [BalanceSheetModal, balanceSheetModalApi] = useVbenModal({
  title: 'Balance Sheet',
  showConfirmButton: false,
});

// Expose modal API
defineExpose({
  balanceSheetModalApi,
});

// Store and client data
const taxFilingStore = useTaxFilingStore();
const clientInfo = computed(() => taxFilingStore.selectedClient);

// Initialize review statuses and key counters on mount
onMounted(() => {
  console.log(taxFilingStore.bsItems);
  taxFilingStore.initializeReviewStatuses(taxFilingStore.bsItems);

  // Initialize counters based on existing data length
  keyCounters.value.intangible = intangibleAssetsData.value.length;
  keyCounters.value.currentAssets = currentAssetsData.value.length;
  keyCounters.value.nonCurrentAssets = nonCurrentAssetsData.value.length;
  keyCounters.value.currentLiabilities = currentLiabilitiesData.value.length;
  keyCounters.value.nonCurrentLiabilities =
    nonCurrentLiabilitiesData.value.length;
  keyCounters.value.capital = capitalData.value.length;
});

// Client-derived data
const companyName = computed(
  () =>
    clientInfo.value?.basicParticulars.companyName ||
    'Company Name Not Available',
);

const periodTo = computed(() => {
  const currentYear = new Date().getFullYear();
  return `31/12/${currentYear}`;
});

// Get financial data from store
const allFinancialItems = computed(() => {
  return taxFilingStore.bsItems;
});

// Computed properties for Balance Sheet structure
const intangibleAssetsData = computed(() => {
  return allFinancialItems.value.filter(
    (item) => item.type === 'intangible-asset',
  );
});

const currentAssetsData = computed(() => {
  return allFinancialItems.value.filter(
    (item) => item.type === 'current-asset',
  );
});

const nonCurrentAssetsData = computed(() => {
  return allFinancialItems.value.filter(
    (item) => item.type === 'non-current-asset',
  );
});

const currentLiabilitiesData = computed(() => {
  return allFinancialItems.value.filter(
    (item) => item.type === 'current-liability',
  );
});

const nonCurrentLiabilitiesData = computed(() => {
  return allFinancialItems.value.filter(
    (item) => item.type === 'long-term-liability',
  );
});

const capitalData = computed(() => {
  return allFinancialItems.value.filter((item) => item.type === 'capital');
});

// Calculate totals
const totalIntangibleAssets = computed(() =>
  intangibleAssetsData.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalCurrentAssets = computed(() =>
  currentAssetsData.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalNonCurrentAssets = computed(() =>
  nonCurrentAssetsData.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalAssets = computed(
  () =>
    totalIntangibleAssets.value +
    totalCurrentAssets.value +
    totalNonCurrentAssets.value,
);

const totalCurrentLiabilities = computed(() =>
  currentLiabilitiesData.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalNonCurrentLiabilities = computed(() =>
  nonCurrentLiabilitiesData.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalCapital = computed(() =>
  capitalData.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalLiabilitiesAndCapital = computed(
  () =>
    totalCurrentLiabilities.value +
    totalNonCurrentLiabilities.value +
    totalCapital.value,
);

// Balance check
const balanceDiscrepancy = computed(() =>
  Math.abs(totalAssets.value - totalLiabilitiesAndCapital.value),
);

const isBalanced = computed(() => balanceDiscrepancy.value < 0.01);

// AI Analysis state
const aiAnalysisResult = ref<BalanceSheetAnalysisResult | null>(null);
const isAnalyzing = ref(false);
const showAiAnalysis = ref(false);
const aiAnalysisError = ref<string | null>(null);

// Review statistics
const reviewStats = computed(() => {
  const relevantExpenses = taxFilingStore.bsItems;
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

// AI Analysis functions
const analyzeWithAI = async () => {
  if (isBalanced.value) return;

  isAnalyzing.value = true;
  aiAnalysisError.value = null;

  try {
    const analysisOptions = {
      totalAssets: totalAssets.value,
      totalLiabilitiesAndCapital: totalLiabilitiesAndCapital.value,
      balanceDiscrepancy: balanceDiscrepancy.value,
      financialItems: {
        intangibleAssets: totalIntangibleAssets.value,
        currentAssets: totalCurrentAssets.value,
        nonCurrentAssets: totalNonCurrentAssets.value,
        currentLiabilities: totalCurrentLiabilities.value,
        nonCurrentLiabilities: totalNonCurrentLiabilities.value,
        capital: totalCapital.value,
      },
      companyName: companyName.value,
      periodTo: periodTo.value,
    };

    const result =
      await openaiService.analyzeBalanceSheetDiscrepancy(analysisOptions);
    aiAnalysisResult.value = result;
    showAiAnalysis.value = true;

    message.success('AI analysis completed successfully');
  } catch (error) {
    console.error('AI analysis failed:', error);
    aiAnalysisError.value =
      'Failed to analyze balance sheet. Please try again.';
    message.error('AI analysis failed. Please try again.');
  } finally {
    isAnalyzing.value = false;
  }
};

const toggleAiAnalysis = () => {
  showAiAnalysis.value = !showAiAnalysis.value;
};

const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'low': {
      return 'text-green-600';
    }
    case 'medium': {
      return 'text-yellow-600';
    }
    case 'high': {
      return 'text-primary-600';
    }
    case 'critical': {
      return 'text-red-600';
    }
    default: {
      return 'text-gray-600';
    }
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': {
      return 'text-red-600 bg-red-50';
    }
    case 'medium': {
      return 'text-yellow-600 bg-yellow-50';
    }
    case 'low': {
      return 'text-green-600 bg-green-50';
    }
    default: {
      return 'text-gray-600 bg-gray-50';
    }
  }
};

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

// Enhanced formatter for InputNumber components
const formatNumberWithCommas = (value: string | number) => {
  if (!value && value !== 0) return '';
  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (isNaN(numValue)) return '';

  // Round the value to remove decimals
  const roundedValue = Math.round(numValue);
  const absValue = Math.abs(roundedValue);
  const formattedValue = absValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return roundedValue < 0 ? `-${formattedValue}` : formattedValue;
};

// Enhanced parser for InputNumber components - now supports decimals
const parseNumberFromCommas = (value: string) => {
  if (!value) return 0;
  // Remove all non-digit characters except minus sign at the beginning and decimal point
  const cleanValue = value.replaceAll(/[^\d.-]/g, '').replaceAll(/(?!^)-/g, '');
  const numValue = Number.parseFloat(cleanValue);
  return isNaN(numValue) ? 0 : numValue;
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
  taxFilingStore.bsItems.forEach((item, index) => {
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

const formatDescription = (description: string) => {
  return description
    .replaceAll('_', ' ')
    .replaceAll(/\b\w/g, (l) => l.toUpperCase());
};

const getReviewStatus = (itemId: string) => {
  return taxFilingStore.getReviewStatus(itemId);
};

const isItemCritical = (expense: FinancialItem, index: number): boolean => {
  const relevantItems = taxFilingStore.bsItems;
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
  const relevantItems = taxFilingStore.bsItems;
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

const handleReviewAll = () => {
  // Auto-round all items before marking as reviewed
  taxFilingStore.bsItems.forEach((item, index) => {
    autoRoundAmount(item, index);
  });

  taxFilingStore.markAllAsReviewed('balance-sheet');
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

// Instant update functions
const updateExpenseAmount = (expense: FinancialItem, newAmount: any) => {
  if (props.disabled) return;
  if (isItemReviewedByItem(expense)) return;

  const numAmount = Number(newAmount) || 0;
  expense.amount = numAmount;

  // Find the index of the item in the balance sheet items
  const index = taxFilingStore.bsItems.findIndex(
    (item) =>
      item.type === expense.type &&
      item.description === expense.description &&
      item.sheet_source === expense.sheet_source,
  );
  if (index !== -1) {
    taxFilingStore.updateHardcodedItem(index, expense, 'bs');
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

  // Find the index of the item in the balance sheet items
  const index = taxFilingStore.bsItems.findIndex(
    (item) =>
      item.type === expense.type &&
      item.description === expense.description &&
      item.sheet_source === expense.sheet_source,
  );
  if (index !== -1) {
    taxFilingStore.updateHardcodedItem(index, expense, 'bs');
  }
};

// New row addition functionality
const newRowData = ref({
  intangibleAssets: {
    description: '',
    amount: 0,
    sheet_source: 'Manual Entry',
  },
  currentAssets: { description: '', amount: 0, sheet_source: 'Manual Entry' },
  nonCurrentAssets: {
    description: '',
    amount: 0,
    sheet_source: 'Manual Entry',
  },
  currentLiabilities: {
    description: '',
    amount: 0,
    sheet_source: 'Manual Entry',
  },
  nonCurrentLiabilities: {
    description: '',
    amount: 0,
    sheet_source: 'Manual Entry',
  },
  capital: { description: '', amount: 0, sheet_source: 'Manual Entry' },
});

const showAddRowForm = ref({
  intangibleAssets: false,
  currentAssets: false,
  nonCurrentAssets: false,
  currentLiabilities: false,
  nonCurrentLiabilities: false,
  capital: false,
});

const addNewRow = (sectionType: string) => {
  const data = newRowData.value[sectionType as keyof typeof newRowData.value];

  if (!data.description.trim() || data.amount <= 0) {
    message.error('Please enter a valid description and amount');
    return;
  }

  const newItem: FinancialItem = {
    id: `${sectionType}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    description: data.description,
    amount: data.amount,
    sheet_source: data.sheet_source,
    type: getItemTypeForSection(sectionType),
    editable: false,
  };

  taxFilingStore.addBSItem(newItem);

  // Increment the appropriate counter
  const counterMap: Record<string, keyof typeof keyCounters.value> = {
    intangibleAssets: 'intangible',
    currentAssets: 'currentAssets',
    nonCurrentAssets: 'nonCurrentAssets',
    currentLiabilities: 'currentLiabilities',
    nonCurrentLiabilities: 'nonCurrentLiabilities',
    capital: 'capital',
  };

  const counterKey = counterMap[sectionType];
  if (counterKey) {
    keyCounters.value[counterKey]++;
  }

  // Reset form
  data.description = '';
  data.amount = 0;
  showAddRowForm.value[sectionType as keyof typeof showAddRowForm.value] =
    false;

  message.success('New item added successfully');
};

const getItemTypeForSection = (sectionType: string): FinancialItem['type'] => {
  const typeMap: Record<string, FinancialItem['type']> = {
    intangibleAssets: 'intangible-asset',
    currentAssets: 'current-asset',
    nonCurrentAssets: 'non-current-asset',
    currentLiabilities: 'current-liability',
    nonCurrentLiabilities: 'long-term-liability',
    capital: 'capital',
  };
  return typeMap[sectionType] || 'current-asset';
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
      const index = taxFilingStore.bsItems.findIndex(
        (bsItem) =>
          bsItem.type === item.type &&
          bsItem.description === item.description &&
          bsItem.sheet_source === item.sheet_source,
      );
      if (index !== -1) {
        taxFilingStore.removeBSItem(index);
        message.success('Item removed successfully');
      }
    },
  });
};
</script>

<template>
  <BalanceSheetModal class="financial-modal">
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
              Statement of Financial Position As At {{ periodTo }}
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
                <h4 class="text-xl font-bold">Balance Sheet</h4>
                <p class="text-sm text-gray-600">
                  Statement of Financial Position
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

            <!-- Action Buttons -->
            <div class="flex items-center gap-3">
              <!-- Round All Button -->
              <Button
                type="default"
                :disabled="disabled"
                @click="roundAllItems"
                class="border-primary-200 text-primary-600 hover:bg-primary-50"
              >
                <Calculator class="mr-2 h-4 w-4" />
                Round All
              </Button>

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

      <!-- Balance Sheet Content -->
      <div class="overflow-hidden rounded border">
        <div class="p-8">
          <!-- Assets Section -->
          <div class="space-y-6">
            <div class="rounded border p-6">
              <h3 class="mb-6 text-2xl font-bold">ASSETS</h3>

              <!-- Non-Current Assets -->
              <div class="mb-6">
                <h4 class="mb-4 text-lg font-semibold underline">
                  Non-Current Assets
                </h4>

                <!-- Intangible Assets -->
                <div class="mb-4">
                  <h5 class="mb-3 font-medium">Intangible Assets</h5>
                  <div class="space-y-2">
                    <FinancialItemRow
                      v-for="(item, index) in intangibleAssetsData"
                      :key="`intangible-${index}`"
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
                    <!-- Intangible Assets Total -->
                    <div
                      class="flex items-center justify-between border-t py-2 font-semibold"
                    >
                      <span>Total Intangible Assets</span>
                      <span class="min-w-[100px] text-right underline">
                        {{ formatNumber(totalIntangibleAssets) }}
                      </span>
                    </div>

                    <!-- Add New Intangible Asset Row -->
                    <AddFinancialItemForm
                      section-type="intangibleAssets"
                      section-label="Intangible Asset"
                      :form-data="newRowData.intangibleAssets"
                      :show-form="showAddRowForm.intangibleAssets"
                      :disabled="props.disabled"
                      :has-rounding-preview="hasFormRoundingPreview('intangibleAssets')"
                      :original-amount="getFormOriginalAmount('intangibleAssets')"
                      @add-item="addNewRow"
                      @cancel-form="cancelAddRow"
                      @show-form="(sectionType) => showAddRowForm.intangibleAssets = true"
                      @form-input="handleFormInput"
                      @clear-rounding="clearFormRounding"
                    />
                  </div>
                </div>

                <!-- Other Non-Current Assets -->
                <div class="mb-4">
                  <h5 class="mb-3 font-medium">Other Non-Current Assets</h5>
                  <div class="space-y-2">
                    <FinancialItemRow
                      v-for="(item, index) in nonCurrentAssetsData"
                      :key="`non-current-${index}`"
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
                    <!-- Non-Current Assets Total -->
                    <div
                      class="flex items-center justify-between border-t py-2 font-semibold"
                    >
                      <span>Total Non-Current Assets</span>
                      <span class="min-w-[100px] text-right underline">
                        {{ formatNumber(totalNonCurrentAssets) }}
                      </span>
                    </div>

                    <!-- Add New Non-Current Asset Row -->
                    <AddFinancialItemForm
                      section-type="nonCurrentAssets"
                      section-label="Non-Current Asset"
                      :form-data="newRowData.nonCurrentAssets"
                      :show-form="showAddRowForm.nonCurrentAssets"
                      :disabled="props.disabled"
                      :has-rounding-preview="hasFormRoundingPreview('nonCurrentAssets')"
                      :original-amount="getFormOriginalAmount('nonCurrentAssets')"
                      @add-item="addNewRow"
                      @cancel-form="cancelAddRow"
                      @show-form="(sectionType) => showAddRowForm.nonCurrentAssets = true"
                      @form-input="handleFormInput"
                      @clear-rounding="clearFormRounding"
                    />
                  </div>
                </div>
              </div>

              <!-- Current Assets -->
              <div class="mb-6">
                <h4 class="mb-4 text-lg font-semibold underline">
                  Current Assets
                </h4>
                <div class="space-y-2">
                  <FinancialItemRow
                    v-for="(item, index) in currentAssetsData"
                    :key="`current-${index}`"
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
                  <!-- Current Assets Total -->
                  <div
                    class="flex items-center justify-between border-t py-2 font-semibold"
                  >
                    <span>Total Current Assets</span>
                    <span class="min-w-[100px] text-right underline">
                      {{ formatNumber(totalCurrentAssets) }}
                    </span>
                  </div>

                  <!-- Add New Current Asset Row -->
                  <AddFinancialItemForm
                    section-type="currentAssets"
                    section-label="Current Asset"
                    :form-data="newRowData.currentAssets"
                    :show-form="showAddRowForm.currentAssets"
                    :disabled="props.disabled"
                    :has-rounding-preview="hasFormRoundingPreview('currentAssets')"
                    :original-amount="getFormOriginalAmount('currentAssets')"
                    @add-item="addNewRow"
                    @cancel-form="cancelAddRow"
                    @show-form="(sectionType) => showAddRowForm.currentAssets = true"
                    @form-input="handleFormInput"
                    @clear-rounding="clearFormRounding"
                  />
                </div>
              </div>

              <!-- Total Assets -->
              <div
                class="flex items-center justify-between rounded border p-3 text-lg font-bold"
              >
                <span>TOTAL ASSETS</span>
                <span class="min-w-[100px] text-right">
                  {{ formatNumber(totalAssets) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Liabilities and Capital Section -->
          <div class="space-y-6">
            <div class="rounded border p-6">
              <h3 class="mb-6 text-2xl font-bold">LIABILITIES AND CAPITAL</h3>

              <!-- Current Liabilities -->
              <div class="mb-6">
                <h4 class="mb-4 text-lg font-semibold underline">
                  Current Liabilities
                </h4>
                <div class="space-y-2">
                  <FinancialItemRow
                    v-for="(item, index) in currentLiabilitiesData"
                    :key="`current-liability-${index}`"
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
                  <!-- Current Liabilities Total -->
                  <div
                    class="flex items-center justify-between border-t py-2 font-semibold"
                  >
                    <span>Total Current Liabilities</span>
                    <span class="min-w-[100px] text-right underline">
                      {{ formatNumber(totalCurrentLiabilities) }}
                    </span>
                  </div>

                  <!-- Add New Current Liability Row -->
                  <AddFinancialItemForm
                    section-type="currentLiabilities"
                    section-label="Current Liability"
                    :form-data="newRowData.currentLiabilities"
                    :show-form="showAddRowForm.currentLiabilities"
                    :disabled="props.disabled"
                    :has-rounding-preview="hasFormRoundingPreview('currentLiabilities')"
                    :original-amount="getFormOriginalAmount('currentLiabilities')"
                    @add-item="addNewRow"
                    @cancel-form="cancelAddRow"
                    @show-form="(sectionType) => showAddRowForm.currentLiabilities = true"
                    @form-input="handleFormInput"
                    @clear-rounding="clearFormRounding"
                  />
                </div>
              </div>

              <!-- Non-Current Liabilities -->
              <div class="mb-6">
                <h4 class="mb-4 text-lg font-semibold underline">
                  Non-Current Liabilities
                </h4>
                <div class="space-y-2">
                  <FinancialItemRow
                    v-for="(item, index) in nonCurrentLiabilitiesData"
                    :key="`non-current-liability-${index}`"
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
                  <!-- Non-Current Liabilities Total -->
                  <div
                    class="flex items-center justify-between border-t py-2 font-semibold"
                  >
                    <span>Total Non-Current Liabilities</span>
                    <span class="min-w-[100px] text-right underline">
                      {{ formatNumber(totalNonCurrentLiabilities) }}
                    </span>
                  </div>

                  <!-- Add New Non-Current Liability Row -->
                  <AddFinancialItemForm
                    section-type="nonCurrentLiabilities"
                    section-label="Non-Current Liability"
                    :form-data="newRowData.nonCurrentLiabilities"
                    :show-form="showAddRowForm.nonCurrentLiabilities"
                    :disabled="props.disabled"
                    :has-rounding-preview="hasFormRoundingPreview('nonCurrentLiabilities')"
                    :original-amount="getFormOriginalAmount('nonCurrentLiabilities')"
                    @add-item="addNewRow"
                    @cancel-form="cancelAddRow"
                    @show-form="(sectionType) => showAddRowForm.nonCurrentLiabilities = true"
                    @form-input="handleFormInput"
                    @clear-rounding="clearFormRounding"
                  />
                </div>
              </div>

              <!-- Capital -->
              <div class="mb-6">
                <h4 class="mb-4 text-lg font-semibold underline">Capital</h4>
                <div class="space-y-2">
                  <FinancialItemRow
                    v-for="(item, index) in capitalData"
                    :key="`capital-${index}`"
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
                  <!-- Capital Total -->
                  <div
                    class="flex items-center justify-between border-t py-2 font-semibold"
                  >
                    <span>Total Capital</span>
                    <span class="min-w-[100px] text-right underline">
                      {{ formatNumber(totalCapital) }}
                    </span>
                  </div>

                  <!-- Add New Capital Row -->
                  <AddFinancialItemForm
                    section-type="capital"
                    section-label="Capital Item"
                    :form-data="newRowData.capital"
                    :show-form="showAddRowForm.capital"
                    :disabled="props.disabled"
                    :has-rounding-preview="hasFormRoundingPreview('capital')"
                    :original-amount="getFormOriginalAmount('capital')"
                    @add-item="addNewRow"
                    @cancel-form="cancelAddRow"
                    @show-form="(sectionType) => showAddRowForm.capital = true"
                    @form-input="handleFormInput"
                    @clear-rounding="clearFormRounding"
                  />
                </div>
              </div>

              <!-- Total Liabilities and Capital -->
              <div
                class="flex items-center justify-between rounded border p-3 text-lg font-bold"
              >
                <span>TOTAL LIABILITIES AND CAPITAL</span>
                <span class="min-w-[100px] text-right">
                  {{ formatNumber(totalLiabilitiesAndCapital) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Balance Sheet Alert -->
          <div
            v-if="!isBalanced"
            class="mt-6 rounded border border-red-300 bg-red-50 p-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="text-red-600">⚠️</div>
                <div>
                  <h4 class="font-semibold text-red-800">Balance Check</h4>
                  <p class="text-sm text-red-700">
                    Assets and Liabilities + Capital do not balance.
                    Discrepancy: ${{ formatNumber(balanceDiscrepancy) }}
                  </p>
                  <p class="text-xs text-red-600">
                    Assets: ${{ formatNumber(totalAssets) }} | Liabilities +
                    Capital: ${{ formatNumber(totalLiabilitiesAndCapital) }}
                  </p>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <Button
                  type="primary"
                  size="small"
                  :loading="isAnalyzing"
                  @click="analyzeWithAI"
                  class="flex items-center gap-2"
                >
                  <Brain class="h-4 w-4" />
                  {{ isAnalyzing ? 'Analyzing...' : 'Analyze with AI' }}
                </Button>
                <Button
                  v-if="aiAnalysisResult"
                  size="small"
                  @click="toggleAiAnalysis"
                  class="flex items-center gap-2"
                >
                  <component
                    :is="showAiAnalysis ? ChevronUp : ChevronDown"
                    class="h-4 w-4"
                  />
                  {{ showAiAnalysis ? 'Hide Analysis' : 'Show Analysis' }}
                </Button>
              </div>
            </div>

            <!-- AI Analysis Error -->
            <div
              v-if="aiAnalysisError"
              class="mt-4 rounded border border-red-400 bg-red-100 p-3"
            >
              <p class="text-sm text-red-700">{{ aiAnalysisError }}</p>
            </div>

            <!-- AI Analysis Results -->
            <div
              v-if="aiAnalysisResult && showAiAnalysis"
              class="mt-4 rounded border border-blue-300 bg-blue-50 p-4"
            >
              <div class="mb-4">
                <div class="mb-2 flex items-center justify-between">
                  <h5
                    class="flex items-center gap-2 font-semibold text-blue-800"
                  >
                    <Brain class="h-5 w-5" />
                    AI Analysis Results
                  </h5>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-blue-600">Risk Level:</span>
                    <span
                      :class="getRiskLevelColor(aiAnalysisResult.riskLevel)"
                      class="text-xs font-semibold uppercase"
                    >
                      {{ aiAnalysisResult.riskLevel }}
                    </span>
                    <span class="text-xs text-blue-600">Confidence:</span>
                    <span class="text-xs font-semibold text-blue-800"
                      >{{ aiAnalysisResult.confidence }}%</span
                    >
                  </div>
                </div>
                <p class="mb-4 text-sm text-blue-700">
                  {{ aiAnalysisResult.analysis }}
                </p>
              </div>

              <!-- Potential Causes -->
              <div v-if="aiAnalysisResult.potentialCauses?.length" class="mb-4">
                <h6 class="mb-2 font-medium text-blue-800">
                  Potential Causes:
                </h6>
                <div class="space-y-2">
                  <div
                    v-for="(cause, index) in aiAnalysisResult.potentialCauses"
                    :key="index"
                    class="flex items-start gap-2 text-sm"
                  >
                    <span class="font-medium text-blue-600"
                      >{{ cause.likelihood }}%</span
                    >
                    <div>
                      <span class="font-medium text-blue-800">{{
                        cause.cause
                      }}</span>
                      <p class="text-blue-700">{{ cause.description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recommendations -->
              <div v-if="aiAnalysisResult.recommendations?.length" class="mb-4">
                <h6 class="mb-2 font-medium text-blue-800">Recommendations:</h6>
                <ul class="list-inside list-disc space-y-1">
                  <li
                    v-for="(rec, index) in aiAnalysisResult.recommendations"
                    :key="index"
                    class="text-sm text-blue-700"
                  >
                    {{ rec }}
                  </li>
                </ul>
              </div>

              <!-- Correction Suggestions -->
              <div
                v-if="aiAnalysisResult.correctionSuggestions?.length"
                class="mb-4"
              >
                <h6 class="mb-2 font-medium text-blue-800">
                  Correction Steps:
                </h6>
                <div class="space-y-2">
                  <div
                    v-for="(
                      suggestion, index
                    ) in aiAnalysisResult.correctionSuggestions"
                    :key="index"
                    class="flex items-start gap-2"
                  >
                    <span
                      :class="getPriorityColor(suggestion.priority)"
                      class="rounded px-2 py-1 text-xs font-medium"
                    >
                      {{ suggestion.priority.toUpperCase() }}
                    </span>
                    <div class="flex-1">
                      <span class="text-sm font-medium text-blue-800">{{
                        suggestion.step
                      }}</span>
                      <p class="text-sm text-blue-700">
                        {{ suggestion.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Compliance Notes -->
              <div v-if="aiAnalysisResult.complianceNotes?.length" class="mb-4">
                <h6 class="mb-2 font-medium text-blue-800">
                  Compliance Notes:
                </h6>
                <ul class="list-inside list-disc space-y-1">
                  <li
                    v-for="(note, index) in aiAnalysisResult.complianceNotes"
                    :key="index"
                    class="text-sm text-blue-700"
                  >
                    {{ note }}
                  </li>
                </ul>
              </div>

              <!-- Reasoning -->
              <div
                v-if="aiAnalysisResult.reasoning"
                class="border-t border-blue-200 pt-3"
              >
                <h6 class="mb-2 font-medium text-blue-800">
                  Analysis Reasoning:
                </h6>
                <p class="text-xs text-blue-600">
                  {{ aiAnalysisResult.reasoning }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BalanceSheetModal>
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
