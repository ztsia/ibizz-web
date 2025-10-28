<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import SharedTimeline from '../shared/SharedTimeline.vue';
import WorkflowDisabledOverlay from './shared/WorkflowDisabledOverlay.vue';
import type { TimelineStep, TimelineConfig } from '../../types';
import ProfitLossStatementModal from '../shared/ProfitLossStatementModal.vue';
import { Eye, Check, FileText, Database, Loader2 } from 'lucide-vue-next';

import { useTaxFilingStore } from '#/store';
import type {
  FinancialItem,
  ExtractedData,
  WorkflowExtractProps as Props,
  WorkflowExtractEmits as Emits,
} from '../../types/workflow-types';

// ReviewStatus interface is now imported from the store
// interface ReviewStatus {
//   itemId: string;
//   reviewed: boolean;
//   reviewedAt?: Date;
//   critical: boolean;
// }

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<Emits>();

// Initialize tax filing store
const taxFilingStore = useTaxFilingStore();

// Timeline state
const showTimeline = ref(true);
const isReviewed = ref(false);
const timelineCompleted = ref(false);

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Data Extraction Coordinator Assignment',
    description: 'Assigning data extraction and processing agents',
    details: ['Data Extraction Agent assigned', 'Processing Agent activated'],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying extraction and processing agents',
    details: [
      'Data Extraction Agent deployed',
      'Processing Agent synchronized',
    ],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Financial Data Extraction',
    description: 'Extracting financial data from uploaded documents',
    details: [
      'P&L statement data extracted',
      'Balance sheet data processed',
      'Financial items categorized',
    ],
    hasProgress: true,
    progressKey: 'extraction',
  },
  {
    id: 4,
    title: 'Data Validation & Review',
    description: 'Data extraction completed and ready for review',
    details: [
      'All financial data extracted',
      'Ready for review and validation',
    ],
  },
];

// Watch for all items reviewed status
watch(
  () => taxFilingStore.allItemsReviewed,
  (allReviewed) => {
    if (allReviewed) {
      isReviewed.value = true;
    }
  },
);
const timelineConfig: TimelineConfig = {
  stepTimings: [500, 1500, 4000, 6500],
  progressConfigs: {
    deployment: { increment: 12, interval: 180 },
    extraction: { increment: 5, interval: 400 },
  },
  autoCollapseDelay: 2000,
};

// Modal state

// Shared modal state
const currentStatementType = ref<'profit-loss' | 'balance-sheet'>(
  'profit-loss',
);

// Extraction data state
const expenses = ref<FinancialItem[]>([]);
const tradingPLExpenses = ref<FinancialItem[]>([]);
const manufacturingExpenses = ref<FinancialItem[]>([]);

// Use loading and error states from the store
const isLoadingApiData = computed(() => taxFilingStore.isLoadingFinancialData);
const apiLoadError = computed(() => taxFilingStore.financialDataError);

// Initialize extraction data from store or API
const loadExtractionData = async () => {
  try {
    // Check if there are uploaded Excel files to process
    const uploadedFiles = taxFilingStore.getUploadedFiles();
    const excelFiles = uploadedFiles.filter(file => 
       file.file?.name.toLowerCase().endsWith('.xlsx') || 
       file.file?.name.toLowerCase().endsWith('.xls')
     );

    // If Excel files are available, try to load data from API
     if (excelFiles.length > 0) {
       try {
         // Use the first Excel file for data extraction
         await taxFilingStore.loadFinancialDataFromApi(excelFiles[0].file);
         console.log('Successfully loaded financial data from API');
       } catch (error) {
         console.error('Failed to load data from API, falling back to hardcoded data:', error);
         // Continue with hardcoded data as fallback
       }
     }

    // Get all data from store (either from API or hardcoded)
    const plItemsFromStore = taxFilingStore.plItems;
    const bsItemsFromStore = taxFilingStore.bsItems;

    // Update local refs to include all financial data types
    expenses.value = [...plItemsFromStore, ...bsItemsFromStore];
    tradingPLExpenses.value = plItemsFromStore.filter(
      (item) => item.type === 'operating-expense',
    );
    manufacturingExpenses.value = plItemsFromStore.filter(
      (item) => item.type === 'direct-cost',
    );

    // Initialize review statuses for all items in the store
    initializeReviewStatuses();

    // Emit extraction detected event with comprehensive store data
    emit('extraction-detected', { extractedData: extractedData.value });
  } catch (error) {
     console.error('Error in loadExtractionData:', error);
     // Error handling is managed by the store
   }
};

// Initialize review statuses in the store
const initializeReviewStatuses = () => {
  // Initialize review statuses for all items in the store using correct indices
  // We need to use the store's plItems and bsItems to get the correct indices
  const plItemsFromStore = taxFilingStore.plItems;
  const bsItemsFromStore = taxFilingStore.bsItems;

  // Initialize P&L items with correct indices
  plItemsFromStore.forEach((item, index) => {
    const itemId = `${item.type}-${index}`;
    const critical = item.amount >= 50_000;
    if (!taxFilingStore.getReviewStatus(itemId)) {
      taxFilingStore.setReviewStatus(itemId, {
        itemId,
        reviewed: false,
        critical,
      });
    }
  });

  // Initialize BS items with correct indices
  bsItemsFromStore.forEach((item, index) => {
    const itemId = `${item.type}-${index}`;
    const critical = item.amount >= 50_000;
    if (!taxFilingStore.getReviewStatus(itemId)) {
      taxFilingStore.setReviewStatus(itemId, {
        itemId,
        reviewed: false,
        critical,
      });
    }
  });

  // Removed emitReviewStatusUpdate call as it's no longer needed
};

// Get all financial data from store like ProfitLossStatementModal.vue
const allPLItems = computed(() => taxFilingStore.plItems);
const allBSItems = computed(() => taxFilingStore.bsItems);

// Computed properties for P&L structure (same as ProfitLossStatementModal.vue)
const salesData = computed(() => {
  return allPLItems.value.filter((item) => item.type === 'sales');
});

const directCostData = computed(() => {
  return allPLItems.value.filter((item) => item.type === 'direct-cost');
});

const otherIncomeData = computed(() => {
  return allPLItems.value.filter((item) => item.type === 'other-income');
});

const expensesData = computed(() => {
  return allPLItems.value.filter((item) => item.type === 'operating-expense');
});

// Calculate P&L totals (same as ProfitLossStatementModal.vue)
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

// Balance Sheet data structures (same as ProfitLossStatementModal.vue)
const nonCurrentAssetsData = computed(() => {
  return allBSItems.value.filter((item) => item.type === 'non-current-asset');
});

const intangibleAssetsData = computed(() => {
  return allBSItems.value.filter((item) => item.type === 'intangible-asset');
});

const currentAssetsData = computed(() => {
  return allBSItems.value.filter((item) => item.type === 'current-asset');
});

const currentLiabilitiesData = computed(() => {
  return allBSItems.value.filter((item) => item.type === 'current-liability');
});

const capitalData = computed(() => {
  return allBSItems.value.filter((item) => item.type === 'capital');
});

// Balance Sheet totals (same as ProfitLossStatementModal.vue)
const totalNonCurrentAssets = computed(() =>
  nonCurrentAssetsData.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalIntangibleAssets = computed(() =>
  intangibleAssetsData.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalCurrentAssets = computed(() =>
  currentAssetsData.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalCurrentLiabilities = computed(() =>
  currentLiabilitiesData.value.reduce((sum, item) => sum + item.amount, 0),
);

// const totalCapital = computed(() =>
//   capitalData.value.reduce((sum, item) => sum + item.amount, 0),
// );

const totalAssets = computed(
  () =>
    totalNonCurrentAssets.value +
    totalIntangibleAssets.value +
    totalCurrentAssets.value,
);

// Comprehensive extracted data - calculated from store data like ProfitLossStatementModal.vue
const extractedData = computed(
  (): ExtractedData => ({
    income: totalSales.value + totalOtherIncome.value,
    withholding: 0,
    deductions: totalExpenses.value + totalDirectCost.value,
    expenses: [...expensesData.value, ...directCostData.value],
    tradingPLExpenses: expensesData.value,
    manufacturingExpenses: directCostData.value,
    reviewStatus: 'pending', // Add required reviewStatus property
  }),
);

// Initialize data on mount
onMounted(async () => {
  await loadExtractionData();
});

// Format number for display
const formatNumber = (value: number) => {
  if (!value) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Handle timeline completion
const handleTimelineCompleted = () => {
  timelineCompleted.value = true;
  emit('step-loaded');
};

// Handle step shown
const handleStepShown = () => {
  emit('step-loaded');
};

// Removed markAllAsReviewed function as it's no longer needed

// Reactive review statistics like ProfitLossStatementModal.vue
const plReviewStats = computed(() => {
  const relevantItems = taxFilingStore.plItems;
  const totalItems = relevantItems.length;

  let reviewedItems = 0;
  let criticalItems = 0;
  let criticalReviewed = 0;

  relevantItems.forEach((item, index) => {
    const itemId = `${item.type}-${index}`;
    const reviewStatus = taxFilingStore.getReviewStatus(itemId);

    if (reviewStatus?.reviewed) {
      reviewedItems++;
    }

    if (reviewStatus?.critical || item.amount >= 50_000) {
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

const bsReviewStats = computed(() => {
  const relevantItems = taxFilingStore.bsItems;
  const totalItems = relevantItems.length;

  let reviewedItems = 0;
  let criticalItems = 0;
  let criticalReviewed = 0;

  relevantItems.forEach((item, index) => {
    const itemId = `${item.type}-${index}`;
    const reviewStatus = taxFilingStore.getReviewStatus(itemId);

    if (reviewStatus?.reviewed) {
      reviewedItems++;
    }

    if (reviewStatus?.critical || item.amount >= 50_000) {
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

// Reactive status computed properties based on review statistics
const tradingPLStatus = computed(() => {
  const stats = plReviewStats.value;
  if (stats.allReviewed) return 'completed';
  if (stats.reviewedItems > 0) return 'partial';
  return 'pending';
});

const balanceSheetStatus = computed(() => {
  const stats = bsReviewStats.value;
  if (stats.allReviewed) return 'completed';
  if (stats.reviewedItems > 0) return 'partial';
  return 'pending';
});

const getCategoryStatusClass = (
  categoryType: 'trading-pl' | 'balance-sheet',
) => {
  const status =
    categoryType === 'trading-pl'
      ? tradingPLStatus.value
      : balanceSheetStatus.value;

  switch (status) {
    case 'completed': {
      return 'border-green-400 hover:border-green-500';
    }
    case 'partial': {
      return 'border-yellow-400 hover:border-yellow-500';
    }
    case 'pending': {
      return 'border-slate-400 hover:border-slate-500';
    }
    default: {
      return 'border-slate-400 hover:border-slate-500';
    }
  }
};

const getCategoryStatusText = (
  categoryType: 'trading-pl' | 'balance-sheet',
) => {
  const status =
    categoryType === 'trading-pl'
      ? tradingPLStatus.value
      : balanceSheetStatus.value;

  switch (status) {
    case 'completed': {
      return 'All items reviewed';
    }
    case 'partial': {
      return 'Partial Review';
    }
    case 'pending': {
      return 'Pending Review';
    }
    default: {
      return 'Pending Review';
    }
  }
};

// Modal ref
const statementModalRef = ref();

// Functions for modal opening
const openTradingPLModal = () => {
  if (props.disabled) return;
  currentStatementType.value = 'profit-loss';
  statementModalRef.value?.openProfitLossModal();
};

const openBalanceSheetModal = () => {
  if (props.disabled) return;
  currentStatementType.value = 'balance-sheet';
  statementModalRef.value?.openBalanceSheetModal();
};
</script>

<template>
  <div class="relative">
    <div class="mx-auto max-w-7xl p-6">
      <!-- Step-specific timeline -->
      <SharedTimeline
        v-if="showTimeline"
        title="Data Extraction Timeline"
        color-theme="green"
        :steps="timelineSteps"
        :config="timelineConfig"
        @completed="handleTimelineCompleted"
        @step-shown="handleStepShown"
        class="mb-12"
      />

      <!-- Loading State -->
      <div v-if="taxFilingStore.isLoadingFinancialData" class="space-y-8">
        <div class="from-primary/5 via-secondary/5 to-primary/5 relative overflow-hidden rounded-3xl bg-gradient-to-r p-6 backdrop-blur-sm">
          <div class="relative flex items-center justify-center gap-3">
            <div class="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
              <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
            <span class="text-lg font-medium">Loading Financial Data...</span>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="taxFilingStore.financialDataError" class="space-y-8">
        <div class="from-red-50 to-red-100 relative overflow-hidden rounded-3xl bg-gradient-to-r p-6 backdrop-blur-sm">
          <div class="relative flex items-center justify-center gap-3">
            <div class="bg-red-200 flex h-10 w-10 items-center justify-center rounded-full">
              <span class="text-red-600 text-xl">⚠</span>
            </div>
            <div class="text-center">
              <span class="text-lg font-medium text-red-800">Error Loading Financial Data</span>
              <p class="text-red-600 text-sm mt-1">{{ taxFilingStore.financialDataError }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div v-else-if="timelineCompleted" class="space-y-8">
        <!-- AI Processing Status -->
        <div
          class="from-primary/5 via-secondary/5 to-primary/5 relative overflow-hidden rounded-3xl bg-gradient-to-r p-6 backdrop-blur-sm"
        >
          <div class="relative flex items-center justify-center gap-3">
            <div
              class="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full"
            >
              <Loader2 v-if="isLoadingApiData" class="text-primary h-5 w-5 animate-spin" />
              <Check v-else class="text-primary h-5 w-5" />
            </div>
            <span class="text-lg font-medium">
              {{ isLoadingApiData ? 'Processing Excel Data...' : 'AI Processing Complete' }}
            </span>
            <div class="flex items-center gap-2">
              <div 
                class="h-2 w-2 rounded-full" 
                :class="isLoadingApiData ? 'bg-blue-500 animate-pulse' : 'bg-green-500'"
              ></div>
              <span class="text-muted-foreground text-sm">
                {{ isLoadingApiData ? 'Loading' : 'Ready' }}
              </span>
            </div>
          </div>
          
          <!-- Error Message -->
          <div v-if="apiLoadError && !isLoadingApiData" class="mt-3 text-center">
            <p class="text-sm text-yellow-600">
              ⚠️ API load failed, using fallback data: {{ apiLoadError }}
            </p>
          </div>
        </div>

        <!-- AI Extracted Data -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Profit & Loss Card -->
          <button
            @click="openTradingPLModal"
            :disabled="props.disabled"
            :class="[
              'border-border/50 hover:border-primary/50 from-card to-card/50 group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 text-left backdrop-blur-sm transition-all duration-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50',
            ]"
          >
            <!-- AI Processing Indicator -->
            <div class="absolute right-6 top-6 flex items-center gap-1">
              <div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <span class="text-muted-foreground text-xs">AI Processed</span>
            </div>

            <!-- Floating Elements -->
            <div
              class="from-primary/10 absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br to-transparent blur-xl"
            ></div>
            <div
              class="from-secondary/10 absolute -bottom-2 -left-2 h-12 w-12 rounded-full bg-gradient-to-tr to-transparent blur-lg"
            ></div>

            <div class="relative space-y-4">
              <!-- Header -->
              <div class="flex items-center gap-3">
                <div
                  class="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-xl border"
                >
                  <FileText class="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold">Profit & Loss</h3>
                  <p class="text-muted-foreground text-sm">
                    {{ allPLItems.length }} items extracted
                  </p>
                </div>
              </div>

              <!-- Key Metrics -->
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="space-y-1">
                  <p class="text-muted-foreground">Revenue</p>
                  <p class="font-medium">
                    RM {{ formatNumber(totalSales + totalOtherIncome) }}
                  </p>
                </div>
                <div class="space-y-1">
                  <p class="text-muted-foreground">Expenses</p>
                  <p class="font-medium">
                    RM {{ formatNumber(totalExpenses + totalDirectCost) }}
                  </p>
                </div>
              </div>

              <!-- Net Profit -->
              <div class="border-border/50 border-t pt-3">
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground text-sm">Net Profit</span>
                  <div class="text-right">
                    <div
                      class="text-xl font-bold"
                      :class="[
                        netProfit >= 0 ? 'text-green-600' : 'text-red-600',
                      ]"
                    >
                      RM {{ formatNumber(netProfit) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="flex items-center justify-between">
                <span
                  :class="[
                    'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
                    getCategoryStatusClass('trading-pl').includes('green')
                      ? 'bg-green-100 text-green-700'
                      : getCategoryStatusClass('trading-pl').includes('yellow')
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700',
                  ]"
                >
                  {{ getCategoryStatusText('trading-pl') }}
                </span>
                <Eye
                  class="text-muted-foreground/60 group-hover:text-primary h-4 w-4 transition-colors"
                />
              </div>
            </div>
          </button>

          <!-- Balance Sheet Card -->
          <button
            @click="openBalanceSheetModal"
            :disabled="props.disabled"
            :class="[
              'border-border/50 hover:border-secondary/50 from-card to-card/50 group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 text-left backdrop-blur-sm transition-all duration-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50',
            ]"
          >
            <!-- AI Processing Indicator -->
            <div class="absolute right-6 top-6 flex items-center gap-1">
              <div class="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <span class="text-muted-foreground text-xs">AI Processed</span>
            </div>

            <!-- Floating Elements -->
            <div
              class="from-secondary/10 absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br to-transparent blur-xl"
            ></div>
            <div
              class="from-primary/10 absolute -bottom-2 -left-2 h-12 w-12 rounded-full bg-gradient-to-tr to-transparent blur-lg"
            ></div>

            <div class="relative space-y-4">
              <!-- Header -->
              <div class="flex items-center gap-3">
                <div
                  class="bg-secondary/10 border-secondary/20 flex h-12 w-12 items-center justify-center rounded-xl border"
                >
                  <Database class="text-secondary-foreground h-6 w-6" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold">Balance Sheet</h3>
                  <p class="text-muted-foreground text-sm">
                    {{ allBSItems.length }} items extracted
                  </p>
                </div>
              </div>

              <!-- Key Metrics -->
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="space-y-1">
                  <p class="text-muted-foreground">Assets</p>
                  <p class="font-medium">RM {{ formatNumber(totalAssets) }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-muted-foreground">Liabilities</p>
                  <p class="font-medium">
                    RM {{ formatNumber(totalCurrentLiabilities) }}
                  </p>
                </div>
              </div>

              <!-- Asset Breakdown -->
              <div class="text-muted-foreground space-y-2 text-xs">
                <div class="flex justify-between">
                  <span>Current Assets</span>
                  <span>{{ currentAssetsData.length }} items</span>
                </div>
                <div class="flex justify-between">
                  <span>Non-Current Assets</span>
                  <span>{{ nonCurrentAssetsData.length }} items</span>
                </div>
              </div>

              <!-- Total Assets -->
              <div class="border-border/50 border-t pt-3">
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground text-sm"
                    >Total Assets</span
                  >
                  <div class="text-primary text-xl font-bold">
                    RM {{ formatNumber(totalAssets) }}
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="flex items-center justify-between">
                <span
                  :class="[
                    'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
                    getCategoryStatusClass('balance-sheet').includes('green')
                      ? 'bg-green-100 text-green-700'
                      : getCategoryStatusClass('balance-sheet').includes(
                            'yellow',
                          )
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700',
                  ]"
                >
                  {{ getCategoryStatusText('balance-sheet') }}
                </span>
                <Eye
                  class="text-muted-foreground/60 group-hover:text-secondary-foreground h-4 w-4 transition-colors"
                />
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Shared Profit & Loss Statement Modal -->
      <ProfitLossStatementModal
        ref="statementModalRef"
        :show-single-review-button="true"
        v-model:statement-type="currentStatementType"
      />

      <!-- Disabled overlay -->
      <WorkflowDisabledOverlay :disabled="props.disabled || isReviewed" />
    </div>
  </div>
</template>

<style scoped>
/* Focus states for accessibility */
button:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

/* AI Processing animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-4px);
  }
}

.group:hover .floating-element {
  animation: float 2s ease-in-out infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }

  .p-6 {
    padding: 1rem;
  }
}
</style>
