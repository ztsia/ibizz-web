<script lang="ts" setup>
import { ref, computed, watch, h, onMounted } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import {
  PlusOutlined,
  SaveOutlined,
  EditOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons-vue';
import {
  Card,
  Button,
  Input,
  Select,
  InputNumber,
  Divider,
  Tag,
  Row,
  Col,
  Form,
  message,
} from 'ant-design-vue';
import SharedTimeline from '../shared/SharedTimeline.vue';
import FinancialItemRow from '../shared/FinancialItemRow.vue';
import type { TimelineStep, TimelineConfig } from '../../types';
import type {
  WorkflowManualEntryProps as Props,
  WorkflowManualEntryEmits as Emits,
  BalanceSheetItem,
  IncomeStatementItem,
} from '../../types/workflow-types';
import { useTaxFilingStore } from '#/store/tax-filing';
import type { FinancialItem } from '#/store/tax-filing';

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<Emits>();
const taxFilingStore = useTaxFilingStore();

// Initialize modals
const [BalanceSheetModal, balanceSheetModalApi] = useVbenModal({
  title: 'Balance Sheet Entry',
  width: '1200px',
  footer: false,
});

const [IncomeStatementModal, incomeStatementModalApi] = useVbenModal({
  title: 'Income Statement Entry',
  width: '1200px',
  footer: false,
});

const showTimeline = ref(true);
const timelineCompleted = ref(false);

// Search and Filter
const searchText = ref('');
const selectedFilter = ref('all');
const editingItemId = ref<string | null>(null);

// Balance Sheet Search and Filter
const bsSearchTerm = ref('');
const bsFilterType = ref<string>('');

// Income Statement Search and Filter
const isSearchTerm = ref('');
const isFilterType = ref<string>('');

// Balance Sheet Data
const balanceSheetItems = ref<BalanceSheetItem[]>([]);
const selectedBSType = ref<string>('');
const selectedBSGroup = ref<string>('');
const newBSItemDescription = ref('');
const newBSItemAmount = ref<number>(0);

// New reactive objects for forms
const newBSItem = ref({
  name: '',
  type: '',
  amount: 0
});

// Income Statement Data
const incomeStatementItems = ref<IncomeStatementItem[]>([]);
const selectedISTitle = ref<string>('');
const selectedISGroup = ref<string>('');
const newISItemDescription = ref('');
const newISItemAmount = ref<number>(0);
const newISItemDisallow = ref(false);
const newISItemDisallowAmount = ref<number>(0);

const newISItem = ref({
  name: '',
  type: '',
  amount: 0,
  disallow: false,
  disallowAmount: 0
});

// Balance Sheet structure
const balanceSheetStructure = {
  'fixed-assets': {
    label: 'Fixed Assets',
    groups: [
      'Land & building',
      'Plant & machinery',
      'Motor vehicles',
      'Other fixed assets',
    ],
  },
  investment: {
    label: 'Investment',
    groups: ['Investment'],
  },
  'current-assets': {
    label: 'Current Assets',
    groups: [
      'Inventories',
      'Trade receivables',
      'Other receivables',
      'Loan to directors',
      'Cash in hand & Cash at bank',
      'Other current assets',
    ],
  },
  'current-liabilities': {
    label: 'Current Liabilities',
    groups: [
      'Loan & overdrafts',
      'Trade payables',
      'Other payables',
      'Loan from directors',
      'Other current liabilities',
    ],
  },
  capital: {
    label: 'Capital',
    groups: ['Capital', 'Profit/Loss appropriation account', 'Reserve account'],
  },
  'long-term-liabilities': {
    label: 'Long Term Liabilities',
    groups: ['Long term liabilities'],
  },
};

// Income Statement structure
const incomeStatementStructure = {
  revenue: {
    label: 'Revenue',
    groups: ['Revenue'],
  },
  'cost-of-sales': {
    label: 'Cost of Sales',
    groups: [
      'Opening Stocks',
      'Cost of Production',
      'Purchases',
      'Closing Stocks',
    ],
  },
  'other-income': {
    label: 'Other Income',
    groups: [
      'Foreign Currency Exchange Gain',
      'Other Business Income',
      'Other Income',
      'Non-taxable profits',
    ],
  },
  'operating-expenses': {
    label: 'Operating Expenses',
    groups: [
      'Interest',
      'Professional, technical, management and legal fees',
      'Technical fee payments to non-resident recipients',
      'Contract payments',
      "Directors' fee",
      'Salaries and wages',
      'Cost of employee share option',
      'Royalties',
      'Rental / Lease',
      'Maintenance and repairs',
      'Research and development',
      'Promotion and advertisement',
      'Travelling and accommodation',
      'Foreign currency exchange loss',
      'Input tax not claimable from Royal Malaysian Customs Department',
      'Other expenses',
    ],
  },
};

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Manual Entry Coordinator Assignment',
    description: 'Assigning manual entry and validation agents',
    details: ['Manual Entry Agent assigned', 'Validation Agent activated'],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying entry and validation agents',
    details: ['Manual Entry Agent deployed', 'Validation Agent synchronized'],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Entry Interface Preparation',
    description: 'Preparing manual entry interface',
    details: [
      'Entry interface initialized',
      'Balance sheet structure loaded',
      'Income statement structure loaded',
      'Validation rules activated',
    ],
    hasProgress: true,
    progressKey: 'preparation',
  },
  {
    id: 4,
    title: 'Manual Entry System Ready',
    description: 'Manual entry system ready for data input',
    details: ['Entry system fully operational', 'Ready for data input'],
  },
];

const timelineConfig: TimelineConfig = {
  stepTimings: [500, 1000, 2500, 3500],
  progressConfigs: {
    deployment: { increment: 25, interval: 100 },
    preparation: { increment: 10, interval: 250 },
  },
  autoCollapseDelay: 2000,
};

// Balance Sheet Computed Properties
const availableBSGroups = computed(() => {
  if (!selectedBSType.value) return [];
  return (
    balanceSheetStructure[
      selectedBSType.value as keyof typeof balanceSheetStructure
    ]?.groups || []
  );
});

const groupedBSItems = computed(() => {
  const grouped: Record<string, BalanceSheetItem[]> = {};

  balanceSheetItems.value.forEach((item) => {
    if (!grouped[item.type]) {
      grouped[item.type] = [];
    }
    grouped[item.type].push(item);
  });

  return grouped;
});

const bsTypeTotals = computed(() => {
  const totals: Record<string, number> = {};

  Object.keys(groupedBSItems.value).forEach((type) => {
    totals[type] = groupedBSItems.value[type].reduce(
      (sum, item) => sum + item.amount,
      0,
    );
  });

  return totals;
});

const assetTotal = computed(() => {
  return (
    (bsTypeTotals.value['fixed-assets'] || 0) +
    (bsTypeTotals.value.investment || 0) +
    (bsTypeTotals.value['current-assets'] || 0)
  );
});

const liabilityAndEquityTotal = computed(() => {
  return (
    (bsTypeTotals.value['current-liabilities'] || 0) +
    (bsTypeTotals.value.capital || 0) +
    (bsTypeTotals.value['long-term-liabilities'] || 0)
  );
});

const isBalanced = computed(() => {
  return Math.abs(assetTotal.value - liabilityAndEquityTotal.value) < 0.01;
});

// Income Statement Computed Properties
const availableISGroups = computed(() => {
  if (!selectedISTitle.value) return [];
  return (
    incomeStatementStructure[
      selectedISTitle.value as keyof typeof incomeStatementStructure
    ]?.groups || []
  );
});

const groupedISItems = computed(() => {
  const grouped: Record<string, IncomeStatementItem[]> = {};

  incomeStatementItems.value.forEach((item) => {
    if (!grouped[item.title]) {
      grouped[item.title] = [];
    }
    grouped[item.title].push(item);
  });

  return grouped;
});

const isTitleTotals = computed(() => {
  const totals: Record<string, number> = {};

  Object.keys(groupedISItems.value).forEach((title) => {
    totals[title] = groupedISItems.value[title].reduce(
      (sum, item) => sum + item.amount,
      0,
    );
  });

  return totals;
});

const totalRevenue = computed(() => isTitleTotals.value.revenue || 0);
const totalCostOfSales = computed(
  () => isTitleTotals.value['cost-of-sales'] || 0,
);
const totalOtherIncome = computed(
  () => isTitleTotals.value['other-income'] || 0,
);
const totalOperatingExpenses = computed(
  () => isTitleTotals.value['operating-expenses'] || 0,
);
const netProfit = computed(
  () =>
    totalRevenue.value -
    totalCostOfSales.value +
    totalOtherIncome.value -
    totalOperatingExpenses.value,
);

// Filtered and searchable items
const filteredBSItems = computed(() => {
  let items = balanceSheetItems.value;

  if (bsSearchTerm.value) {
    items = items.filter(item =>
      item.description.toLowerCase().includes(bsSearchTerm.value.toLowerCase()) ||
      item.group.toLowerCase().includes(bsSearchTerm.value.toLowerCase())
    );
  }

  if (bsFilterType.value) {
    items = items.filter(item => item.type === bsFilterType.value);
  }

  return items;
});

// Balance Sheet totals for summary cards
const totalAssets = computed(() => {
  return (
    (bsTypeTotals.value['fixed-assets'] || 0) +
    (bsTypeTotals.value.investment || 0) +
    (bsTypeTotals.value['current-assets'] || 0)
  );
});

const totalLiabilities = computed(() => {
  return (
    (bsTypeTotals.value['current-liabilities'] || 0) +
    (bsTypeTotals.value['non-current-liabilities'] || 0)
  );
});

const filteredISItems = computed(() => {
  let items = incomeStatementItems.value;

  if (isSearchTerm.value) {
    items = items.filter(item =>
      item.description.toLowerCase().includes(isSearchTerm.value.toLowerCase()) ||
      item.group.toLowerCase().includes(isSearchTerm.value.toLowerCase())
    );
  }

  if (isFilterType.value) {
    items = items.filter(item => item.title === isFilterType.value);
  }

  return items;
});

// Income Statement computed properties
const isTypeTotals = computed(() => {
  const totals: Record<string, number> = {};
  
  incomeStatementItems.value.forEach((item) => {
    if (!totals[item.title]) {
      totals[item.title] = 0;
    }
    totals[item.title] += item.amount;
  });
  
  return totals;
});

const totalExpenses = computed(() => {
  return (
    (isTypeTotals.value['cost-of-sales'] || 0) +
    (isTypeTotals.value['operating-expenses'] || 0) +
    (isTypeTotals.value['finance-costs'] || 0) +
    (isTypeTotals.value['tax-expenses'] || 0)
  );
});

// Timeline handlers
const handleTimelineCompleted = () => {
  timelineCompleted.value = true;
  emit('step-loaded');
};

const handleStepShown = () => {
  emit('step-loaded');
};

// Reset functions for form objects
const resetBSForm = () => {
  newBSItem.value = {
    name: '',
    type: '',
    amount: 0
  };
};

const resetISForm = () => {
  newISItem.value = {
    name: '',
    type: '',
    amount: 0,
    disallow: false,
    disallowAmount: 0
  };
};

// Balance Sheet functions
const addBalanceSheetItem = () => {
  if (!newBSItem.value.name || !newBSItem.value.type) {
    message.error('Please fill in all required fields');
    return;
  }

  const newItem: BalanceSheetItem = {
    id: Date.now().toString(),
    description: newBSItem.value.name,
    amount: newBSItem.value.amount || 0,
    type: newBSItem.value.type as any,
    group: newBSItem.value.type, // Using type as group for now
    editable: true,
  };

  balanceSheetItems.value.push(newItem);
  message.success('Balance sheet item added successfully');

  // Reset form
  resetBSForm();
};

const addBSItem = () => {
  if (
    !selectedBSType.value ||
    !selectedBSGroup.value ||
    !newBSItemDescription.value
  ) {
    return;
  }

  const newItem: BalanceSheetItem = {
    id: Date.now().toString(),
    description: newBSItemDescription.value,
    amount: newBSItemAmount.value || 0,
    type: selectedBSType.value as any,
    group: selectedBSGroup.value,
    editable: true,
  };

  balanceSheetItems.value.push(newItem);

  // Reset form
  newBSItemDescription.value = '';
  newBSItemAmount.value = 0;
};

const removeBSItem = (id: string) => {
  const index = balanceSheetItems.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    balanceSheetItems.value.splice(index, 1);
  }
};

const updateBSItemAmount = (id: string, amount: number) => {
  const item = balanceSheetItems.value.find((item) => item.id === id);
  if (item) {
    item.amount = amount;
  }
};

const updateBSItemField = (id: string, field: keyof BalanceSheetItem, value: any) => {
  const item = balanceSheetItems.value.find((item) => item.id === id);
  if (item) {
    (item as any)[field] = value;
  }
};

const startEditingBSItem = (id: string) => {
  editingItemId.value = id;
};

const stopEditingBSItem = () => {
  editingItemId.value = null;
};

// Convert BalanceSheetItem to FinancialItem for FinancialItemRow component
const convertBSItemToFinancialItem = (item: BalanceSheetItem): FinancialItem => {
  const typeMapping: Record<string, FinancialItem['type']> = {
    'fixed-assets': 'non-current-asset',
    investment: 'non-current-asset',
    'current-assets': 'current-asset',
    'current-liabilities': 'current-liability',
    capital: 'capital',
    'long-term-liabilities': 'long-term-liability',
  };

  return {
    id: item.id,
    description: item.description,
    amount: item.amount,
    sheet_source: 'Manual Entry - Balance Sheet',
    type: typeMapping[item.type] || 'current-asset',
    editable: true,
  };
};

// Handle FinancialItemRow events for Balance Sheet
const handleBSItemAmountUpdate = (financialItem: FinancialItem, value: any) => {
  updateBSItemAmount(financialItem.id, value || 0);
};

const handleBSItemDescriptionUpdate = (financialItem: FinancialItem, value: string) => {
  updateBSItemField(financialItem.id, 'description', value);
};

const handleBSItemRemove = (financialItem: FinancialItem) => {
  removeBSItem(financialItem.id);
};

// Income Statement functions
// Income Statement functions
const addIncomeStatementItem = () => {
  if (!newISItem.value.name || !newISItem.value.type) {
    message.error('Please fill in all required fields');
    return;
  }

  const newItem: IncomeStatementItem = {
    id: Date.now().toString(),
    description: newISItem.value.name,
    amount: newISItem.value.amount || 0,
    title: newISItem.value.type as any,
    group: newISItem.value.type, // Using type as group for now
    disallow: newISItem.value.disallow,
    disallowAmount: newISItem.value.disallow ? newISItem.value.disallowAmount || 0 : 0,
    editable: true,
  };

  incomeStatementItems.value.push(newItem);
  message.success('Income statement item added successfully');

  // Reset form
  resetISForm();
};

const addISItem = () => {
  if (
    !selectedISTitle.value ||
    !selectedISGroup.value ||
    !newISItemDescription.value
  ) {
    return;
  }

  const newItem: IncomeStatementItem = {
    id: Date.now().toString(),
    description: newISItemDescription.value,
    amount: newISItemAmount.value || 0,
    title: selectedISTitle.value as any,
    group: selectedISGroup.value,
    disallow: newISItemDisallow.value,
    disallowAmount: newISItemDisallow.value
      ? newISItemDisallowAmount.value || 0
      : 0,
    editable: true,
  };

  incomeStatementItems.value.push(newItem);

  // Reset form
  newISItemDescription.value = '';
  newISItemAmount.value = 0;
  newISItemDisallow.value = false;
  newISItemDisallowAmount.value = 0;
};

const removeISItem = (id: string) => {
  const index = incomeStatementItems.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    incomeStatementItems.value.splice(index, 1);
  }
};

const updateISItemAmount = (id: string, amount: number) => {
  const item = incomeStatementItems.value.find((item) => item.id === id);
  if (item) {
    item.amount = amount;
  }
};

const updateISItemDisallow = (id: string, disallow: boolean) => {
  const item = incomeStatementItems.value.find((item) => item.id === id);
  if (item) {
    item.disallow = disallow;
    if (!disallow) {
      item.disallowAmount = 0;
    }
  }
};

const updateISItemDisallowAmount = (id: string, amount: number) => {
  const item = incomeStatementItems.value.find((item) => item.id === id);
  if (item) {
    item.disallowAmount = amount;
  }
};

const updateISItemField = (id: string, field: keyof IncomeStatementItem, value: any) => {
  const item = incomeStatementItems.value.find((item) => item.id === id);
  if (item) {
    (item as any)[field] = value;
  }
};

const startEditingISItem = (id: string) => {
  editingItemId.value = id;
};

const stopEditingISItem = () => {
  editingItemId.value = null;
};

// Convert IncomeStatementItem to FinancialItem for FinancialItemRow component
const convertISItemToFinancialItem = (item: IncomeStatementItem): FinancialItem => {
  const typeMapping: Record<string, FinancialItem['type']> = {
    revenue: 'sales',
    'cost-of-sales': 'direct-cost',
    'other-income': 'other-income',
    'operating-expenses': 'operating-expense',
  };

  return {
    id: item.id,
    description: item.description,
    amount: item.amount,
    sheet_source: 'Manual Entry - Income Statement',
    type: typeMapping[item.title] || 'operating-expense',
    editable: true,
  };
};

// Handle FinancialItemRow events for Income Statement
const handleISItemAmountUpdate = (financialItem: FinancialItem, value: any) => {
  updateISItemAmount(financialItem.id, value || 0);
};

const handleISItemDescriptionUpdate = (financialItem: FinancialItem, value: string) => {
  updateISItemField(financialItem.id, 'description', value);
};

const handleISItemRemove = (financialItem: FinancialItem) => {
  removeISItem(financialItem.id);
};

// Modal functions
const openBalanceSheetModal = () => {
  balanceSheetModalApi.open();
};

const openIncomeStatementModal = () => {
  incomeStatementModalApi.open();
};

const saveBalanceSheet = () => {
  balanceSheetModalApi.close();
};

const saveIncomeStatement = () => {
  incomeStatementModalApi.close();
};

// Clear search and filters
const clearFilters = () => {
  searchText.value = '';
  selectedFilter.value = 'all';
};

// Sync data to store
const syncDataToStore = () => {
  try {
    // Convert and add balance sheet items to store
    balanceSheetItems.value.forEach((item) => {
      const financialItem = convertBSItemToFinancialItem(item);
      taxFilingStore.addBSItem(financialItem);
    });

    // Convert and add income statement items to store
    incomeStatementItems.value.forEach((item) => {
      const financialItem = convertISItemToFinancialItem(item);
      taxFilingStore.addPLItem(financialItem);
    });

    message.success('Manual entry data synchronized to store successfully!');
  } catch (error) {
    console.error('Error syncing data to store:', error);
    message.error('Failed to sync data to store');
  }
};

// Complete step
const completeStep = () => {
  // Sync data to store first
  syncDataToStore();

  const data = {
    balanceSheet: {
      items: balanceSheetItems.value,
      totals: {
        assetTotal: assetTotal.value,
        liabilityAndEquityTotal: liabilityAndEquityTotal.value,
        isBalanced: isBalanced.value,
      },
    },
    incomeStatement: {
      items: incomeStatementItems.value,
      totals: {
        revenue: totalRevenue.value,
        costOfSales: totalCostOfSales.value,
        otherIncome: totalOtherIncome.value,
        operatingExpenses: totalOperatingExpenses.value,
        netProfit: netProfit.value,
      },
    },
  };

  emit('step-complete', data);
};

// Load existing data from store on mount
onMounted(() => {
  // Load existing balance sheet items from store
  const existingBSItems = taxFilingStore.bsItems;
  existingBSItems.forEach((item) => {
    if (item.sheet_source?.includes('Manual Entry')) {
      const bsItem: BalanceSheetItem = {
        id: item.id,
        description: item.description,
        amount: item.amount,
        type:
          item.type === 'current-asset'
            ? 'current-assets'
            : item.type === 'non-current-asset'
              ? 'fixed-assets'
              : item.type === 'current-liability'
                ? 'current-liabilities'
                : item.type === 'capital'
                  ? 'capital'
                  : item.type === 'long-term-liability'
                    ? 'long-term-liabilities'
                    : 'current-assets',
        group: 'Imported from Store',
        editable: true,
      };
      balanceSheetItems.value.push(bsItem);
    }
  });

  // Load existing P&L items from store
  const existingPLItems = taxFilingStore.plItems;
  existingPLItems.forEach((item) => {
    if (item.sheet_source?.includes('Manual Entry')) {
      const isItem: IncomeStatementItem = {
        id: item.id,
        description: item.description,
        amount: item.amount,
        title:
          item.type === 'sales'
            ? 'revenue'
            : item.type === 'direct-cost'
              ? 'cost-of-sales'
              : item.type === 'other-income'
                ? 'other-income'
                : item.type === 'operating-expense'
                  ? 'operating-expenses'
                  : 'operating-expenses',
        group: 'Imported from Store',
        disallow: false,
        disallowAmount: 0,
        editable: true,
      };
      incomeStatementItems.value.push(isItem);
    }
  });
});

// Watch for disallow checkbox changes
watch(newISItemDisallow, (newVal) => {
  if (!newVal) {
    newISItemDisallowAmount.value = 0;
  }
});

// Auto-sync data to store when items change
watch(
  [balanceSheetItems, incomeStatementItems],
  () => {
    // Auto-sync could be implemented here if needed
    // For now, we'll sync only on manual save to avoid performance issues
  },
  { deep: true },
);
</script>

<template>
  <div class="relative">
    <!-- Timeline -->
    <SharedTimeline
      v-if="showTimeline"
      :steps="timelineSteps"
      :config="timelineConfig"
      @completed="handleTimelineCompleted"
      @step-shown="handleStepShown"
    />

    <!-- Main Content -->
    <div v-if="timelineCompleted" class="space-y-8">
      <!-- Header Section -->
      <div class="text-center">
        <h1 class="mb-3 text-3xl font-bold">Manual Entry Workspace</h1>
        <p class="text-lg opacity-75">
          Create and manage your financial entries with enhanced editing capabilities
        </p>
      </div>

      <!-- Search and Filter Bar -->
      <Card class="shadow-sm">
        <div class="flex flex-wrap items-center gap-4 p-4">
          <div class="flex-1 min-w-[300px]">
            <Input
              v-model:value="searchText"
              placeholder="Search items by description or group..."
              :prefix="h(SearchOutlined)"
              size="large"
              class="w-full"
            />
          </div>
          <div class="flex items-center gap-3">
            <Select
              v-model:value="selectedFilter"
              placeholder="Filter by type"
              size="large"
              class="min-w-[150px]"
              :options="[
                { value: 'all', label: 'All Types' },
                { value: 'fixed-assets', label: 'Fixed Assets' },
                { value: 'current-assets', label: 'Current Assets' },
                { value: 'current-liabilities', label: 'Current Liabilities' },
                { value: 'capital', label: 'Capital' },
                { value: 'revenue', label: 'Revenue' },
                { value: 'operating-expenses', label: 'Operating Expenses' },
              ]"
            />
            <Button @click="clearFilters" :icon="h(FilterOutlined)">
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <!-- Entry Options with Enhanced Stats -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Balance Sheet Entry -->
        <Card class="shadow-lg hover:shadow-xl transition-all duration-300">
          <div class="p-8">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-4">
                <div class="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                  <EditOutlined class="text-3xl text-blue-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-1">Balance Sheet</h3>
                  <p class="opacity-75">Assets, Liabilities & Equity</p>
                </div>
              </div>
              <Tag class="text-lg px-3 py-1" :color="balanceSheetItems.length > 0 ? 'blue' : 'default'">
                {{ balanceSheetItems.length }} items
              </Tag>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="text-center p-3 rounded-lg border">
                <div class="text-2xl font-bold text-blue-600">RM {{ assetTotal.toLocaleString() }}</div>
                <div class="text-sm opacity-75">Total Assets</div>
              </div>
              <div class="text-center p-3 rounded-lg border">
                <div class="text-2xl font-bold text-red-600">RM {{ liabilityAndEquityTotal.toLocaleString() }}</div>
                <div class="text-sm opacity-75">Liabilities & Equity</div>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <span class="font-medium">Balance Status:</span>
              <Tag :color="isBalanced ? 'green' : 'orange'" class="text-sm">
                {{ isBalanced ? '✓ Balanced' : '⚠ Not Balanced' }}
              </Tag>
            </div>

            <Button
              type="primary"
              size="large"
              block
              :icon="h(EditOutlined)"
              @click="openBalanceSheetModal"
              class="h-12 text-base font-semibold"
            >
              Manage Balance Sheet Entries
            </Button>
          </div>
        </Card>

        <!-- Income Statement Entry -->
        <Card class="shadow-lg hover:shadow-xl transition-all duration-300">
          <div class="p-8">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-4">
                <div class="rounded-xl p-4 bg-gradient-to-br from-green-50 to-green-100">
                  <FileTextOutlined class="text-3xl text-green-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-1">Income Statement</h3>
                  <p class="opacity-75">Revenue, Expenses & Income</p>
                </div>
              </div>
              <Tag class="text-lg px-3 py-1" :color="incomeStatementItems.length > 0 ? 'green' : 'default'">
                {{ incomeStatementItems.length }} items
              </Tag>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="text-center p-3 rounded-lg border">
                <div class="text-2xl font-bold text-green-600">RM {{ totalRevenue.toLocaleString() }}</div>
                <div class="text-sm opacity-75">Total Revenue</div>
              </div>
              <div class="text-center p-3 rounded-lg border">
                <div class="text-2xl font-bold text-red-600">RM {{ (totalCostOfSales + totalOperatingExpenses).toLocaleString() }}</div>
                <div class="text-sm opacity-75">Total Expenses</div>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <span class="font-medium">Net Profit:</span>
              <span class="text-xl font-bold" :class="netProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                RM {{ netProfit.toLocaleString() }}
              </span>
            </div>

            <Button
              type="primary"
              size="large"
              block
              :icon="h(FileTextOutlined)"
              @click="openIncomeStatementModal"
              class="h-12 text-base font-semibold"
            >
              Manage Income Statement Entries
            </Button>
          </div>
        </Card>
      </div>

      <!-- Detailed Summary Section -->
      <div v-if="balanceSheetItems.length > 0 || incomeStatementItems.length > 0" class="space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-2">Financial Overview</h2>
          <p class="opacity-75">Comprehensive summary of your manual entries</p>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <!-- Balance Sheet Detailed Summary -->
          <Card class="shadow-lg" v-if="balanceSheetItems.length > 0">
            <template #title>
              <div class="flex items-center gap-2">
                <EditOutlined class="text-blue-600" />
                <span>Balance Sheet Details</span>
              </div>
            </template>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-3 rounded-lg border border-blue-200">
                  <div class="text-xl font-bold text-blue-600">{{ Object.keys(groupedBSItems).length }}</div>
                  <div class="text-xs opacity-75">Categories</div>
                </div>
                <div class="text-center p-3 rounded-lg border border-blue-200">
                  <div class="text-xl font-bold text-blue-600">{{ balanceSheetItems.length }}</div>
                  <div class="text-xs opacity-75">Total Items</div>
                </div>
              </div>

              <Divider class="my-3" />

              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium">Assets:</span>
                  <span class="font-bold text-blue-600">RM {{ assetTotal.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium">Liabilities & Equity:</span>
                  <span class="font-bold text-red-600">RM {{ liabilityAndEquityTotal.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t">
                  <span class="font-medium">Difference:</span>
                  <span class="font-bold" :class="isBalanced ? 'text-green-600' : 'text-orange-600'">
                    RM {{ Math.abs(assetTotal - liabilityAndEquityTotal).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <!-- Income Statement Detailed Summary -->
          <Card class="shadow-lg" v-if="incomeStatementItems.length > 0">
            <template #title>
              <div class="flex items-center gap-2">
                <FileTextOutlined class="text-green-600" />
                <span>Income Statement Details</span>
              </div>
            </template>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-3 rounded-lg border border-green-200">
                  <div class="text-xl font-bold text-green-600">{{ Object.keys(groupedISItems).length }}</div>
                  <div class="text-xs opacity-75">Categories</div>
                </div>
                <div class="text-center p-3 rounded-lg border border-green-200">
                  <div class="text-xl font-bold text-green-600">{{ incomeStatementItems.length }}</div>
                  <div class="text-xs opacity-75">Total Items</div>
                </div>
              </div>

              <Divider class="my-3" />

              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium">Revenue:</span>
                  <span class="font-bold text-green-600">RM {{ totalRevenue.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium">Cost of Sales:</span>
                  <span class="font-bold text-red-600">RM {{ totalCostOfSales.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium">Operating Expenses:</span>
                  <span class="font-bold text-red-600">RM {{ totalOperatingExpenses.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium">Other Income:</span>
                  <span class="font-bold text-green-600">RM {{ totalOtherIncome.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t">
                  <span class="font-medium">Net Profit:</span>
                  <span class="font-bold text-lg" :class="netProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                    RM {{ netProfit.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <!-- Overall Status Card -->
          <Card class="shadow-lg">
            <template #title>
              <div class="flex items-center gap-2">
                <SaveOutlined class="text-purple-600" />
                <span>Entry Status</span>
              </div>
            </template>
            <div class="space-y-4">
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600 mb-2">
                  {{ balanceSheetItems.length + incomeStatementItems.length }}
                </div>
                <div class="text-sm opacity-75">Total Entries</div>
              </div>

              <Divider class="my-3" />

              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm">Balance Sheet:</span>
                  <Tag :color="balanceSheetItems.length > 0 ? 'blue' : 'default'">
                    {{ balanceSheetItems.length }} items
                  </Tag>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm">Income Statement:</span>
                  <Tag :color="incomeStatementItems.length > 0 ? 'green' : 'default'">
                    {{ incomeStatementItems.length }} items
                  </Tag>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm">Balance Status:</span>
                  <Tag :color="isBalanced ? 'green' : 'orange'">
                    {{ isBalanced ? '✓ Balanced' : '⚠ Unbalanced' }}
                  </Tag>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center pt-8">
        <div class="flex flex-col items-center gap-4">
          <Button
            type="primary"
            size="large"
            :icon="h(SaveOutlined)"
            @click="completeStep"
            :disabled="balanceSheetItems.length === 0 && incomeStatementItems.length === 0"
            class="h-14 px-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Complete Manual Entry Process
          </Button>
          <p class="text-sm opacity-75 text-center max-w-md">
            Save all your manual entries and proceed to the next step in the tax filing workflow
          </p>
        </div>
      </div>
    </div>

    <!-- Balance Sheet Modal -->
    <BalanceSheetModal>
      <div class="min-h-screen p-6 space-y-6">
        <!-- Modern Header -->
        <div class="text-center pb-6 border-b">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div class="rounded-xl p-3 bg-gradient-to-br from-blue-50 to-blue-100">
              <EditOutlined class="text-2xl text-blue-600" />
            </div>
            <div>
              <h1 class="text-2xl font-bold">Balance Sheet Entry</h1>
              <p class="opacity-75">Manage your assets, liabilities, and equity</p>
            </div>
          </div>
          <div class="flex items-center justify-center gap-6 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>{{ balanceSheetItems.length }} Total Items</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" :class="isBalanced ? 'bg-green-500' : 'bg-orange-500'"></span>
              <span>{{ isBalanced ? 'Balanced' : 'Unbalanced' }}</span>
            </div>
          </div>
        </div>

        <!-- Add New Item Section -->
        <Card class="shadow-lg">
          <template #title>
            <div class="flex items-center gap-3">
              <div class="rounded-lg p-2 bg-gradient-to-br from-blue-50 to-blue-100">
                <PlusOutlined class="text-blue-600" />
              </div>
              <span class="text-lg font-semibold">Add New Balance Sheet Item</span>
            </div>
          </template>

          <div class="space-y-6">
            <Row :gutter="[16, 16]">
              <Col :span="12">
                <Form.Item label="Item Name" name="name" :rules="[{ required: true, message: 'Please enter item name' }]">
                  <Input v-model:value="newBSItem.name" placeholder="Enter item name" size="large" />
                </Form.Item>
              </Col>
              <Col :span="12">
                <Form.Item label="Category" name="type" :rules="[{ required: true, message: 'Please select category' }]">
                  <Select v-model:value="newBSItem.type" placeholder="Select category" size="large">
                    <Select.Option value="fixed-assets">Fixed Assets</Select.Option>
                    <Select.Option value="investment">Investment</Select.Option>
                    <Select.Option value="current-assets">Current Assets</Select.Option>
                    <Select.Option value="current-liabilities">Current Liabilities</Select.Option>
                    <Select.Option value="non-current-liabilities">Non-Current Liabilities</Select.Option>
                    <Select.Option value="equity">Equity</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row :gutter="[16, 16]">
              <Col :span="24">
                <Form.Item label="Amount (RM)" name="amount" :rules="[{ required: true, message: 'Please enter amount' }]">
                  <InputNumber
                    v-model:value="newBSItem.amount"
                    :min="0"
                    :precision="2"
                    :formatter="value => `RM ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="value => value.replace(/RM\s?|(,*)/g, '')"
                    placeholder="0.00"
                    size="large"
                    class="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>

            <div class="flex justify-end gap-3 pt-4">
              <Button @click="resetBSForm" size="large">
                Reset
              </Button>
              <Button
                type="primary"
                @click="addBalanceSheetItem"
                size="large"
                :icon="h(PlusOutlined)"
                class="font-semibold"
              >
                Add Item
              </Button>
            </div>
          </div>
        </Card>

        <!-- Items Display -->
        <Card class="shadow-lg">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="rounded-lg p-2 bg-gradient-to-br from-blue-50 to-blue-100">
                  <UnorderedListOutlined class="text-blue-600" />
                </div>
                <span class="text-lg font-semibold">Balance Sheet Items</span>
              </div>
              <div class="flex items-center gap-4">
                <Input.Search
                  v-model:value="bsSearchTerm"
                  placeholder="Search items..."
                  size="large"
                  class="w-64"
                  :suffix-icon="h(SearchOutlined)"
                />
                <Select
                  v-model:value="bsFilterType"
                  placeholder="Filter by type"
                  size="large"
                  class="w-48"
                  allow-clear
                >
                  <Select.Option value="fixed-assets">Fixed Assets</Select.Option>
                  <Select.Option value="investment">Investment</Select.Option>
                  <Select.Option value="current-assets">Current Assets</Select.Option>
                  <Select.Option value="current-liabilities">Current Liabilities</Select.Option>
                  <Select.Option value="non-current-liabilities">Non-Current Liabilities</Select.Option>
                  <Select.Option value="equity">Equity</Select.Option>
                </Select>
              </div>
            </div>
          </template>

          <div class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-green-700">Total Assets</span>
                  <span class="text-xl font-bold text-green-600">
                    RM {{ totalAssets.toLocaleString() }}
                  </span>
                </div>
              </div>
              <div class="p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-red-700">Total Liabilities</span>
                  <span class="text-xl font-bold text-red-600">
                    RM {{ totalLiabilities.toLocaleString() }}
                  </span>
                </div>
              </div>
              <div class="p-4 rounded-lg border-l-4" :class="isBalanced ? 'border-blue-500 bg-blue-50' : 'border-orange-500 bg-orange-50'">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium" :class="isBalanced ? 'text-blue-700' : 'text-orange-700'">Balance Status</span>
                  <span class="text-xl font-bold" :class="isBalanced ? 'text-blue-600' : 'text-orange-600'">
                    {{ isBalanced ? '✓ Balanced' : '⚠ Unbalanced' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Items by Category -->
            <div class="space-y-6">
              <!-- Fixed Assets -->
              <div v-if="filteredBSItems.some(item => item.type === 'fixed-assets')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Fixed Assets</span>
                  <span class="font-bold text-blue-600">
                    RM {{ (bsTypeTotals['fixed-assets'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredBSItems.filter(item => item.type === 'fixed-assets')"
                    :key="item.id"
                    :item="convertBSItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleBSItemAmountUpdate"
                    @update-description="handleBSItemDescriptionUpdate"
                    @remove-item="handleBSItemRemove"
                  />
                </div>
              </div>

              <!-- Investment -->
              <div v-if="filteredBSItems.some(item => item.type === 'investment')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Investment</span>
                  <span class="font-bold text-blue-600">
                    RM {{ (bsTypeTotals['investment'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredBSItems.filter(item => item.type === 'investment')"
                    :key="item.id"
                    :item="convertBSItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleBSItemAmountUpdate"
                    @update-description="handleBSItemDescriptionUpdate"
                    @remove-item="handleBSItemRemove"
                  />
                </div>
              </div>

              <!-- Current Assets -->
              <div v-if="filteredBSItems.some(item => item.type === 'current-assets')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Current Assets</span>
                  <span class="font-bold text-blue-600">
                    RM {{ (bsTypeTotals['current-assets'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredBSItems.filter(item => item.type === 'current-assets')"
                    :key="item.id"
                    :item="convertBSItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleBSItemAmountUpdate"
                    @update-description="handleBSItemDescriptionUpdate"
                    @remove-item="handleBSItemRemove"
                  />
                </div>
              </div>

              <!-- Current Liabilities -->
              <div v-if="filteredBSItems.some(item => item.type === 'current-liabilities')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Current Liabilities</span>
                  <span class="font-bold text-red-600">
                    RM {{ (bsTypeTotals['current-liabilities'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredBSItems.filter(item => item.type === 'current-liabilities')"
                    :key="item.id"
                    :item="convertBSItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleBSItemAmountUpdate"
                    @update-description="handleBSItemDescriptionUpdate"
                    @remove-item="handleBSItemRemove"
                  />
                </div>
              </div>

              <!-- Non-Current Liabilities -->
              <div v-if="filteredBSItems.some(item => item.type === 'non-current-liabilities')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Non-Current Liabilities</span>
                  <span class="font-bold text-red-600">
                    RM {{ (bsTypeTotals['non-current-liabilities'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredBSItems.filter(item => item.type === 'non-current-liabilities')"
                    :key="item.id"
                    :item="convertBSItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleBSItemAmountUpdate"
                    @update-description="handleBSItemDescriptionUpdate"
                    @remove-item="handleBSItemRemove"
                  />
                </div>
              </div>

              <!-- Equity -->
              <div v-if="filteredBSItems.some(item => item.type === 'equity')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Equity</span>
                  <span class="font-bold text-green-600">
                    RM {{ (bsTypeTotals['equity'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredBSItems.filter(item => item.type === 'equity')"
                    :key="item.id"
                    :item="convertBSItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleBSItemAmountUpdate"
                    @update-description="handleBSItemDescriptionUpdate"
                    @remove-item="handleBSItemRemove"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Modal Footer -->
        <div class="flex justify-between items-center pt-6 border-t">
          <div class="flex items-center gap-4">
            <span class="text-sm opacity-75">{{ balanceSheetItems.length }} items total</span>
            <Tag :color="isBalanced ? 'green' : 'orange'">
              {{ isBalanced ? '✓ Balanced' : '⚠ Unbalanced' }}
            </Tag>
          </div>
          <div class="flex gap-3">
            <Button @click="balanceSheetModalApi.close()" size="large">
              Close
            </Button>
            <Button
              type="primary"
              @click="saveBalanceSheet"
              size="large"
              :icon="h(SaveOutlined)"
              class="font-semibold"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </BalanceSheetModal>

    <!-- Income Statement Modal -->
    <IncomeStatementModal>
      <div class="min-h-screen p-6 space-y-6">
        <!-- Modern Header -->
        <div class="text-center pb-6 border-b">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div class="rounded-xl p-3 bg-gradient-to-br from-green-50 to-green-100">
              <EditOutlined class="text-2xl text-green-600" />
            </div>
            <div>
              <h1 class="text-2xl font-bold">Income Statement Entry</h1>
              <p class="opacity-75">Manage your revenue, expenses, and profitability</p>
            </div>
          </div>
          <div class="flex items-center justify-center gap-6 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-green-500"></span>
              <span>{{ incomeStatementItems.length }} Total Items</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" :class="netProfit >= 0 ? 'bg-blue-500' : 'bg-orange-500'"></span>
              <span>{{ netProfit >= 0 ? 'Profitable' : 'Loss Making' }}</span>
            </div>
          </div>
        </div>

        <!-- Add New Item Section -->
        <Card class="shadow-lg">
          <template #title>
            <div class="flex items-center gap-3">
              <div class="rounded-lg p-2 bg-gradient-to-br from-green-50 to-green-100">
                <PlusOutlined class="text-green-600" />
              </div>
              <span class="text-lg font-semibold">Add New Income Statement Item</span>
            </div>
          </template>

          <div class="space-y-6">
            <Row :gutter="[16, 16]">
              <Col :span="12">
                <Form.Item label="Item Name" name="name" :rules="[{ required: true, message: 'Please enter item name' }]">
                  <Input v-model:value="newISItem.name" placeholder="Enter item name" size="large" />
                </Form.Item>
              </Col>
              <Col :span="12">
                <Form.Item label="Category" name="type" :rules="[{ required: true, message: 'Please select category' }]">
                  <Select v-model:value="newISItem.type" placeholder="Select category" size="large">
                    <Select.Option value="revenue">Revenue</Select.Option>
                    <Select.Option value="cost-of-sales">Cost of Sales</Select.Option>
                    <Select.Option value="operating-expenses">Operating Expenses</Select.Option>
                    <Select.Option value="other-income">Other Income</Select.Option>
                    <Select.Option value="finance-costs">Finance Costs</Select.Option>
                    <Select.Option value="tax-expenses">Tax Expenses</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row :gutter="[16, 16]">
              <Col :span="24">
                <Form.Item label="Amount (RM)" name="amount" :rules="[{ required: true, message: 'Please enter amount' }]">
                  <InputNumber
                    v-model:value="newISItem.amount"
                    :min="0"
                    :precision="2"
                    :formatter="value => `RM ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="value => value.replace(/RM\s?|(,*)/g, '')"
                    placeholder="0.00"
                    size="large"
                    class="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>

            <div class="flex justify-end gap-3 pt-4">
              <Button @click="resetISForm" size="large">
                Reset
              </Button>
              <Button
                type="primary"
                @click="addIncomeStatementItem"
                size="large"
                :icon="h(PlusOutlined)"
                class="font-semibold"
              >
                Add Item
              </Button>
            </div>
          </div>
        </Card>

        <!-- Items Display -->
        <Card class="shadow-lg">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="rounded-lg p-2 bg-gradient-to-br from-green-50 to-green-100">
                  <UnorderedListOutlined class="text-green-600" />
                </div>
                <span class="text-lg font-semibold">Income Statement Items</span>
              </div>
              <div class="flex items-center gap-4">
                <Input.Search
                  v-model:value="isSearchTerm"
                  placeholder="Search items..."
                  size="large"
                  class="w-64"
                  :suffix-icon="h(SearchOutlined)"
                />
                <Select
                  v-model:value="isFilterType"
                  placeholder="Filter by type"
                  size="large"
                  class="w-48"
                  allow-clear
                >
                  <Select.Option value="revenue">Revenue</Select.Option>
                  <Select.Option value="cost-of-sales">Cost of Sales</Select.Option>
                  <Select.Option value="operating-expenses">Operating Expenses</Select.Option>
                  <Select.Option value="other-income">Other Income</Select.Option>
                  <Select.Option value="finance-costs">Finance Costs</Select.Option>
                  <Select.Option value="tax-expenses">Tax Expenses</Select.Option>
                </Select>
              </div>
            </div>
          </template>

          <div class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-green-700">Total Revenue</span>
                  <span class="text-xl font-bold text-green-600">
                    RM {{ (isTypeTotals['revenue'] || 0).toLocaleString() }}
                  </span>
                </div>
              </div>
              <div class="p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-red-700">Total Expenses</span>
                  <span class="text-xl font-bold text-red-600">
                    RM {{ totalExpenses.toLocaleString() }}
                  </span>
                </div>
              </div>
              <div class="p-4 rounded-lg border-l-4" :class="netProfit >= 0 ? 'border-blue-500 bg-blue-50' : 'border-orange-500 bg-orange-50'">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium" :class="netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'">Net Profit</span>
                  <span class="text-xl font-bold" :class="netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'">
                    RM {{ netProfit.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Items by Category -->
            <div class="space-y-6">
              <!-- Revenue -->
              <div v-if="filteredISItems.some(item => item.type === 'revenue')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Revenue</span>
                  <span class="font-bold text-green-600">
                    RM {{ (isTypeTotals['revenue'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredISItems.filter(item => item.type === 'revenue')"
                    :key="item.id"
                    :item="convertISItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleISItemAmountUpdate"
                    @update-description="handleISItemDescriptionUpdate"
                    @remove-item="handleISItemRemove"
                  />
                </div>
              </div>

              <!-- Cost of Sales -->
              <div v-if="filteredISItems.some(item => item.type === 'cost-of-sales')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Cost of Sales</span>
                  <span class="font-bold text-red-600">
                    RM {{ (isTypeTotals['cost-of-sales'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredISItems.filter(item => item.type === 'cost-of-sales')"
                    :key="item.id"
                    :item="convertISItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleISItemAmountUpdate"
                    @update-description="handleISItemDescriptionUpdate"
                    @remove-item="handleISItemRemove"
                  />
                </div>
              </div>

              <!-- Operating Expenses -->
              <div v-if="filteredISItems.some(item => item.type === 'operating-expenses')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Operating Expenses</span>
                  <span class="font-bold text-red-600">
                    RM {{ (isTypeTotals['operating-expenses'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredISItems.filter(item => item.type === 'operating-expenses')"
                    :key="item.id"
                    :item="convertISItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleISItemAmountUpdate"
                    @update-description="handleISItemDescriptionUpdate"
                    @remove-item="handleISItemRemove"
                  />
                </div>
              </div>

              <!-- Other Income -->
              <div v-if="filteredISItems.some(item => item.type === 'other-income')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Other Income</span>
                  <span class="font-bold text-green-600">
                    RM {{ (isTypeTotals['other-income'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredISItems.filter(item => item.type === 'other-income')"
                    :key="item.id"
                    :item="convertISItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleISItemAmountUpdate"
                    @update-description="handleISItemDescriptionUpdate"
                    @remove-item="handleISItemRemove"
                  />
                </div>
              </div>

              <!-- Finance Costs -->
              <div v-if="filteredISItems.some(item => item.type === 'finance-costs')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Finance Costs</span>
                  <span class="font-bold text-red-600">
                    RM {{ (isTypeTotals['finance-costs'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredISItems.filter(item => item.type === 'finance-costs')"
                    :key="item.id"
                    :item="convertISItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleISItemAmountUpdate"
                    @update-description="handleISItemDescriptionUpdate"
                    @remove-item="handleISItemRemove"
                  />
                </div>
              </div>

              <!-- Tax Expenses -->
              <div v-if="filteredISItems.some(item => item.type === 'tax-expenses')">
                <div class="flex items-center justify-between p-3 rounded-lg border">
                  <span class="font-semibold">Tax Expenses</span>
                  <span class="font-bold text-red-600">
                    RM {{ (isTypeTotals['tax-expenses'] || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="ml-4 space-y-2 mt-2">
                  <FinancialItemRow
                    v-for="(item, index) in filteredISItems.filter(item => item.type === 'tax-expenses')"
                    :key="item.id"
                    :item="convertISItemToFinancialItem(item)"
                    :index="index"
                    :can-edit="true"
                    @update-amount="handleISItemAmountUpdate"
                    @update-description="handleISItemDescriptionUpdate"
                    @remove-item="handleISItemRemove"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Modal Footer -->
        <div class="flex justify-between items-center pt-6 border-t">
          <div class="flex items-center gap-4">
            <span class="text-sm opacity-75">{{ incomeStatementItems.length }} items total</span>
            <Tag :color="netProfit >= 0 ? 'green' : 'red'">
              {{ netProfit >= 0 ? '✓ Profitable' : '⚠ Loss Making' }}
            </Tag>
          </div>
          <div class="flex gap-3">
            <Button @click="incomeStatementModalApi.close()" size="large">
              Close
            </Button>
            <Button
              type="primary"
              @click="saveIncomeStatement"
              size="large"
              :icon="h(SaveOutlined)"
              class="font-semibold"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </IncomeStatementModal>
  </div>
</template>
