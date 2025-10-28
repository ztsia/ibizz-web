<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useTaxFilingStore } from '#/store/tax-filing';
import AdjustmentNotesModal from './AdjustmentNotesModal.vue';
import TaxAnalysisModal from './TaxAnalysisModal.vue';
import type {
  IncomeStatementProps,
  IncomeStatementEmits,
} from '../types/component-types';

// Component interfaces moved to TaxAnalysisModal

const props = withDefaults(defineProps<IncomeStatementProps>(), {
  editable: true,
  showAdjustments: true,
  showTaxAnalysis: true,
  companyName: 'COMPANY SDN BHD',
  reportingPeriod: 'PROFIT & LOSS ACCOUNT FOR THE MONTH ENDED 31ST DEC 2024',
});

const emit = defineEmits<IncomeStatementEmits>();

// Use tax filing store
const taxFilingStore = useTaxFilingStore();
const { getAdjustmentNotes } = taxFilingStore;

// Get financial data from store
const salesData = computed(() => {
  return taxFilingStore.plItems.filter((item) => item.type === 'sales');
});

const directCostData = computed(() => {
  return taxFilingStore.plItems.filter((item) => item.type === 'direct-cost');
});

const otherIncomeData = computed(() => {
  return taxFilingStore.plItems.filter((item) => item.type === 'other-income');
});

const expensesData = computed(() => {
  return taxFilingStore.plItems.filter(
    (item) => item.type === 'operating-expense',
  );
});

// Financial calculations
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

const totalOperatingExpenses = computed(() =>
  expensesData.value.reduce((sum, item) => sum + item.amount, 0),
);

// Format number function
const formatNumber = (value: number) => {
  if (!value && value !== 0) return '0.00';
  return Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Create income statement data structure for compatibility
const incomeStatementData = computed(() => ({
  sales: salesData.value,
  costOfSales: directCostData.value,
  otherIncome: otherIncomeData.value,
  operatingExpenses: expensesData.value,
}));

// Collapse/Expand state for each section
const collapsedSections = ref({
  sales: false,
  costOfSales: false,
  otherIncome: false,
  operatingExpenses: false,
  netProfit: false,
});

// Toggle section collapse/expand
const toggleSection = (sectionName: string) => {
  collapsedSections.value[sectionName] = !collapsedSections.value[sectionName];
};

// Modal state for TaxAnalysisModal
const selectedExpense = ref<any>(null);
const selectedExpenseIndex = ref<number>(-1);
const isAnalysisModalVisible = ref(false);

// Adjustment Notes Modal state
const isAdjustmentNotesModalVisible = ref(false);

// Section 39 eligibility data from AI analysis
const section39EligibilityData = ref<any>(null);

// Open modal with expense analysis
const openAnalysisModal = (expense: any, index: number) => {
  selectedExpense.value = expense;
  selectedExpenseIndex.value = index;
  isAnalysisModalVisible.value = true;
};

// Close modal
const closeAnalysisModal = () => {
  selectedExpense.value = null;
  selectedExpenseIndex.value = -1;
  isAnalysisModalVisible.value = false;
};

const openAdjustmentNotesModal = (item?: any) => {
  if (item) {
    selectedExpense.value = item;
    selectedExpenseIndex.value = item.id || 0; // Use item ID or fallback to 0
  }
  isAdjustmentNotesModalVisible.value = true;
};

// Close adjustment notes modal
const closeAdjustmentNotesModal = () => {
  isAdjustmentNotesModalVisible.value = false;
};

// Get adjustment notes count for an item
const getAdjustmentNotesCount = (itemId: string): number => {
  const notes = getAdjustmentNotes(itemId);
  return notes ? notes.length : 0;
};

// Handle Section 39 eligibility data from TaxAnalysisModal
const handleSection39Data = (section39Data: any) => {
  section39EligibilityData.value = section39Data;
};

// Expense/Income analysis helper functions
const getItemAllowability = (
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
) => {
  const name = itemName.toUpperCase();

  if (itemType === 'income') {
    // Income tax analysis
    if (
      name.includes('INSURANCE CLAIM') ||
      name.includes('SALE OF SCRAP') ||
      name.includes('RENTAL INCOME') ||
      name.includes('INTEREST RECEIVED') ||
      name.includes('DIVIDEND RECEIVED')
    ) {
      return 'taxable';
    }
    if (
      name.includes('GAIN ON DISPOSAL') ||
      name.includes('CAPITAL GAIN') ||
      name.includes('COMPENSATION')
    ) {
      return 'partial';
    }
    if (name.includes('EXEMPT DIVIDEND') || name.includes('LIFE INSURANCE')) {
      return 'exempt';
    }
    return 'taxable'; // Default for income
  }

  // Expense tax analysis
  if (
    name.includes('AUDIT') ||
    name.includes('PROFESSIONAL') ||
    name.includes('BANK CHARGES') ||
    name.includes('INSURANCE') ||
    name.includes('RENT') ||
    name.includes('UTILITIES') ||
    name.includes('SALARIES') ||
    name.includes('WAGES') ||
    name.includes('OFFICE SUPPLIES')
  ) {
    return 'allowed';
  }
  if (
    name.includes('ENTERTAINMENT') ||
    name.includes('PENALTY') ||
    name.includes('FINE') ||
    name.includes('DONATION') ||
    name.includes('GIFT')
  ) {
    return 'disallowed';
  }
  if (
    name.includes('DEPRECIATION') ||
    name.includes('ADVERTISING') ||
    name.includes('TRAINING')
  ) {
    return 'partial';
  }
  return 'allowed'; // Default for expenses
};

const getItemTagClass = (
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
) => {
  const allowability = getItemAllowability(itemName, itemType);

  if (itemType === 'income') {
    return {
      'bg-green-100 text-green-700 border-green-200 hover:bg-green-200':
        allowability === 'taxable',
      'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200':
        allowability === 'exempt',
      'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200':
        allowability === 'partial',
    };
  }

  return {
    'bg-green-100 text-green-700 border-green-200 hover:bg-green-200':
      allowability === 'allowed',
    'bg-red-100 text-red-700 border-red-200 hover:bg-red-200':
      allowability === 'disallowed',
    'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200':
      allowability === 'partial',
  };
};

const getItemTagIcon = (
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
) => {
  const allowability = getItemAllowability(itemName, itemType);

  if (itemType === 'income') {
    if (allowability === 'taxable') {
      return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
      </svg>`;
    } else if (allowability === 'exempt') {
      return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
      </svg>`;
    } else {
      return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>`;
    }
  }

  if (allowability === 'allowed') {
    return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>`;
  } else if (allowability === 'disallowed') {
    return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>`;
  } else {
    return `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
    </svg>`;
  }
};

const getItemTagText = (
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
) => {
  const allowability = getItemAllowability(itemName, itemType);

  if (itemType === 'income') {
    return allowability === 'taxable'
      ? 'Taxable'
      : (allowability === 'exempt'
        ? 'Exempt'
        : 'Partial');
  }

  return allowability === 'allowed'
    ? 'Deductible'
    : (allowability === 'disallowed'
      ? 'Non-Deductible'
      : 'Partial');
};

// Auto-sync adjustmentType with AI analysis
const getAdjustmentTypeFromAI = (itemName: string) => {
  const allowability = getItemAllowability(itemName, 'income');
  if (allowability === 'taxable') {
    return 'taxable';
  } else if (allowability === 'exempt') {
    return 'exempt';
  }
  return ''; // For partial or other cases, leave empty for manual selection
};

// Sync adjustment types for other income items
const syncAdjustmentTypes = () => {
  incomeStatementData.value.otherIncome.forEach((item) => {
    if (item.description) {
      const aiSuggestion = getAdjustmentTypeFromAI(item.description);
      if (aiSuggestion && !item.adjustmentType) {
        item.adjustmentType = aiSuggestion;
      }
    }
  });
};

// Watch for changes in item descriptions to auto-sync adjustment types
watch(
  () => incomeStatementData.value.otherIncome.map((item) => item.description),
  () => {
    syncAdjustmentTypes();
    handleDataChange();
  },
  { deep: true },
);

// Static income items with auto-sync adjustment types
const staticIncomeItems = ref([
  { name: 'INSURANCE CLAIM', value: '23,401', adjustmentType: '' },
  { name: 'SALE OF SCRAP', value: '455,707', adjustmentType: '' },
  {
    name: 'GAIN ON DISPOSAL OF FIXED ASSETS',
    value: '8,150',
    adjustmentType: '',
  },
]);

// Sync static income items adjustment types
const syncStaticAdjustmentTypes = () => {
  staticIncomeItems.value.forEach((item) => {
    const aiSuggestion = getAdjustmentTypeFromAI(item.name);
    if (aiSuggestion) {
      item.adjustmentType = aiSuggestion;
    }
  });
};

// Auto-sync on component mount
onMounted(() => {
  syncAdjustmentTypes();
  syncStaticAdjustmentTypes();
});

// Handle data changes
const handleDataChange = () => {
  emit('data-change', {
    incomeStatementData,
    totals: {
      totalSales: totalSales.value,
      totalOtherIncome: totalOtherIncome.value,
      totalOperatingExpenses: totalOperatingExpenses.value,
      grossProfit: grossProfit.value,
    },
  });
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="rounded-lg border">
      <div class="border-b px-6 py-4">
        <h3 class="text-lg font-semibold">INCOME STATEMENT</h3>
        <p class="text-sm">{{ companyName }}</p>
        <p class="text-sm">{{ reportingPeriod }}</p>
      </div>
    </div>

    <!-- Sales Section -->
    <div class="rounded-lg border">
      <div class="border-b bg-blue-50 px-4 py-3">
        <button
          @click="toggleSection('sales')"
          class="flex w-full items-center justify-between text-sm font-medium hover:text-blue-600"
        >
          <span>SALES</span>
          <svg
            class="h-5 w-5 transform transition-transform"
            :class="{ 'rotate-180': collapsedSections.sales }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
      </div>
      <div v-show="!collapsedSections.sales" class="overflow-hidden">
        <table class="w-full">
          <tbody>
            <tr class="border-b">
              <td class="px-4 py-3 text-sm font-medium"></td>
              <td
                v-if="showAdjustments"
                class="px-4 py-3 text-center text-sm font-medium"
              >
                NTA
              </td>
              <td class="px-4 py-3"></td>
            </tr>
            <tr
              v-for="(item, index) in incomeStatementData.sales"
              :key="index"
              class="border-b border-gray-100 transition-colors hover:bg-gray-50"
            >
              <td class="px-4 py-2 pl-8 text-sm">
                <div class="flex items-center space-x-2">
                  <!-- Tax Analysis Tag -->
                  <button
                    v-if="showTaxAnalysis"
                    @click="openAnalysisModal(item, index)"
                    class="inline-flex cursor-pointer items-center rounded-full border px-2 py-1 text-xs font-medium transition-colors"
                    :class="getItemTagClass(item.description, 'income')"
                    :title="`Click to view tax analysis for ${item.description}`"
                  >
                    <span
                      class="mr-1 flex items-center"
                      v-html="getItemTagIcon(item.description, 'income')"
                    ></span>
                    {{ getItemTagText(item.description, 'income') }}
                  </button>

                  <!-- Sales Name -->
                  <div class="flex-1">
                    <input
                      v-if="editable"
                      v-model="item.description"
                      type="text"
                      class="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      @input="handleDataChange"
                    />
                    <span v-else class="text-sm">{{ item.description }}</span>
                  </div>
                </div>
              </td>
              <td v-if="showAdjustments" class="px-4 py-2 text-center">
                <button
                  @click="openAdjustmentNotesModal(item)"
                  class="relative rounded p-1 transition-colors"
                  :class="
                    getAdjustmentNotesCount(item.id) > 0
                      ? 'text-green-600 hover:bg-green-50 hover:text-green-800'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                  "
                  :title="`${getAdjustmentNotesCount(item.id) > 0 ? getAdjustmentNotesCount(item.id) + ' adjustment notes' : 'Add adjustment notes'}`"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                  <!-- Note count badge -->
                  <span
                    v-if="getAdjustmentNotesCount(item.id) > 0"
                    class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-xs font-medium text-white"
                  >
                    {{ getAdjustmentNotesCount(item.id) }}
                  </span>
                </button>
              </td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  v-model="item.amount"
                  type="number"
                  class="w-24 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @input="handleDataChange"
                />
                <span v-else class="font-mono text-sm">{{
                  formatNumber(item.amount)
                }}</span>
              </td>
            </tr>

            <tr class="border-b border-gray-100">
              <td class="px-4 py-2 pl-8 text-sm">Less:</td>
              <td v-if="showAdjustments" class="px-4 py-2"></td>
              <td class="px-4 py-2"></td>
            </tr>
            <tr class="border-b border-gray-100">
              <td class="px-4 py-2 pl-12 text-sm">RETURNS INWARDS</td>
              <td v-if="showAdjustments" class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  type="text"
                  value="1,272"
                  class="w-24 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span v-else class="font-mono text-sm">1,272</span>
              </td>
            </tr>
            <tr class="border-b bg-blue-50">
              <td class="px-4 py-3 text-sm font-medium">TOTAL SALES</td>
              <td v-if="showAdjustments" class="px-4 py-3"></td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-medium">{{
                  formatNumber(totalSales)
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Cost of Sales Section -->
    <div class="rounded-lg border">
      <div class="border-b bg-blue-50 px-4 py-3">
        <button
          @click="toggleSection('costOfSales')"
          class="flex w-full items-center justify-between text-sm font-medium hover:text-blue-600"
        >
          <span>COST OF SALES</span>
          <svg
            class="h-5 w-5 transform transition-transform"
            :class="{ 'rotate-180': collapsedSections.costOfSales }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
      </div>
      <div v-show="!collapsedSections.costOfSales" class="overflow-hidden">
        <table class="w-full">
          <tbody>
            <tr class="border-b">
              <td class="px-4 py-3 text-sm font-medium"></td>
              <td
                v-if="showAdjustments"
                class="px-4 py-3 text-center text-sm font-medium"
              >
                NTA
              </td>
              <td class="px-4 py-3"></td>
            </tr>
            <tr
              v-for="(item, index) in incomeStatementData.costOfSales"
              :key="index"
              class="border-b border-gray-100 transition-colors hover:bg-gray-50"
            >
              <td class="px-4 py-2 pl-8 text-sm">
                <div class="flex items-center space-x-2">
                  <!-- Tax Analysis Tag -->
                  <button
                    v-if="showTaxAnalysis"
                    @click="openAnalysisModal(item, index)"
                    class="inline-flex cursor-pointer items-center rounded-full border px-2 py-1 text-xs font-medium transition-colors"
                    :class="getItemTagClass(item.description)"
                    :title="`Click to view tax analysis for ${item.description}`"
                  >
                    <span
                      class="mr-1 flex items-center"
                      v-html="getItemTagIcon(item.description)"
                    ></span>
                    {{ getItemTagText(item.description) }}
                  </button>

                  <!-- Cost of Sales Name -->
                  <div class="flex-1">
                    <input
                      v-if="editable"
                      v-model="item.description"
                      type="text"
                      class="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      @input="handleDataChange"
                    />
                    <span v-else class="text-sm">{{ item.description }}</span>
                  </div>
                </div>
              </td>
              <td v-if="showAdjustments" class="px-4 py-2 text-center">
                <button
                  @click="openAdjustmentNotesModal(item)"
                  class="relative rounded p-1 transition-colors"
                  :class="
                    getAdjustmentNotesCount(item.id) > 0
                      ? 'text-green-600 hover:bg-green-50 hover:text-green-800'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                  "
                  :title="`${getAdjustmentNotesCount(item.id) > 0 ? getAdjustmentNotesCount(item.id) + ' adjustment notes' : 'Add adjustment notes'}`"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                  <!-- Note count badge -->
                  <span
                    v-if="getAdjustmentNotesCount(item.id) > 0"
                    class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-xs font-medium text-white"
                  >
                    {{ getAdjustmentNotesCount(item.id) }}
                  </span>
                </button>
              </td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  v-model="item.amount"
                  type="number"
                  class="w-24 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @input="handleDataChange"
                />
                <span v-else class="font-mono text-sm">{{
                  formatNumber(item.amount)
                }}</span>
              </td>
            </tr>

            <tr class="border-b border-gray-100">
              <td class="px-4 py-2 pl-8 text-sm">Less:</td>
              <td v-if="showAdjustments" class="px-4 py-2"></td>
              <td class="px-4 py-2"></td>
            </tr>
            <tr class="border-b border-gray-100">
              <td class="px-4 py-2 pl-12 text-sm">
                CLOSING STOCK - FINISHED GOODS
              </td>
              <td v-if="showAdjustments" class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  type="text"
                  value="2,437,660"
                  class="w-24 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span v-else class="font-mono text-sm">2,437,660</span>
              </td>
            </tr>
            <tr class="border-b bg-blue-50">
              <td class="px-4 py-3 text-sm font-medium">GROSS PROFIT / LOSS</td>
              <td v-if="showAdjustments" class="px-4 py-3"></td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-medium">{{
                  formatNumber(grossProfit)
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Other Income Section -->
    <div class="rounded-lg border">
      <div class="border-b bg-blue-50 px-4 py-3">
        <button
          @click="toggleSection('otherIncome')"
          class="flex w-full items-center justify-between text-sm font-medium hover:text-blue-600"
        >
          <span>OTHER INCOME</span>
          <svg
            class="h-5 w-5 transform transition-transform"
            :class="{ 'rotate-180': collapsedSections.otherIncome }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
      </div>
      <div v-show="!collapsedSections.otherIncome" class="overflow-hidden">
        <table class="w-full">
          <tbody>
            <tr class="border-b">
              <td class="px-4 py-3 text-sm font-medium">Add:</td>
              <td
                v-if="showAdjustments"
                class="px-4 py-3 text-center text-sm font-medium"
              >
                Adjustments
              </td>
              <td class="px-4 py-3"></td>
            </tr>
            <tr
              v-for="(item, index) in incomeStatementData.otherIncome"
              :key="index"
              class="border-b border-gray-100 transition-colors hover:bg-gray-50"
            >
              <td class="px-4 py-2 pl-8 text-sm">
                <div class="flex items-center space-x-2">
                  <!-- Tax Analysis Tag -->
                  <button
                    v-if="showTaxAnalysis"
                    @click="openAnalysisModal(item, index)"
                    class="inline-flex cursor-pointer items-center rounded-full border px-2 py-1 text-xs font-medium transition-colors"
                    :class="getItemTagClass(item.description, 'income')"
                    :title="`Click to view tax analysis for ${item.description}`"
                  >
                    <span
                      class="mr-1 flex items-center"
                      v-html="getItemTagIcon(item.description, 'income')"
                    ></span>
                    {{ getItemTagText(item.description, 'income') }}
                  </button>

                  <!-- Income Name -->
                  <div class="flex-1">
                    <input
                      v-if="editable"
                      v-model="item.description"
                      type="text"
                      class="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      @input="handleDataChange"
                    />
                    <span v-else class="text-sm">{{ item.description }}</span>
                  </div>
                </div>
              </td>
              <td v-if="showAdjustments" class="px-4 py-2 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <select
                    v-if="editable"
                    v-model="item.adjustmentType"
                    class="rounded border border-gray-300 px-2 py-1 text-xs"
                  >
                    <option value="">-</option>
                    <option value="taxable">Taxable Income</option>
                    <option value="exempt">Exempt Income</option>
                  </select>
                  <span v-else class="text-xs">{{
                    item.adjustmentType || '-'
                  }}</span>
                  <button
                    @click="openAdjustmentNotesModal(item)"
                    class="relative rounded p-1 transition-colors"
                    :class="
                      getAdjustmentNotesCount(item.id) > 0
                        ? 'text-green-600 hover:bg-green-50 hover:text-green-800'
                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                    "
                    :title="`${getAdjustmentNotesCount(item.id) > 0 ? getAdjustmentNotesCount(item.id) + ' adjustment notes' : 'Add adjustment notes'}`"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                    <!-- Note count badge -->
                    <span
                      v-if="getAdjustmentNotesCount(item.id) > 0"
                      class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-xs font-medium text-white"
                    >
                      {{ getAdjustmentNotesCount(item.id) }}
                    </span>
                  </button>
                </div>
              </td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  v-model="item.amount"
                  type="number"
                  class="w-24 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @input="handleDataChange"
                />
                <span v-else class="font-mono text-sm">{{
                  formatNumber(item.amount)
                }}</span>
              </td>
            </tr>

            <!-- Static Other Income Items with Tax Analysis -->
            <tr
              v-for="(staticItem, staticIndex) in staticIncomeItems"
              :key="staticIndex"
              class="border-b border-gray-100 transition-colors hover:bg-gray-50"
            >
              <td class="px-4 py-2 pl-8 text-sm">
                <div class="flex items-center space-x-2">
                  <button
                    v-if="showTaxAnalysis"
                    @click="
                      openAnalysisModal(
                        { name: staticItem.name, value: staticItem.value },
                        -1,
                      )
                    "
                    class="inline-flex cursor-pointer items-center rounded-full border px-2 py-1 text-xs font-medium transition-colors"
                    :class="getItemTagClass(staticItem.name, 'income')"
                  >
                    <span
                      class="mr-1 flex items-center"
                      v-html="getItemTagIcon(staticItem.name, 'income')"
                    ></span>
                    {{ getItemTagText(staticItem.name, 'income') }}
                  </button>
                  <span class="text-sm">{{ staticItem.name }}</span>
                </div>
              </td>
              <td v-if="showAdjustments" class="px-4 py-2 text-center">
                <select
                  v-if="editable"
                  v-model="staticItem.adjustmentType"
                  class="rounded border border-gray-300 px-2 py-1 text-xs"
                >
                  <option value="">-</option>
                  <option value="taxable">Taxable Income</option>
                  <option value="exempt">Exempt Income</option>
                </select>
                <span v-else class="text-xs">{{
                  staticItem.adjustmentType || '-'
                }}</span>
              </td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  v-model="staticItem.value"
                  type="text"
                  class="w-24 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span v-else class="font-mono text-sm">{{
                  staticItem.value
                }}</span>
              </td>
            </tr>

            <tr class="border-b bg-blue-50">
              <td class="px-4 py-3 text-sm font-medium">OTHER INCOME</td>
              <td v-if="showAdjustments" class="px-4 py-3"></td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-medium">{{
                  formatNumber(totalOtherIncome)
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Operating Expenses Section -->
    <div class="rounded-lg border">
      <div class="border-b bg-blue-50 px-4 py-3">
        <button
          @click="toggleSection('operatingExpenses')"
          class="flex w-full items-center justify-between text-sm font-medium hover:text-blue-600"
        >
          <span>OPERATING EXPENSES</span>
          <svg
            class="h-5 w-5 transform transition-transform"
            :class="{ 'rotate-180': collapsedSections.operatingExpenses }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
      </div>
      <div
        v-show="!collapsedSections.operatingExpenses"
        class="overflow-hidden"
      >
        <table class="w-full">
          <tbody>
            <tr class="border-b">
              <td class="px-4 py-3 text-sm font-medium"></td>
              <td
                v-if="showAdjustments"
                class="px-4 py-3 text-center text-sm font-medium"
              >
                Adjustments
              </td>
              <td class="px-4 py-3"></td>
            </tr>
            <tr
              v-for="(item, index) in incomeStatementData.operatingExpenses"
              :key="index"
              class="border-b border-gray-100 transition-colors hover:bg-gray-50"
            >
              <td class="px-4 py-2 text-sm">
                <div class="flex items-center space-x-2">
                  <!-- Tax Analysis Tag -->
                  <button
                    v-if="showTaxAnalysis"
                    @click="openAnalysisModal(item, index)"
                    class="inline-flex cursor-pointer items-center rounded-full border px-2 py-1 text-xs font-medium transition-colors"
                    :class="getItemTagClass(item.description)"
                    :title="`Click to view tax analysis for ${item.description}`"
                  >
                    <span
                      class="mr-1 flex items-center"
                      v-html="getItemTagIcon(item.description)"
                    ></span>
                    {{ getItemTagText(item.description) }}
                  </button>

                  <!-- Expense Name -->
                  <div class="flex-1">
                    <input
                      v-if="editable"
                      v-model="item.description"
                      type="text"
                      class="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      @input="handleDataChange"
                    />
                    <span v-else class="text-sm">{{ item.description }}</span>
                  </div>
                </div>
              </td>
              <td v-if="showAdjustments" class="px-4 py-2 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <select
                    v-if="editable"
                    v-model="item.adjustmentType"
                    class="rounded border border-gray-300 px-2 py-1 text-xs"
                  >
                    <option value="">-</option>
                    <option value="disallowable">Disallowable Expenses</option>
                    <option value="allowable">Allowable Expenses</option>
                  </select>
                  <span v-else class="text-xs">{{
                    item.adjustmentType || '-'
                  }}</span>
                  <button
                    v-if="editable"
                    @click="openAdjustmentNotesModal(item)"
                    class="relative rounded p-1 transition-colors"
                    :class="
                      getAdjustmentNotesCount(item.id) > 0
                        ? 'text-green-600 hover:bg-green-50 hover:text-green-800'
                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                    "
                    :title="`${getAdjustmentNotesCount(item.id) > 0 ? getAdjustmentNotesCount(item.id) + ' adjustment notes' : 'Add adjustment notes'}`"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                    <!-- Note count badge -->
                    <span
                      v-if="getAdjustmentNotesCount(item.id) > 0"
                      class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-xs font-medium text-white"
                    >
                      {{ getAdjustmentNotesCount(item.id) }}
                    </span>
                  </button>
                </div>
              </td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  v-model="item.amount"
                  type="number"
                  class="w-24 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @input="handleDataChange"
                />
                <span v-else class="font-mono text-sm">{{
                  formatNumber(item.amount)
                }}</span>
              </td>
            </tr>

            <tr class="border-b bg-blue-50">
              <td class="px-4 py-3 text-sm font-medium">
                TOTAL OPERATING EXPENSES
              </td>
              <td v-if="showAdjustments" class="px-4 py-3"></td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-medium">{{
                  formatNumber(totalOperatingExpenses)
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Net Profit Section -->
    <div class="rounded-lg border">
      <div class="border-b bg-green-50 px-4 py-3">
        <button
          @click="toggleSection('netProfit')"
          class="flex w-full items-center justify-between text-sm font-medium hover:text-green-600"
        >
          <span>NET PROFIT / LOSS</span>
          <svg
            class="h-5 w-5 transform transition-transform"
            :class="{ 'rotate-180': collapsedSections.netProfit }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
      </div>
      <div v-show="!collapsedSections.netProfit" class="overflow-hidden">
        <table class="w-full">
          <tbody>
            <tr class="border-b bg-green-50">
              <td class="px-4 py-3 text-sm font-medium">
                NET PROFIT BEFORE TAX
              </td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-medium">6,649,221</span>
              </td>
            </tr>
            <tr class="border-b border-gray-100">
              <td class="px-4 py-2 pl-8 text-sm">Less: TAXATION</td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  type="text"
                  value="1,595,813"
                  class="w-24 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span v-else class="font-mono text-sm">1,595,813</span>
              </td>
            </tr>
            <tr class="border-b bg-green-50">
              <td class="px-4 py-3 text-sm font-medium">
                NET PROFIT AFTER TAX
              </td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-medium">5,053,408</span>
              </td>
            </tr>
            <tr class="border-b border-gray-100">
              <td class="px-4 py-2 pl-8 text-sm">Less: DIVIDEND</td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  type="text"
                  value="1,000,000"
                  class="w-24 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span v-else class="font-mono text-sm">1,000,000</span>
              </td>
            </tr>
            <tr class="border-b bg-blue-50">
              <td class="px-4 py-3 text-sm font-medium">RETAINED EARNINGS</td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-medium">4,053,408</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tax Analysis Modal -->
    <TaxAnalysisModal
      :visible="isAnalysisModalVisible"
      :selected-expense="selectedExpense"
      @close="closeAnalysisModal"
      @section39-data="handleSection39Data"
    />

    <!-- Adjustment Notes Modal -->
    <AdjustmentNotesModal
      v-model:visible="isAdjustmentNotesModalVisible"
      :selected-expense-index="selectedExpenseIndex"
      :income-statement-data="incomeStatementData"
      :section39-eligibility="section39EligibilityData"
      :linked-item="selectedExpense"
      @close="closeAdjustmentNotesModal"
    />
  </div>
</template>

<style scoped>
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-x-1 > * + * {
  margin-left: 0.25rem;
}

.transition-colors {
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Backdrop blur effect */
.backdrop-blur {
  backdrop-filter: blur(4px);
}
</style>
