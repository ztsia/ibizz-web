<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import SharedTimeline from '../shared/SharedTimeline.vue';
import WorkflowDisabledOverlay from './shared/WorkflowDisabledOverlay.vue';
import type { TimelineStep, TimelineConfig } from '../../types';
import {
  CheckCircle,
  Loader2,
  Home,
  TrendingUp,
  Percent,
  Eye,
  Plus,
} from 'lucide-vue-next';
import { useTaxFilingStore } from '#/store';
import type {
  WorkflowIncomeExtractionProps as Props,
  WorkflowIncomeExtractionEmits as Emits,
} from '../../types/workflow-types';
import DividendIncomeModal from '../shared/DividendIncomeModal.vue';
import InterestIncomeModal from '../shared/InterestIncomeModal.vue';
import RentalIncomeModal from '../shared/RentalIncomeModal.vue';

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});
const isLoading = ref(false);
const emit = defineEmits<Emits>();

// Initialize tax filing store
const taxFilingStore = useTaxFilingStore();

// Timeline state
const showTimeline = ref(true);
const timelineCompleted = ref(false);

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Income Extraction Coordinator Assignment',
    description: 'Assigning income extraction and validation agents',
    details: ['Income Extraction Agent assigned', 'Validation Agent activated'],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying income extraction and validation agents',
    details: ['Income Extraction Agent deployed', 'Validation Agent synchronized'],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Income Data Processing',
    description: 'Processing and categorizing extracted income data',
    details: [
      'Dividend income categorized',
      'Interest income organized',
      'Rental income validated',
    ],
    hasProgress: true,
    progressKey: 'processing',
  },
  {
    id: 4,
    title: 'Review Interface Ready',
    description: 'Income review interface prepared for user validation',
    details: ['All income items ready for review', 'Review interface activated'],
  },
];

const timelineConfig: TimelineConfig = {
  stepTimings: [500, 1500, 3500, 5000],
  progressConfigs: {
    deployment: { increment: 15, interval: 200 },
    processing: { increment: 8, interval: 300 },
  },
  autoCollapseDelay: 2000,
};

// Get income data from store
const dividendIncome = computed(() => taxFilingStore.getDividendIncomeItems());
const interestIncome = computed(() => taxFilingStore.getInterestIncomeItems());
const rentalIncome = computed(() => taxFilingStore.getRentalIncomeItems());

// Get totals from store
const dividendTotals = computed(() => taxFilingStore.dividendTotals);
const interestTotals = computed(() => taxFilingStore.interestTotals);
const rentalTotals = computed(() => taxFilingStore.rentalTotals);

// Calculate overall totals
const overallTotals = computed(() => {
  const dividendTotal = dividendTotals.value.totalGross;
  const interestTotal = interestTotals.value.totalAmount;
  const rentalTotal = rentalTotals.value.totalGrossRent;
  
  return {
    totalIncome: dividendTotal + interestTotal + rentalTotal,
    totalItems: dividendIncome.value.length + interestIncome.value.length + rentalIncome.value.length,
    dividendAmount: dividendTotal,
    interestAmount: interestTotal,
    rentalAmount: rentalTotal,
  };
});

// Check if we have any income data to proceed
const canCompleteReview = computed(() => {
  return overallTotals.value.totalItems > 0;
});

// Handle timeline completion
const handleTimelineCompleted = () => {
  timelineCompleted.value = true;
  emit('step-loaded');
};

// Complete step
const completeStep = () => {
  if (!canCompleteReview.value || props.disabled || isLoading.value) {
    console.log(
      'Cannot complete step:',
      'canCompleteReview:',
      canCompleteReview.value,
      'disabled:',
      props.disabled,
      'loading:',
      isLoading.value,
    );
    return;
  }

  isLoading.value = true;

  // Simulate processing time
  setTimeout(() => {
    isLoading.value = false;
    emit('step-complete', {
      dividendIncome: dividendIncome.value,
      interestIncome: interestIncome.value,
      rentalIncome: rentalIncome.value,
      totalIncomeItems: overallTotals.value.totalItems,
      totalIncomeAmount: overallTotals.value.totalIncome,
      dividendTotals: dividendTotals.value,
      interestTotals: interestTotals.value,
      rentalTotals: rentalTotals.value,
    });
  }, 1000);
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Modal refs
const dividendModalRef = ref();
const interestModalRef = ref();
const rentalModalRef = ref();

// Modal handlers
const openDividendModal = () => {
  dividendModalRef.value?.dividendIncomeModalApi.open();
};

const openInterestModal = () => {
  interestModalRef.value?.interestIncomeModalApi.open();
};

const openRentalModal = () => {
  rentalModalRef.value?.rentalIncomeModalApi.open();
};

const handleDividendSave = (data: any) => {
  console.log('Dividend data saved:', data);
  // Data is automatically synced through the store in the modal
};

const handleInterestSave = (data: any) => {
  console.log('Interest data saved:', data);
  // Data is automatically synced through the store in the modal
};

const handleRentalSave = (data: any) => {
  console.log('Rental data saved:', data);
  // Data is automatically synced through the store in the modal
};

// Lifecycle
onMounted(() => {
  emit('step-shown');
});
</script>

<template>
  <div class="relative">
    <!-- Disabled Overlay -->
    <WorkflowDisabledOverlay v-if="props.disabled" />

    <!-- Timeline Section -->
    <div v-if="showTimeline" class="mb-8">
      <SharedTimeline
        title="Income Extraction Timeline"
        :colorTheme="'blue'"
        :steps="timelineSteps"
        :config="timelineConfig"
        @completed="handleTimelineCompleted"
      />
    </div>

    <!-- Main Content -->
    <div v-if="timelineCompleted" class="space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Income Extraction & Review
        </h2>
        <p class="text-gray-600">
          Review and validate extracted income data from dividend, interest, and rental sources
        </p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Dividend Income Card -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" @click="openDividendModal">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-blue-600 rounded-lg">
                <TrendingUp class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="font-bold text-blue-900 text-lg">Dividend Income</h3>
                <p class="text-sm text-blue-700">{{ dividendIncome.length }} items</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Eye class="h-5 w-5 text-blue-600" />
              <Plus class="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-blue-700">Total Gross:</span>
              <span class="font-bold text-blue-900 text-xl">
                {{ formatCurrency(dividendTotals.totalGross) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-blue-600">Tax at Source:</span>
              <span class="text-sm text-blue-800">
                {{ formatCurrency(dividendTotals.totalTax) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Interest Income Card -->
        <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" @click="openInterestModal">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-green-600 rounded-lg">
                <Percent class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="font-bold text-green-900 text-lg">Interest Income</h3>
                <p class="text-sm text-green-700">{{ interestIncome.length }} items</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Eye class="h-5 w-5 text-green-600" />
              <Plus class="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-green-700">Total Amount:</span>
              <span class="font-bold text-green-900 text-xl">
                {{ formatCurrency(interestTotals.totalAmount) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-green-600">Chargeable:</span>
              <span class="text-sm text-green-800">
                {{ formatCurrency(interestTotals.chargeableAmount) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Rental Income Card -->
        <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" @click="openRentalModal">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-purple-600 rounded-lg">
                <Home class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="font-bold text-purple-900 text-lg">Rental Income</h3>
                <p class="text-sm text-purple-700">{{ rentalIncome.length }} items</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Eye class="h-5 w-5 text-purple-600" />
              <Plus class="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-purple-700">Gross Rent:</span>
              <span class="font-bold text-purple-900 text-xl">
                {{ formatCurrency(rentalTotals.totalGrossRent) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-purple-600">Net Rent:</span>
              <span class="text-sm text-purple-800">
                {{ formatCurrency(rentalTotals.totalNetRent) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Income Summary -->
      <div class="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 mb-8">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Total Income Summary</h3>
          <p class="text-gray-600 mb-6">Overview of all extracted income sources</p>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="text-sm text-gray-600 mb-1">Total Items</div>
              <div class="text-2xl font-bold text-gray-900">{{ overallTotals.totalItems }}</div>
            </div>
            
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="text-sm text-blue-600 mb-1">Dividend Income</div>
              <div class="text-2xl font-bold text-blue-900">{{ formatCurrency(overallTotals.dividendAmount) }}</div>
            </div>
            
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="text-sm text-green-600 mb-1">Interest Income</div>
              <div class="text-2xl font-bold text-green-900">{{ formatCurrency(overallTotals.interestAmount) }}</div>
            </div>
            
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="text-sm text-purple-600 mb-1">Rental Income</div>
              <div class="text-2xl font-bold text-purple-900">{{ formatCurrency(overallTotals.rentalAmount) }}</div>
            </div>
          </div>
          
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="text-lg text-gray-700 mb-2">Total Income Amount</div>
            <div class="text-4xl font-bold text-gray-900">{{ formatCurrency(overallTotals.totalIncome) }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            @click="openDividendModal"
            class="flex items-center gap-3 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Plus class="h-5 w-5 text-blue-600" />
            <span class="font-medium text-blue-900">Add Dividend Income</span>
          </button>
          
          <button
            @click="openInterestModal"
            class="flex items-center gap-3 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Plus class="h-5 w-5 text-green-600" />
            <span class="font-medium text-green-900">Add Interest Income</span>
          </button>
          
          <button
            @click="openRentalModal"
            class="flex items-center gap-3 p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <Plus class="h-5 w-5 text-purple-600" />
            <span class="font-medium text-purple-900">Add Rental Income</span>
          </button>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex justify-end pt-6">
        <button
          :disabled="!canCompleteReview || props.disabled || isLoading"
          @click="completeStep"
          class="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Loader2 v-if="isLoading" class="h-5 w-5 animate-spin" />
          <CheckCircle v-else class="h-5 w-5" />
          <span>{{ isLoading ? 'Processing...' : 'Proceed to Tax Computation' }}</span>
        </button>
      </div>
    </div>

    <!-- Income Modals -->
    <DividendIncomeModal
      ref="dividendModalRef"
      @save="handleDividendSave"
    />
    
    <InterestIncomeModal
      ref="interestModalRef"
      @save="handleInterestSave"
    />
    
    <RentalIncomeModal
      ref="rentalModalRef"
      @save="handleRentalSave"
    />
  </div>
</template>