<script lang="ts" setup>
import { ref, h, computed } from 'vue';
import {
  Button,
  Input,
  InputNumber,
  Table,
  Checkbox,
  Typography,
  Select,
  message,
} from 'ant-design-vue';
import {
  PlusOutlined,
  EditOutlined,
  DownloadOutlined,
  CalculatorOutlined,
} from '@ant-design/icons-vue';
import { useVbenModal } from '@vben/common-ui';
import { useTaxFilingStore } from '#/store/tax-filing';
import type { InterestIncomeItem } from '#/store/tax-filing';

const { Title } = Typography;

// Use the store
const taxFilingStore = useTaxFilingStore();

interface Props {
  title?: string;
}

interface Emits {
  (e: 'save', data: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Interest Income',
});

const emit = defineEmits<Emits>();

// Initialize Vben modal for Interest Income
const [InterestIncomeModal, interestIncomeModalApi] = useVbenModal({
  title: 'Interest Income',
  showConfirmButton: false,
});

// Expose modal API
defineExpose({
  interestIncomeModalApi,
});

// Add form state
const showAddForm = ref(false);
const isExtracting = ref(false);

// Form data for adding new items
const formData = ref<InterestIncomeItem>({
  id: '',
  assetDescription: 'DIRECTOR',
  amount: 222,
  deemedInterest: true,
  taxExempt: false,
  chargeableIncome: false,
  year: 2024,
  month: 'June',
});

// Dropdown options
const assetDescriptionOptions = [
  'DIRECTOR',
  'FIXED DEPOSIT',
  'SAVINGS ACCOUNT',
  'TERM LOAN',
  'HIRE PURCHASE',
  'OTHER',
];

const yearOptions = [2020, 2021, 2022, 2023, 2024, 2025];

const monthOptions = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Get data from store
const interestItems = computed(() => taxFilingStore.getInterestIncomeItems());
const interestTotals = computed(() => taxFilingStore.interestTotals);

// Form data computed from store totals
const interestIncurredNotRelated = ref(0);
const totalGrossInterest = computed(() => interestTotals.value.totalAmount);

// Table columns
const columns = [
  {
    title: 'Asset Description',
    dataIndex: 'assetDescription',
    key: 'assetDescription',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    customRender: ({ text }: { text: number }) => {
      return formatNumber(text);
    },
  },
  {
    title: 'Deemed Interest',
    dataIndex: 'deemedInterest',
    key: 'deemedInterest',
    customRender: ({ record }: { record: InterestIncomeItem }) => {
      return h(Checkbox, {
        checked: record.deemedInterest,
        onChange: (e: any) => {
          const updatedItem = { ...record, deemedInterest: e.target.checked };
          taxFilingStore.updateInterestIncomeItem(record.id, updatedItem);
        },
      });
    },
  },
  {
    title: 'Tax Exempt',
    dataIndex: 'taxExempt',
    key: 'taxExempt',
    customRender: ({ record }: { record: InterestIncomeItem }) => {
      return h(Checkbox, {
        checked: record.taxExempt,
        onChange: (e: any) => {
          const updatedItem = { ...record, taxExempt: e.target.checked };
          taxFilingStore.updateInterestIncomeItem(record.id, updatedItem);
        },
      });
    },
  },
  {
    title: 'Chargeable Inc... P/L',
    dataIndex: 'chargeableIncome',
    key: 'chargeableIncome',
    customRender: ({ record }: { record: InterestIncomeItem }) => {
      return h(Checkbox, {
        checked: record.chargeableIncome,
        onChange: (e: any) => {
          const updatedItem = { ...record, chargeableIncome: e.target.checked };
          taxFilingStore.updateInterestIncomeItem(record.id, updatedItem);
        },
      });
    },
  },
  {
    title: 'Action',
    key: 'action',
    customRender: () => {
      return h(
        Button,
        {
          type: 'link',
          size: 'small',
        },
        {
          icon: () => h(EditOutlined),
        },
      );
    },
  },
];

// Number formatting functions
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

// Enhanced parser for InputNumber components
const parseNumberFromCommas = (value: string) => {
  if (!value) return 0;
  // Remove all non-digit characters except minus sign at the beginning
  const cleanValue = value.replaceAll(/[^\d-]/g, '').replaceAll(/(?!^)-/g, '');
  const numValue = Number.parseInt(cleanValue, 10);
  return isNaN(numValue) ? 0 : numValue;
};

// Store original amounts for rounding reference
const originalAmounts = ref<Map<string, number>>(new Map());
const showRoundingIndicators = ref<Map<string, boolean>>(new Map());

// Auto-rounding function with enhanced detection
const autoRoundAmount = (item: InterestIncomeItem) => {
  const itemKey = `${item.id}-${item.assetDescription}`;

  // Store original amount if not already stored or if it has decimals
  if (!originalAmounts.value.has(itemKey) || item.amount % 1 !== 0) {
    originalAmounts.value.set(itemKey, item.amount);
  }

  // Round the amount
  const roundedAmount = Math.round(item.amount);
  if (roundedAmount !== item.amount) {
    showRoundingIndicators.value.set(itemKey, true);
    item.amount = roundedAmount;
    taxFilingStore.updateInterestIncomeItem(item.id, item);
    // Keep indicator persistent - no timeout
  }
};

// Round all items function
const handleRoundAll = () => {
  interestItems.value.forEach((item) => {
    if (item.amount % 1 !== 0) {
      autoRoundAmount(item);
    }
  });
  message.success('All decimal amounts have been rounded');
};

// Get original amount for display
const getOriginalAmount = (item: InterestIncomeItem) => {
  const itemKey = `${item.id}-${item.assetDescription}`;
  return originalAmounts.value.get(itemKey) || item.amount;
};

// Check if item has rounding indicator
const hasRoundingIndicator = (item: InterestIncomeItem) => {
  const itemKey = `${item.id}-${item.assetDescription}`;
  return showRoundingIndicators.value.get(itemKey) || false;
};

// Check if amount was rounded - enhanced logic
const wasAmountRounded = (item: InterestIncomeItem) => {
  const itemKey = `${item.id}-${item.assetDescription}`;
  const original = originalAmounts.value.get(itemKey);
  if (original === undefined) return false;

  // Check if rounding actually occurred (original had decimals AND current is rounded)
  const hadDecimals = original % 1 !== 0;
  const isCurrentRounded = item.amount === Math.round(original);
  return hadDecimals && isCurrentRounded;
};

// Auto-detect decimal input and trigger rounding comparison
const handleAmountInput = (item: InterestIncomeItem, newValue: number) => {
  const itemKey = `${item.id}-${item.assetDescription}`;

  // If user inputs a decimal value, store it as original and show comparison
  if (newValue % 1 !== 0) {
    originalAmounts.value.set(itemKey, newValue);
    showRoundingIndicators.value.set(itemKey, true);
  }

  item.amount = newValue;
  taxFilingStore.updateInterestIncomeItem(item.id, item);
};

// Methods
const handleClose = () => {
  interestIncomeModalApi.close();
};

const handleSave = () => {
  const data = {
    interestIncurredNotRelated: interestIncurredNotRelated.value,
    totalGrossInterest: totalGrossInterest.value,
    interestItems: interestItems.value,
    interestTotals: interestTotals.value,
  };
  emit('save', data);
  handleClose();
};

const addNewItem = () => {
  showAddForm.value = true;
  // Reset form data with sample values
  formData.value = {
    id: '',
    assetDescription: 'DIRECTOR',
    amount: 222,
    deemedInterest: true,
    taxExempt: false,
    chargeableIncome: false,
    year: 2024,
    month: 'June',
  };
};

// Form methods
const handleFormSave = () => {
  if (formData.value.assetDescription.trim()) {
    const newItem: InterestIncomeItem = {
      ...formData.value,
      id: Date.now().toString(),
    };
    taxFilingStore.addInterestIncomeItem(newItem);
    showAddForm.value = false;
  }
};

const handleFormClose = () => {
  showAddForm.value = false;
};

const handleFormDelete = () => {
  showAddForm.value = false;
  // Reset form data
  formData.value = {
    id: '',
    assetDescription: 'DIRECTOR',
    amount: 222,
    deemedInterest: true,
    taxExempt: false,
    chargeableIncome: false,
    year: 2024,
    month: 'June',
  };
};

// Auto-extract functionality
const handleAutoExtract = async () => {
  try {
    isExtracting.value = true;

    // Get uploaded files from store
    const uploadedFiles = taxFilingStore.getUploadedFiles();
    const excelFiles = uploadedFiles.filter(
      (file) =>
        file.file?.name.toLowerCase().endsWith('.xlsx') ||
        file.file?.name.toLowerCase().endsWith('.xls'),
    );

    if (excelFiles.length === 0) {
      message.warning(
        'No Excel files found. Please upload an Excel file first.',
      );
      return;
    }

    // Use the first Excel file for extraction
    const file = excelFiles[0].file;
    if (!file) {
      message.error('Invalid file selected.');
      return;
    }

    await taxFilingStore.extractInterestIncomeFromApi(file);
    message.success('Interest income data extracted successfully!');
  } catch (error) {
    console.error('Error during auto-extraction:', error);
    message.error('Failed to extract interest income data. Please try again.');
  } finally {
    isExtracting.value = false;
  }
};
</script>

<template>
  <InterestIncomeModal class="interest-income-modal">
    <div class="interest-modal-content p-4">
      <!-- Add New Form -->
      <div v-if="showAddForm" class="mb-6">
        <!-- Form Header -->
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
          <div class="flex gap-2">
            <Button danger @click="handleFormDelete">Delete</Button>
            <Button @click="handleFormClose">Close</Button>
            <Button type="primary" @click="handleFormSave">Save</Button>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <!-- Asset Description -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Asset Description
            </label>
            <Select
              v-model:value="formData.assetDescription"
              class="w-full"
              placeholder="Select asset description"
            >
              <Select.Option
                v-for="option in assetDescriptionOptions"
                :key="option"
                :value="option"
              >
                {{ option }}
              </Select.Option>
            </Select>
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <Input
              v-model:value="formData.description"
              placeholder="Amount Owing by Director"
            />
          </div>

          <!-- Checkboxes -->
          <div class="space-y-2">
            <div class="flex items-center">
              <Checkbox
                v-model:checked="formData.deemedInterest"
                class="mr-2"
              />
              <label class="text-sm text-gray-700"
                >Deemed Interest Income</label
              >
            </div>
            <div class="flex items-center">
              <Checkbox v-model:checked="formData.taxExempt" class="mr-2" />
              <label class="text-sm text-gray-700">Tax Exempt</label>
            </div>
            <div class="flex items-center">
              <Checkbox
                v-model:checked="formData.chargeableIncome"
                class="mr-2"
              />
              <label class="text-sm text-gray-700"
                >Chargeable Income not in P/L</label
              >
            </div>
          </div>

          <!-- Year and Month -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Year
              </label>
              <Select
                v-model:value="formData.year"
                class="w-full"
                placeholder="Select year"
              >
                <Select.Option
                  v-for="year in yearOptions"
                  :key="year"
                  :value="year"
                >
                  {{ year }}
                </Select.Option>
              </Select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Month
              </label>
              <Select
                v-model:value="formData.month"
                class="w-full"
                placeholder="Select month"
              >
                <Select.Option
                  v-for="month in monthOptions"
                  :key="month"
                  :value="month"
                >
                  {{ month }}
                </Select.Option>
              </Select>
            </div>
          </div>

          <!-- Loan/Advance Balance -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Loan/Advance Balance
            </label>
            <InputNumber
              v-model:value="formData.loanAdvanceBalance"
              :formatter="formatNumberWithCommas"
              :parser="parseNumberFromCommas"
              :precision="0"
              placeholder="50,000"
              class="w-full"
            />
          </div>

          <!-- ALR % -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              ALR %
            </label>
            <InputNumber
              v-model:value="formData.alrPercentage"
              :precision="2"
              :step="0.01"
              placeholder="5.32"
              class="w-full"
            />
          </div>

          <!-- Amount -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Amount
            </label>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <InputNumber
                  v-model:value="formData.amount"
                  :formatter="formatNumberWithCommas"
                  :parser="parseNumberFromCommas"
                  :precision="0"
                  placeholder="222"
                  class="flex-1"
                />
                <button
                  v-if="formData.amount % 1 !== 0"
                  @click="formData.amount = Math.round(formData.amount)"
                  class="flex items-center gap-1 rounded bg-orange-500 px-2 py-1 text-xs text-white hover:bg-orange-600"
                  title="Round Amount"
                >
                  <CalculatorOutlined class="text-xs" />
                  Round
                </button>
              </div>
              <!-- Show rounding preview for form -->
              <div
                v-if="formData.amount % 1 !== 0"
                class="flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs"
              >
                <CalculatorOutlined class="text-orange-600" />
                <span class="text-gray-600">Will be rounded to:</span>
                <span class="font-medium text-orange-600">{{
                  formatNumber(Math.round(formData.amount))
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Header with icon and title (when not in add form mode) -->
      <div v-else class="mb-6 flex items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white"
        >
          <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
          <p class="text-sm text-gray-600">Manufacturing Business</p>
        </div>
        <div class="ml-auto flex gap-2">
          <Button
            type="default"
            @click="handleAutoExtract"
            :loading="isExtracting"
            :disabled="isExtracting"
          >
            <template #icon><DownloadOutlined /></template>
            Auto Extract
          </Button>
          <Button
            type="default"
            @click="handleRoundAll"
            :disabled="!interestItems.some((item) => item.amount % 1 !== 0)"
            class="border-orange-200 bg-orange-50 text-orange-600 hover:border-orange-300 hover:bg-orange-100"
          >
            <template #icon><CalculatorOutlined /></template>
            Round All
          </Button>
          <Button type="primary" @click="addNewItem">
            <template #icon><PlusOutlined /></template>
            Add New
          </Button>
        </div>
      </div>

      <!-- Summary Fields and Table (when not in add form mode) -->
      <div v-if="!showAddForm">
        <!-- Summary Fields -->
        <div class="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Interest incurred not related to Interest S33(2). Minus from gross
              interest
            </label>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <InputNumber
                  v-model:value="interestIncurredNotRelated"
                  :formatter="formatNumberWithCommas"
                  :parser="parseNumberFromCommas"
                  :precision="0"
                  placeholder="0"
                  class="flex-1"
                />
                <button
                  v-if="interestIncurredNotRelated % 1 !== 0"
                  @click="
                    interestIncurredNotRelated = Math.round(
                      interestIncurredNotRelated,
                    )
                  "
                  class="flex items-center gap-1 rounded bg-orange-500 px-2 py-1 text-xs text-white hover:bg-orange-600"
                  title="Round Amount"
                >
                  <CalculatorOutlined class="text-xs" />
                </button>
              </div>
              <!-- Show rounding preview -->
              <div
                v-if="interestIncurredNotRelated % 1 !== 0"
                class="flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs"
              >
                <CalculatorOutlined class="text-orange-600" />
                <span class="text-gray-600">Will be rounded to:</span>
                <span class="font-medium text-orange-600">{{
                  formatNumber(Math.round(interestIncurredNotRelated))
                }}</span>
              </div>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Total Gross Interest
            </label>
            <div class="relative">
              <InputNumber
                v-model:value="totalGrossInterest"
                :formatter="formatNumberWithCommas"
                :parser="parseNumberFromCommas"
                :precision="0"
                placeholder="20,058"
                class="w-full bg-gray-50"
                readonly
              />
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="mb-6">
          <Table
            :columns="columns"
            :data-source="interestItems"
            :pagination="false"
            size="small"
            bordered
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'assetDescription'">
                <Input
                  v-model:value="record.assetDescription"
                  size="small"
                  placeholder="Enter asset description"
                />
              </template>
              <template v-else-if="column.key === 'description'">
                <Input
                  v-model:value="record.description"
                  size="small"
                  placeholder="Enter description"
                />
              </template>
              <template v-else-if="column.key === 'amount'">
                <div class="space-y-1">
                  <div class="flex items-center gap-1">
                    <InputNumber
                      :value="record.amount"
                      @change="(value) => handleAmountInput(record, value || 0)"
                      :formatter="formatNumberWithCommas"
                      :parser="parseNumberFromCommas"
                      :precision="0"
                      size="small"
                      placeholder="0"
                      class="flex-1"
                    />
                    <button
                      v-if="record.amount % 1 !== 0"
                      @click="autoRoundAmount(record)"
                      class="flex items-center gap-1 rounded bg-orange-500 px-1.5 py-0.5 text-xs text-white hover:bg-orange-600"
                      title="Round Amount"
                    >
                      <CalculatorOutlined class="text-xs" />
                    </button>
                  </div>
                  <!-- Enhanced before/after comparison display -->
                  <div
                    v-if="wasAmountRounded(record)"
                    class="flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-1 text-xs"
                  >
                    <CalculatorOutlined class="text-green-600" />
                    <span class="font-medium text-orange-600 line-through">{{
                      formatNumber(getOriginalAmount(record))
                    }}</span>
                    <span class="text-gray-400">→</span>
                    <span class="font-medium text-green-600">{{
                      formatNumber(record.amount)
                    }}</span>
                    <span class="text-xs text-green-600">(rounded)</span>
                  </div>
                </div>
              </template>
              <template v-else-if="column.key === 'deemedInterest'">
                <Checkbox v-model:checked="record.deemedInterest" />
              </template>
              <template v-else-if="column.key === 'taxExempt'">
                <Checkbox v-model:checked="record.taxExempt" />
              </template>
              <template v-else-if="column.key === 'chargeableIncome'">
                <Checkbox v-model:checked="record.chargeableIncome" />
              </template>
              <template v-else-if="column.key === 'action'">
                <Button type="link" size="small">
                  <template #icon><EditOutlined /></template>
                </Button>
              </template>
            </template>
          </Table>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end gap-3">
          <Button @click="handleClose">Cancel</Button>
          <Button type="primary" @click="handleSave">Save</Button>
        </div>
      </div>
    </div>
  </InterestIncomeModal>
</template>

<style scoped>
.interest-modal-content {
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #f8fafc;
  font-weight: 600;
  color: #374151;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f9fafb;
}
</style>
