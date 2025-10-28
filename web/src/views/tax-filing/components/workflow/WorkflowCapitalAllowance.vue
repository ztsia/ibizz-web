<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import SharedTimeline from '../shared/SharedTimeline.vue';
import WorkflowDisabledOverlay from './shared/WorkflowDisabledOverlay.vue';
import type { TimelineStep, TimelineConfig } from '../../types';
import {
  CheckCircle,
  Loader2,
  Building,
  Car,
  Laptop,
  Eye,
  Plus,
} from 'lucide-vue-next';
import { useTaxFilingStore } from '#/store';
import type {
  WorkflowCapitalAllowanceProps as Props,
  WorkflowCapitalAllowanceEmits as Emits,
} from '../../types/workflow-types';
import CapitalAllowanceModal from '../shared/CapitalAllowanceModal.vue';

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
    title: 'Capital Allowance Coordinator Assignment',
    description: 'Assigning capital allowance and asset management agents',
    details: [
      'Capital Allowance Agent assigned',
      'Asset Management Agent activated',
    ],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying capital allowance and validation agents',
    details: [
      'Capital Allowance Agent deployed',
      'Validation Agent synchronized',
    ],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Asset Processing',
    description: 'Processing and categorizing asset schedules',
    details: [
      'Plant and machinery categorized',
      'Motor vehicles organized',
      'IT equipment validated',
    ],
    hasProgress: true,
    progressKey: 'processing',
  },
  {
    id: 4,
    title: 'Review Interface Ready',
    description:
      'Capital allowance review interface prepared for user validation',
    details: ['All asset items ready for review', 'Review interface activated'],
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

// Mock data for capital allowance assets
const plantMachineryAssets = ref([
  {
    id: 1,
    description: 'Manufacturing Equipment',
    yearAcquired: 2024,
    cost: 250_000,
    allowanceRate: 20,
    allowanceAmount: 50_000,
    writtenDownValue: 200_000,
  },
  {
    id: 2,
    description: 'Factory Machinery',
    yearAcquired: 2023,
    cost: 180_000,
    allowanceRate: 20,
    allowanceAmount: 36_000,
    writtenDownValue: 144_000,
  },
]);

const motorVehicleAssets = ref([
  {
    id: 1,
    description: 'Company Vehicle - Toyota Camry',
    yearAcquired: 2024,
    cost: 120_000,
    allowanceRate: 20,
    allowanceAmount: 24_000,
    writtenDownValue: 96_000,
  },
]);

const itEquipmentAssets = ref([
  {
    id: 1,
    description: 'Office Computers',
    yearAcquired: 2024,
    cost: 45_000,
    allowanceRate: 20,
    allowanceAmount: 9000,
    writtenDownValue: 36_000,
  },
  {
    id: 2,
    description: 'Server Equipment',
    yearAcquired: 2023,
    cost: 80_000,
    allowanceRate: 20,
    allowanceAmount: 16_000,
    writtenDownValue: 64_000,
  },
]);

// Calculate totals for each category
const plantMachineryTotals = computed(() => {
  const assets = plantMachineryAssets.value;
  return {
    totalCost: assets.reduce((sum, asset) => sum + asset.cost, 0),
    totalAllowance: assets.reduce(
      (sum, asset) => sum + asset.allowanceAmount,
      0,
    ),
    totalWDV: assets.reduce((sum, asset) => sum + asset.writtenDownValue, 0),
  };
});

const motorVehicleTotals = computed(() => {
  const assets = motorVehicleAssets.value;
  return {
    totalCost: assets.reduce((sum, asset) => sum + asset.cost, 0),
    totalAllowance: assets.reduce(
      (sum, asset) => sum + asset.allowanceAmount,
      0,
    ),
    totalWDV: assets.reduce((sum, asset) => sum + asset.writtenDownValue, 0),
  };
});

const itEquipmentTotals = computed(() => {
  const assets = itEquipmentAssets.value;
  return {
    totalCost: assets.reduce((sum, asset) => sum + asset.cost, 0),
    totalAllowance: assets.reduce(
      (sum, asset) => sum + asset.allowanceAmount,
      0,
    ),
    totalWDV: assets.reduce((sum, asset) => sum + asset.writtenDownValue, 0),
  };
});

// Calculate overall totals
const overallTotals = computed(() => {
  const plantTotal = plantMachineryTotals.value.totalAllowance;
  const motorTotal = motorVehicleTotals.value.totalAllowance;
  const itTotal = itEquipmentTotals.value.totalAllowance;

  return {
    totalAllowance: plantTotal + motorTotal + itTotal,
    totalAssets:
      plantMachineryAssets.value.length +
      motorVehicleAssets.value.length +
      itEquipmentAssets.value.length,
    plantAllowance: plantTotal,
    motorAllowance: motorTotal,
    itAllowance: itTotal,
    totalCost:
      plantMachineryTotals.value.totalCost +
      motorVehicleTotals.value.totalCost +
      itEquipmentTotals.value.totalCost,
    totalWDV:
      plantMachineryTotals.value.totalWDV +
      motorVehicleTotals.value.totalWDV +
      itEquipmentTotals.value.totalWDV,
  };
});

// Check if we have any assets to proceed
const canCompleteReview = computed(() => {
  return overallTotals.value.totalAssets > 0;
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
      plantMachineryAssets: plantMachineryAssets.value,
      motorVehicleAssets: motorVehicleAssets.value,
      itEquipmentAssets: itEquipmentAssets.value,
      totalAssets: overallTotals.value.totalAssets,
      totalAllowanceAmount: overallTotals.value.totalAllowance,
      plantMachineryTotals: plantMachineryTotals.value,
      motorVehicleTotals: motorVehicleTotals.value,
      itEquipmentTotals: itEquipmentTotals.value,
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
const capitalAllowanceModalRef = ref();

// Modal handlers
const openCapitalAllowanceModal = (assetType: string = 'plant-machinery') => {
  capitalAllowanceModalRef.value?.capitalAllowanceModalApi.open({ assetType });
};

const handleAssetSave = (data: any) => {
  console.log('Asset data saved:', data);
  // Add the new asset to the appropriate category
  switch (data.assetType) {
    case 'plant-machinery': {
      plantMachineryAssets.value.push({
        id: Date.now(),
        description: data.description,
        yearAcquired: data.yearAcquired,
        cost: data.cost,
        allowanceRate: data.allowanceRate,
        allowanceAmount: data.cost * (data.allowanceRate / 100),
        writtenDownValue: data.cost - data.cost * (data.allowanceRate / 100),
      });

      break;
    }
    case 'motor-vehicle': {
      motorVehicleAssets.value.push({
        id: Date.now(),
        description: data.description,
        yearAcquired: data.yearAcquired,
        cost: data.cost,
        allowanceRate: data.allowanceRate,
        allowanceAmount: data.cost * (data.allowanceRate / 100),
        writtenDownValue: data.cost - data.cost * (data.allowanceRate / 100),
      });

      break;
    }
    case 'it-equipment': {
      itEquipmentAssets.value.push({
        id: Date.now(),
        description: data.description,
        yearAcquired: data.yearAcquired,
        cost: data.cost,
        allowanceRate: data.allowanceRate,
        allowanceAmount: data.cost * (data.allowanceRate / 100),
        writtenDownValue: data.cost - data.cost * (data.allowanceRate / 100),
      });

      break;
    }
    // No default
  }
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
        title="Capital Allowance Timeline"
        colorTheme="orange"
        :steps="timelineSteps"
        :config="timelineConfig"
        @completed="handleTimelineCompleted"
      />
    </div>

    <!-- Main Content -->
    <div v-if="timelineCompleted" class="space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h2 class="mb-2 text-2xl font-bold text-gray-900">
          Capital Allowance Management
        </h2>
        <p class="text-gray-600">
          Manage asset schedule and apply correct capital allowances for tax
          computation
        </p>
      </div>

      <!-- Summary Cards -->
      <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <!-- Plant & Machinery Card -->
        <div
          class="transform cursor-pointer rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          @click="openCapitalAllowanceModal('plant-machinery')"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-orange-600 p-3">
                <Building class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-orange-900">
                  Plant & Machinery
                </h3>
                <p class="text-sm text-orange-700">
                  {{ plantMachineryAssets.length }} items
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Eye class="h-5 w-5 text-orange-600" />
              <Plus class="h-4 w-4 text-orange-600" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-orange-700">Total Cost:</span>
              <span class="text-xl font-bold text-orange-900">
                {{ formatCurrency(plantMachineryTotals.totalCost) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-orange-600">Allowance:</span>
              <span class="text-sm text-orange-800">
                {{ formatCurrency(plantMachineryTotals.totalAllowance) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Motor Vehicle Card -->
        <div
          class="transform cursor-pointer rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          @click="openCapitalAllowanceModal('motor-vehicle')"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-amber-600 p-3">
                <Car class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-amber-900">Motor Vehicle</h3>
                <p class="text-sm text-amber-700">
                  {{ motorVehicleAssets.length }} items
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Eye class="h-5 w-5 text-amber-600" />
              <Plus class="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-amber-700">Total Cost:</span>
              <span class="text-xl font-bold text-amber-900">
                {{ formatCurrency(motorVehicleTotals.totalCost) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-amber-600">Allowance:</span>
              <span class="text-sm text-amber-800">
                {{ formatCurrency(motorVehicleTotals.totalAllowance) }}
              </span>
            </div>
          </div>
        </div>

        <!-- IT Equipment Card -->
        <div
          class="transform cursor-pointer rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          @click="openCapitalAllowanceModal('it-equipment')"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-yellow-600 p-3">
                <Laptop class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-yellow-900">IT Equipment</h3>
                <p class="text-sm text-yellow-700">
                  {{ itEquipmentAssets.length }} items
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Eye class="h-5 w-5 text-yellow-600" />
              <Plus class="h-4 w-4 text-yellow-600" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-yellow-700">Total Cost:</span>
              <span class="text-xl font-bold text-yellow-900">
                {{ formatCurrency(itEquipmentTotals.totalCost) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-yellow-600">Allowance:</span>
              <span class="text-sm text-yellow-800">
                {{ formatCurrency(itEquipmentTotals.totalAllowance) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Capital Allowance Summary -->
      <div
        class="mb-8 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6"
      >
        <div class="text-center">
          <h3 class="mb-2 text-2xl font-bold text-gray-900">
            Total Capital Allowance Summary
          </h3>
          <p class="mb-6 text-gray-600">
            Overview of all asset categories and allowances
          </p>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div class="rounded-lg bg-white p-4 shadow-sm">
              <div class="mb-1 text-sm text-gray-600">Total Assets</div>
              <div class="text-2xl font-bold text-gray-900">
                {{ overallTotals.totalAssets }}
              </div>
            </div>

            <div class="rounded-lg bg-white p-4 shadow-sm">
              <div class="mb-1 text-sm text-orange-600">Plant & Machinery</div>
              <div class="text-2xl font-bold text-orange-900">
                {{ formatCurrency(overallTotals.plantAllowance) }}
              </div>
            </div>

            <div class="rounded-lg bg-white p-4 shadow-sm">
              <div class="mb-1 text-sm text-amber-600">Motor Vehicle</div>
              <div class="text-2xl font-bold text-amber-900">
                {{ formatCurrency(overallTotals.motorAllowance) }}
              </div>
            </div>

            <div class="rounded-lg bg-white p-4 shadow-sm">
              <div class="mb-1 text-sm text-yellow-600">IT Equipment</div>
              <div class="text-2xl font-bold text-yellow-900">
                {{ formatCurrency(overallTotals.itAllowance) }}
              </div>
            </div>
          </div>

          <div class="mt-6 border-t border-gray-200 pt-6">
            <div class="mb-2 text-lg text-gray-700">
              Total Capital Allowance
            </div>
            <div class="text-4xl font-bold text-gray-900">
              {{ formatCurrency(overallTotals.totalAllowance) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h3 class="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            @click="openCapitalAllowanceModal('plant-machinery')"
            class="flex items-center gap-3 rounded-lg border border-orange-200 p-4 transition-colors hover:bg-orange-50"
          >
            <Plus class="h-5 w-5 text-orange-600" />
            <span class="font-medium text-orange-900"
              >Add Plant & Machinery</span
            >
          </button>

          <button
            @click="openCapitalAllowanceModal('motor-vehicle')"
            class="flex items-center gap-3 rounded-lg border border-amber-200 p-4 transition-colors hover:bg-amber-50"
          >
            <Plus class="h-5 w-5 text-amber-600" />
            <span class="font-medium text-amber-900">Add Motor Vehicle</span>
          </button>

          <button
            @click="openCapitalAllowanceModal('it-equipment')"
            class="flex items-center gap-3 rounded-lg border border-yellow-200 p-4 transition-colors hover:bg-yellow-50"
          >
            <Plus class="h-5 w-5 text-yellow-600" />
            <span class="font-medium text-yellow-900">Add IT Equipment</span>
          </button>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex justify-end pt-6">
        <button
          :disabled="!canCompleteReview || props.disabled || isLoading"
          @click="completeStep"
          class="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-8 py-3 font-semibold text-white transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Loader2 v-if="isLoading" class="h-5 w-5 animate-spin" />
          <CheckCircle v-else class="h-5 w-5" />
          <span>{{
            isLoading ? 'Processing...' : 'Proceed to Tax Computation'
          }}</span>
        </button>
      </div>
    </div>

    <!-- Capital Allowance Modal -->
    <CapitalAllowanceModal
      ref="capitalAllowanceModalRef"
      @save="handleAssetSave"
    />
  </div>
</template>
