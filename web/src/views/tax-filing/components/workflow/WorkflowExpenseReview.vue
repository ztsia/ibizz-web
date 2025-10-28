<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import SharedTimeline from '../shared/SharedTimeline.vue';
import WorkflowDisabledOverlay from './shared/WorkflowDisabledOverlay.vue';
import type { TimelineStep, TimelineConfig } from '../../types';
import {
  Check,
  DollarSign,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle,
  X,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Loader2,
} from 'lucide-vue-next';
import { useTaxFilingStore } from '#/store';
import type {
  FinancialItem,
  WorkflowExpenseReviewProps as Props,
  WorkflowExpenseReviewEmits as Emits,
} from '../../types/workflow-types';

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
    title: 'Expense Review Coordinator Assignment',
    description: 'Assigning expense review and validation agents',
    details: ['Expense Review Agent assigned', 'Validation Agent activated'],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying expense review and validation agents',
    details: ['Expense Review Agent deployed', 'Validation Agent synchronized'],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Expense Data Processing',
    description: 'Processing and categorizing extracted expense data',
    details: [
      'Operating expenses categorized',
      'Direct costs organized',
      'Expense amounts validated',
    ],
    hasProgress: true,
    progressKey: 'processing',
  },
  {
    id: 4,
    title: 'Review Interface Ready',
    description: 'Expense review interface prepared for user validation',
    details: ['All expenses ready for review', 'Review interface activated'],
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

// Search and filter state
const searchQuery = ref('');
const sortField = ref<'description' | 'amount' | 'type' | null>(null);
const sortDirection = ref<'asc' | 'desc'>('asc');
const statusFilter = ref<'all' | 'reviewed' | 'pending'>('all');
const typeFilter = ref<'all' | 'operating-expense' | 'direct-cost'>('all');

// Get expense data from store
const operatingExpenses = computed(() =>
  taxFilingStore.plItems.filter((item) => item.type === 'operating-expense'),
);

const directCosts = computed(() =>
  taxFilingStore.plItems.filter((item) => item.type === 'direct-cost'),
);

const allExpenses = computed(() => [
  ...operatingExpenses.value,
  ...directCosts.value,
]);

// Filtered and sorted expenses
const filteredExpenses = computed(() => {
  let filtered = allExpenses.value.map((expense, index) => ({
    ...expense,
    originalIndex: index,
  }));

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((expense) => {
      const description = (
        expense.name ||
        expense.description ||
        ''
      ).toLowerCase();
      const amount = expense.amount.toString();
      const type = expense.type.toLowerCase();

      return (
        description.includes(query) ||
        amount.includes(query) ||
        type.includes(query)
      );
    });
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((expense) => {
      const itemId = `${expense.type}-${expense.originalIndex}`;
      const status = taxFilingStore.getReviewStatus(itemId);
      const isReviewed = status?.reviewed || false;

      return statusFilter.value === 'reviewed' ? isReviewed : !isReviewed;
    });
  }

  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter((expense) => expense.type === typeFilter.value);
  }

  // Apply sorting
  if (sortField.value) {
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField.value) {
        case 'description': {
          aValue = (a.name || a.description || '').toLowerCase();
          bValue = (b.name || b.description || '').toLowerCase();
          break;
        }
        case 'amount': {
          aValue = a.amount;
          bValue = b.amount;
          break;
        }
        case 'type': {
          aValue = a.type;
          bValue = b.type;
          break;
        }
        default: {
          return 0;
        }
      }

      if (sortDirection.value === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  return filtered;
});

// Bulk review functionality
const selectAll = ref(false);

// Sorting functionality
const toggleSort = (field: 'description' | 'amount' | 'type') => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
};

const getSortIcon = (field: 'description' | 'amount' | 'type') => {
  if (sortField.value !== field) return null;
  return sortDirection.value === 'asc' ? SortAsc : SortDesc;
};

// Clear all filters
const clearFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  typeFilter.value = 'all';
  sortField.value = null;
};

// Review status tracking
const getExpenseReviewStatus = (expense: FinancialItem, index: number) => {
  const itemId = `${expense.type}-${index}`;
  return taxFilingStore.getReviewStatus(itemId);
};

const toggleExpenseReview = (expense: FinancialItem, index: number) => {
  if (props.disabled) return;

  const itemId = `${expense.type}-${index}`;
  const currentStatus = taxFilingStore.getReviewStatus(itemId);

  taxFilingStore.setReviewStatus(itemId, {
    itemId,
    reviewed: !currentStatus?.reviewed,
    reviewedAt: new Date(),
    critical: expense.amount >= 50_000,
  });
};

// Bulk review all expenses
const reviewAllExpenses = () => {
  if (props.disabled) return;

  allExpenses.value.forEach((expense, index) => {
    const itemId = `${expense.type}-${index}`;
    taxFilingStore.setReviewStatus(itemId, {
      itemId,
      reviewed: true,
      reviewedAt: new Date(),
      critical: expense.amount >= 50_000,
    });
  });
};



// Review completion check - always allow completion since all items are reviewed by default
const canCompleteReview = computed(() => {
  return true; // Always allow completion since review is no longer required
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

// Complete expense review
const completeExpenseReview = () => {
  if (!canCompleteReview.value || props.disabled || isLoading.value) {
    console.log(
      'Review completion blocked - canComplete:',
      canCompleteReview.value,
      'disabled:',
      props.disabled,
      'loading:',
      isLoading.value,
    );
    return;
  }

  // Set loading state
  isLoading.value = true;

  console.log('Emitting step-completed event');
  emit('step-completed', { canComplete: canCompleteReview.value });
};

// Initialize review statuses on mount - all items are reviewed by default
onMounted(() => {
  allExpenses.value.forEach((expense, index) => {
    const itemId = `${expense.type}-${index}`;
    const critical = expense.amount >= 50_000;

    if (!taxFilingStore.getReviewStatus(itemId)) {
      taxFilingStore.setReviewStatus(itemId, {
        itemId,
        reviewed: true, // Default to reviewed
        reviewedAt: new Date(),
        critical,
      });
    }
  });
});
</script>

<template>
  <div class="relative mx-auto max-w-7xl">
    <!-- Step-specific timeline -->
    <SharedTimeline
      v-if="showTimeline"
      title="Expense Review Timeline"
      color-theme="blue"
      :steps="timelineSteps"
      :config="timelineConfig"
      @completed="handleTimelineCompleted"
      @step-shown="handleStepShown"
      class="mb-8"
    />

    <!-- Main Content -->
    <div v-if="timelineCompleted" class="space-y-6">
      <!-- Header Section -->
      <div v-if="allExpenses.length > 0" class="space-y-6">
        <!-- Modern Search and Filter Controls -->
        <div class="space-y-4 rounded-xl border p-6">
          <div class="flex flex-col gap-4 lg:flex-row">
            <!-- Search Input -->
            <div class="relative flex-1">
              <Search
                class="text-foreground/40 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search expenses by description, amount, or type..."
                class="border-border text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2"
              />
            </div>

            <!-- Filter Controls -->
            <div class="flex flex-wrap gap-3">
              <select
                v-model="statusFilter"
                class="border-border text-foreground focus:border-primary focus:ring-primary/20 rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-2"
              >
                <option value="all">All Status</option>
                <option value="reviewed">Reviewed</option>
                <option value="pending">Pending</option>
              </select>

              <select
                v-model="typeFilter"
                class="border-border text-foreground focus:border-primary focus:ring-primary/20 rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-2"
              >
                <option value="all">All Types</option>
                <option value="operating-expense">Operating Expenses</option>
                <option value="direct-cost">Direct Costs</option>
              </select>

              <button
                @click="clearFilters"
                class="border-border text-foreground/60 hover:text-foreground hover:border-primary/50 flex items-center gap-2 rounded-lg border px-4 py-3 transition-all"
              >
                <X class="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        </div>

        <!-- Modern Fixed Height Table -->
        <div class="overflow-hidden rounded-xl border">
          <!-- Fixed Table Header -->
          <div class="border-b">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th
                    class="text-foreground px-6 py-4 text-left text-sm font-semibold"
                  >
                    <button
                      @click="toggleSort('type')"
                      class="hover:text-primary flex items-center gap-2 transition-colors"
                    >
                      Type
                      <component
                        :is="getSortIcon('type')"
                        v-if="getSortIcon('type')"
                        class="h-4 w-4"
                      />
                    </button>
                  </th>
                  <th
                    class="text-foreground px-6 py-4 text-left text-sm font-semibold"
                  >
                    <button
                      @click="toggleSort('description')"
                      class="hover:text-primary flex items-center gap-2 transition-colors"
                    >
                      Description
                      <component
                        :is="getSortIcon('description')"
                        v-if="getSortIcon('description')"
                        class="h-4 w-4"
                      />
                    </button>
                  </th>
                  <th
                    class="text-foreground px-6 py-4 text-right text-sm font-semibold"
                  >
                    <button
                      @click="toggleSort('amount')"
                      class="hover:text-primary ml-auto flex items-center gap-2 transition-colors"
                    >
                      Amount (RM)
                      <component
                        :is="getSortIcon('amount')"
                        v-if="getSortIcon('amount')"
                        class="h-4 w-4"
                      />
                    </button>
                  </th>
                  <th
                    class="text-foreground px-6 py-4 text-center text-sm font-semibold"
                  >
                    Status
                  </th>
                  <th
                    class="text-foreground px-6 py-4 text-center text-sm font-semibold"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          <!-- Scrollable Table Body -->
          <div class="max-h-96 overflow-y-auto">
            <table class="w-full">
              <tbody class="divide-y">
                <tr
                  v-for="expense in filteredExpenses"
                  :key="`${expense.type}-${expense.originalIndex}`"
                  :class="[
                    'hover:bg-muted/50 transition-colors',
                    props.disabled ? 'opacity-50' : '',
                  ]"
                >
                  <!-- Type -->
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="rounded-lg border p-2">
                        <DollarSign
                          v-if="expense.type === 'operating-expense'"
                          class="text-primary h-4 w-4"
                        />
                        <FileText v-else class="text-foreground/60 h-4 w-4" />
                      </div>
                      <div>
                        <span class="text-foreground text-sm font-medium">
                          {{
                            expense.type === 'operating-expense'
                              ? 'Operating Expense'
                              : 'Direct Cost'
                          }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Description -->
                  <td class="px-6 py-4">
                    <div>
                      <p class="text-foreground font-medium">
                        {{ expense.name || expense.description || '-' }}
                      </p>
                    </div>
                  </td>

                  <!-- Amount -->
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <span class="text-foreground font-semibold">
                        RM {{ formatNumber(expense.amount) }}
                      </span>
                      <AlertCircle
                        v-if="expense.amount >= 50000"
                        class="h-4 w-4 text-red-500"
                        title="Critical Amount"
                      />
                    </div>
                  </td>

                  <!-- Status -->
                  <td class="px-6 py-4 text-center">
                    <button
                      @click="
                        toggleExpenseReview(expense, expense.originalIndex)
                      "
                      :disabled="props.disabled"
                      :class="[
                        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                        getExpenseReviewStatus(expense, expense.originalIndex)
                          ?.reviewed
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
                        props.disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer',
                      ]"
                    >
                      <CheckCircle
                        v-if="
                          getExpenseReviewStatus(expense, expense.originalIndex)
                            ?.reviewed
                        "
                        class="h-3 w-3"
                      />
                      <Eye v-else class="h-3 w-3" />
                      {{
                        getExpenseReviewStatus(expense, expense.originalIndex)
                          ?.reviewed
                          ? 'Reviewed'
                          : 'Pending'
                      }}
                    </button>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4 text-center">
                    <span class="text-foreground/40 text-sm">View Only</span>
                  </td>
                </tr>

                <!-- No Results Message -->
                <tr
                  v-if="filteredExpenses.length === 0 && allExpenses.length > 0"
                >
                  <td colspan="5" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center">
                      <div class="mb-4 rounded-full p-3">
                        <Filter class="text-foreground/40 h-8 w-8" />
                      </div>
                      <h3 class="text-foreground mb-2 font-semibold">
                        No expenses match your criteria
                      </h3>
                      <p class="text-foreground/60 mb-4 text-sm">
                        Try adjusting your filters or search terms
                      </p>
                      <button
                        @click="clearFilters"
                        class="text-primary hover:text-primary/80 text-sm transition-colors"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


      </div>

      <!-- No Expenses Message -->
      <div
        v-if="allExpenses.length === 0"
        class="rounded-xl border p-12 text-center"
      >
        <div class="mx-auto mb-6 w-fit rounded-full p-4">
          <Eye class="text-foreground/40 h-12 w-12" />
        </div>
        <h3 class="text-foreground mb-3 text-xl font-semibold">
          No Expenses Found
        </h3>
        <p class="text-foreground/60 mx-auto max-w-md">
          No expense data was extracted from your documents. Please ensure your
          documents contain expense information.
        </p>
      </div>

      <!-- Complete Review Button -->
      <div v-if="allExpenses.length > 0" class="flex justify-center pt-8">
        <button
          @click="completeExpenseReview"
          :disabled="!canCompleteReview || props.disabled || isLoading"
          :class="[
            'flex items-center gap-3 rounded-xl px-8 py-4 font-semibold transition-all',
            canCompleteReview && !props.disabled && !isLoading
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl'
              : 'bg-muted text-foreground/40 cursor-not-allowed',
          ]"
        >
          <Loader2 v-if="isLoading" class="h-5 w-5 animate-spin" />
          <Check v-else class="h-5 w-5" />
          {{
            isLoading ? 'Processing Review...' : 'Complete Review & Continue'
          }}
        </button>
      </div>
    </div>

    <!-- Disabled overlay -->
    <WorkflowDisabledOverlay :disabled="props.disabled" />
  </div>
</template>
