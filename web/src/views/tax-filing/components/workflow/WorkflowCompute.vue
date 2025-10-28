<script lang="ts" setup>
import { ref } from 'vue';
import { Button } from 'ant-design-vue';
import {
  CalculatorOutlined,
  DollarOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons-vue';
import { useVbenModal } from '@vben/common-ui';
import SharedTimeline from '../shared/SharedTimeline.vue';
import WorkflowDisabledOverlay from './shared/WorkflowDisabledOverlay.vue';
import type { TimelineStep, TimelineConfig } from '../../types';
import IncomeStatement from '../IncomeStatement.vue';
import BalanceSheet from '../BalanceSheet.vue';
import type {
  TaxResults,
  WorkflowComputeProps as Props,
  WorkflowComputeEmits as Emits,
} from '../../types/workflow-types';
import type { FinancialDataChangeEvent } from '../../types/financial-types';

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<Emits>();

const showTimeline = ref(true);
const timelineCompleted = ref(false);
const activeModalContent = ref<
  'tax-results' | 'income-statement' | 'balance-sheet'
>('tax-results');

// Initialize Vben modal for detailed view
const [DetailModal, detailModalApi] = useVbenModal({
  title: 'Tax Computation Details',
  showCancelButton: false,
  showConfirmButton: false,
});

// Modal control functions
const openDetailModal = (
  content: 'tax-results' | 'income-statement' | 'balance-sheet',
) => {
  activeModalContent.value = content;
  detailModalApi.open();
};

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Computation Coordinator Assignment',
    description: 'Assigning tax calculation and compliance agents',
    details: ['Tax Calculation Agent assigned', 'Compliance Agent activated'],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying calculation and compliance agents',
    details: [
      'Tax Calculation Agent deployed',
      'Compliance Agent synchronized',
    ],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Tax Calculations & Deductions',
    description: 'Computing taxes, deductions, and credits',
    details: [
      'Income calculations completed',
      'Deductions processed',
      'Tax credits applied',
    ],
    hasProgress: true,
    progressKey: 'calculation',
  },
  {
    id: 4,
    title: 'Compliance Verification',
    description: 'Tax computation completed and verified',
    details: ['All calculations verified', 'Ready to proceed to review'],
  },
];

const timelineConfig: TimelineConfig = {
  stepTimings: [500, 2000, 4500, 8000],
  progressConfigs: {
    deployment: { increment: 10, interval: 200 },
    calculation: { increment: 6, interval: 500 },
  },
  autoCollapseDelay: 2000,
};

// Sample tax calculation results - in real app this would come from tax computation
const taxResults: TaxResults = {
  totalTax: 11_300,
  refund: -2800, // negative means amount owed
  income: 75_000,
  grossIncome: 75_000,
  adjustedGrossIncome: 72_500,
  federalTax: 9200,
  stateTax: 2100,
  totalWithholding: 8500,
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

// Complete step
const completeStep = () => {
  if (props.disabled) return;
  emit('step-complete', { taxResults });
};

// Handle financial data changes
const handleFinancialDataChange = (event: FinancialDataChangeEvent) => {
  console.log('Financial data changed in WorkflowCompute:', event);
  // Update tax calculations based on financial data changes
  // This can trigger recalculation of tax results
};
</script>

<template>
  <div class="workflow-compute relative mx-auto max-w-7xl">
    <!-- Step-specific timeline -->
    <SharedTimeline
      v-if="showTimeline"
      title="Tax Computation Timeline"
      color-theme="red"
      :steps="timelineSteps"
      :config="timelineConfig"
      @completed="handleTimelineCompleted"
      @step-shown="handleStepShown"
      class="mb-8"
    />

    <!-- Main Content -->
    <div v-if="timelineCompleted" class="space-y-8">
      <!-- Tax Results Overview Cards -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <!-- Total Tax Card -->
        <div class="rounded-lg border p-6 transition-shadow hover:shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-foreground/60 text-sm font-medium">Total Tax</p>
              <p class="text-foreground text-2xl font-bold">
                ${{ taxResults.totalTax.toLocaleString() }}
              </p>
            </div>
            <div
              class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full"
            >
              <CalculatorOutlined class="text-primary text-xl" />
            </div>
          </div>
        </div>

        <!-- Amount Owed Card -->
        <div class="rounded-lg border p-6 transition-shadow hover:shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-foreground/60 text-sm font-medium">Amount Owed</p>
              <p class="text-foreground text-2xl font-bold">
                ${{ Math.abs(taxResults.refund).toLocaleString() }}
              </p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100"
            >
              <CreditCardOutlined class="text-xl text-red-600" />
            </div>
          </div>
        </div>

        <!-- Gross Income Card -->
        <div class="rounded-lg border p-6 transition-shadow hover:shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-foreground/60 text-sm font-medium">Gross Income</p>
              <p class="text-foreground text-2xl font-bold">
                ${{ taxResults.grossIncome.toLocaleString() }}
              </p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
            >
              <DollarOutlined class="text-xl text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Information Actions -->
      <div class="rounded-lg border p-6">
        <h3 class="text-foreground mb-6 text-xl font-semibold">
          Detailed Financial Information
        </h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Income Statement Button -->
          <Button
            type="default"
            size="large"
            @click="openDetailModal('income-statement')"
            class="h-auto min-h-[80px] w-full p-4 text-left"
          >
            <div class="flex items-center gap-3">
              <BarChartOutlined class="text-primary flex-shrink-0 text-xl" />
              <div class="min-w-0 flex-1">
                <div
                  class="text-foreground break-words font-semibold leading-tight"
                >
                  Income Statement
                </div>
                <div
                  class="text-foreground/60 break-words text-sm leading-tight"
                >
                  View income statement
                </div>
              </div>
            </div>
          </Button>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex justify-end pt-6">
        <Button
          type="primary"
          size="large"
          :disabled="props.disabled"
          @click="completeStep"
          class="h-auto min-w-0 px-4 py-2 sm:px-8"
        >
          <span class="flex items-center gap-2">
            <CheckCircleOutlined class="flex-shrink-0" />
            <span class="break-words leading-tight">Proceed to Review</span>
          </span>
        </Button>
      </div>
    </div>

    <!-- Disabled overlay -->
    <WorkflowDisabledOverlay :disabled="props.disabled" />

    <!-- Detail Modal -->
    <DetailModal>
      <div v-if="activeModalContent === 'tax-results'" class="space-y-6">
        <!-- Tax Calculation Details Content -->
        <!-- Income & Tax Breakdown -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Income Summary -->
          <div class="rounded-lg border p-6">
            <h5
              class="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold"
            >
              <DollarOutlined class="text-green-600" />
              Income Summary
            </h5>
            <div class="space-y-3">
              <div
                class="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b py-2 sm:flex-nowrap"
              >
                <span class="text-foreground/70 break-words"
                  >Gross Income:</span
                >
                <span class="text-foreground break-words font-semibold">
                  ${{ taxResults.grossIncome.toLocaleString() }}
                </span>
              </div>
              <div
                class="flex flex-wrap items-center justify-between gap-2 py-2 sm:flex-nowrap"
              >
                <span class="text-foreground/70 break-words"
                  >Adjusted Gross Income:</span
                >
                <span class="text-foreground break-words font-semibold">
                  ${{ taxResults.adjustedGrossIncome.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tax Calculation -->
          <div class="rounded-lg border p-6">
            <h5
              class="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold"
            >
              <CalculatorOutlined class="text-primary" />
              Tax Calculation
            </h5>
            <div class="space-y-3">
              <div
                class="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b py-2 sm:flex-nowrap"
              >
                <span class="text-foreground/70 break-words">Federal Tax:</span>
                <span class="text-foreground break-words font-semibold">
                  ${{ taxResults.federalTax.toLocaleString() }}
                </span>
              </div>
              <div
                class="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b py-2 sm:flex-nowrap"
              >
                <span class="text-foreground/70 break-words">State Tax:</span>
                <span class="text-foreground break-words font-semibold">
                  ${{ taxResults.stateTax.toLocaleString() }}
                </span>
              </div>
              <div
                class="border-primary/20 flex flex-wrap items-center justify-between gap-2 border-t-2 py-2 pt-3 sm:flex-nowrap"
              >
                <span class="text-foreground break-words font-semibold"
                  >Total Tax:</span
                >
                <span class="text-primary break-words text-xl font-bold">
                  ${{ taxResults.totalTax.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Summary -->
        <div class="rounded-lg border border-red-200 bg-red-50/50 p-6">
          <h5
            class="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold"
          >
            <CreditCardOutlined class="text-red-600" />
            Payment Summary
          </h5>
          <div class="space-y-3">
            <div
              class="flex flex-wrap items-center justify-between gap-2 py-2 sm:flex-nowrap"
            >
              <span class="text-foreground/70 break-words"
                >Total Withholding:</span
              >
              <span class="text-foreground break-words font-semibold">
                ${{ taxResults.totalWithholding.toLocaleString() }}
              </span>
            </div>
            <div
              class="flex flex-wrap items-center justify-between gap-2 py-2 sm:flex-nowrap"
            >
              <span class="text-foreground/70 break-words"
                >Total Tax Owed:</span
              >
              <span class="text-foreground break-words font-semibold">
                ${{ taxResults.totalTax.toLocaleString() }}
              </span>
            </div>
            <div
              class="flex flex-wrap items-center justify-between gap-2 border-t-2 border-red-200 py-3 pt-3 sm:flex-nowrap"
            >
              <span class="text-foreground break-words text-lg font-semibold"
                >Amount Owed:</span
              >
              <span class="break-words text-2xl font-bold text-red-600">
                ${{ Math.abs(taxResults.refund).toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Income Statement Modal Content -->
      <div v-else-if="activeModalContent === 'income-statement'" class="p-4">
        <IncomeStatement
          company-name="Your Company"
          reporting-period="Current Period"
          :editable="!props.disabled"
          @data-change="handleFinancialDataChange"
        />
      </div>

      <!-- Balance Sheet Modal Content -->
      <div v-else-if="activeModalContent === 'balance-sheet'" class="p-4">
        <BalanceSheet
          company-name="Your Company"
          reporting-period="As at Current Date"
          :editable="!props.disabled"
          @data-change="handleFinancialDataChange"
        />
      </div>
    </DetailModal>
  </div>
</template>

<style scoped>
.workflow-compute {
  /* Container styles handled by Tailwind classes */
}
</style>
