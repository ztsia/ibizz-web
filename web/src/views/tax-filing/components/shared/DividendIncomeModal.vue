<script lang="ts" setup>
import { ref, computed, h } from 'vue';
import {
  Button,
  Input,
  Table,
  Checkbox,
  Typography,
  message,
} from 'ant-design-vue';
import {
  PlusOutlined,
  EditOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue';
import { useVbenModal } from '@vben/common-ui';
import { useTaxFilingStore } from '#/store/tax-filing';
import type { DividendIncomeItem } from '#/store/tax-filing';

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
  title: 'Dividend Income',
});

const emit = defineEmits<Emits>();

// Initialize Vben modal for Dividend Income
const [DividendIncomeModal, dividendIncomeModalApi] = useVbenModal({
  title: 'Dividend Income',
  showConfirmButton: false,
});

// Expose modal API
defineExpose({
  dividendIncomeModalApi,
});

// Add form state
const showAddForm = ref(false);
const isExtracting = ref(false);
const formData = ref<DividendIncomeItem>({
  id: '',
  nameOfCorporation: '',
  warrantNo: '',
  date: '',
  yearEndDate: '',
  gross: 0,
  taxRate: 0,
  taxAtSource: 0,
  net: 0,
  regrössRate: 0,
  singleTierDividend: false,
  reitTaxable: false,
});

// Get data from store
const dividendItems = computed(() => taxFilingStore.getDividendIncomeItems());
const dividendTotals = computed(() => taxFilingStore.dividendTotals);

// Form data computed from store totals
const totalInterestIncurred = computed(
  () => dividendTotals.value.totalInterestIncurred,
);
const totalGross = computed(() => dividendTotals.value.totalGross);
const totalTax = computed(() => dividendTotals.value.totalTax);
const totalNet = computed(() => dividendTotals.value.totalNet);

// Table columns
const columns = [
  {
    title: 'Name Of Corporation',
    dataIndex: 'nameOfCorporation',
    key: 'nameOfCorporation',
  },
  {
    title: 'Warrant No.',
    dataIndex: 'warrantNo',
    key: 'warrantNo',
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'REIT (Taxable)',
    dataIndex: 'reitTaxable',
    key: 'reitTaxable',
    customRender: ({ record }: { record: DividendIncomeItem }) => {
      return h(Checkbox, {
        checked: record.reitTaxable,
        onChange: (e: any) => {
          const updatedItem = { ...record, reitTaxable: e.target.checked };
          taxFilingStore.updateDividendIncomeItem(record.id, updatedItem);
        },
      });
    },
  },
  {
    title: 'Gross',
    dataIndex: 'gross',
    key: 'gross',
    customRender: ({ text }: { text: number }) => {
      return text.toLocaleString();
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

// Methods
const handleClose = () => {
  dividendIncomeModalApi.close();
};

const handleSave = () => {
  const data = {
    totalInterestIncurred: totalInterestIncurred.value,
    totalGross: totalGross.value,
    totalTax: totalTax.value,
    totalNet: totalNet.value,
    dividendItems: dividendItems.value,
  };
  emit('save', data);
  handleClose();
};

const addNewItem = () => {
  showAddForm.value = true;
  // Reset form data
  formData.value = {
    id: '',
    nameOfCorporation: '',
    warrantNo: '',
    date: '',
    yearEndDate: '',
    gross: 0,
    taxRate: 0,
    taxAtSource: 0,
    net: 0,
    regrössRate: 0,
    singleTierDividend: false,
    reitTaxable: false,
  };
};

// Form methods
const handleFormSave = () => {
  if (formData.value.nameOfCorporation.trim()) {
    const newItem: DividendIncomeItem = {
      ...formData.value,
      id: Date.now().toString(),
    };
    taxFilingStore.addDividendIncomeItem(newItem);
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
    nameOfCorporation: '',
    warrantNo: '',
    date: '',
    yearEndDate: '',
    gross: 0,
    taxRate: 0,
    taxAtSource: 0,
    net: 0,
    regrössRate: 0,
    singleTierDividend: false,
    reitTaxable: false,
  };
};

// Update dividend field in store
const updateDividendField = (
  id: string,
  field: keyof DividendIncomeItem,
  value: any,
) => {
  const item = dividendItems.value.find((item) => item.id === id);
  if (item) {
    const updatedItem = { ...item, [field]: value };
    taxFilingStore.updateDividendIncomeItem(id, updatedItem);
  }
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

    await taxFilingStore.extractDividendIncomeFromApi(file);
    message.success('Dividend income data extracted successfully!');
  } catch (error) {
    console.error('Error during auto-extraction:', error);
    message.error('Failed to extract dividend income data. Please try again.');
  } finally {
    isExtracting.value = false;
  }
};
</script>

<template>
  <DividendIncomeModal class="dividend-income-modal">
    <div class="dividend-modal-content p-4">
      <!-- Add New Form -->
      <div v-if="showAddForm" class="mb-6">
        <!-- Form Header -->
        <div class="mb-6 flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white"
          >
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
            <p class="text-sm text-gray-600">Manufacturing Business</p>
          </div>
          <div class="ml-auto flex gap-2">
            <Button danger @click="handleFormDelete">Delete</Button>
            <Button @click="handleFormClose">Close</Button>
            <Button type="primary" @click="handleFormSave">Save</Button>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <!-- Row 1 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Name of Corporation
              </label>
              <Input
                v-model:value="formData.nameOfCorporation"
                placeholder="SunMall Berhad"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Warrant #
              </label>
              <Input v-model:value="formData.warrantNo" placeholder="1234" />
            </div>
          </div>

          <!-- Row 2 -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Date
              </label>
              <Input
                v-model:value="formData.date"
                type="date"
                placeholder="2024-05-04"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Year End Date
              </label>
              <Input
                v-model:value="formData.yearEndDate"
                type="date"
                placeholder="2024-12-31"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Gross
              </label>
              <Input
                v-model:value="formData.gross"
                type="number"
                placeholder="4,000"
              />
            </div>
          </div>

          <!-- Row 3 -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Tax Rate
              </label>
              <Input
                v-model:value="formData.taxRate"
                placeholder="0.00%"
                suffix="%"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Tax @ Source
              </label>
              <Input
                v-model:value="formData.taxAtSource"
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Net
              </label>
              <Input
                v-model:value="formData.net"
                type="number"
                placeholder="4,000"
              />
            </div>
          </div>

          <!-- Row 4 -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Regross Rate
              </label>
              <Input
                v-model:value="formData.regrössRate"
                type="number"
                placeholder="0"
              />
            </div>
            <div class="col-span-2">
              <div class="flex gap-6 pt-6">
                <Checkbox v-model:checked="formData.singleTierDividend">
                  Single Tier Dividend
                </Checkbox>
                <Checkbox v-model:checked="formData.reitTaxable">
                  REIT (Taxable)
                </Checkbox>
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
            <path
              d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-2a2 2 0 100 4 2 2 0 000-4z"
            />
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
          <Button type="primary" @click="addNewItem">
            <template #icon><PlusOutlined /></template>
            Add New
          </Button>
        </div>
      </div>

      <!-- Summary Fields and Table (when not in add form mode) -->
      <div v-if="!showAddForm">
        <!-- Summary Fields -->
        <div class="mb-6 grid grid-cols-4 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Total Interest Incurred
            </label>
            <Input
              :value="totalInterestIncurred"
              type="number"
              placeholder="0"
              readonly
              class="bg-gray-50"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Total Gross
            </label>
            <div class="relative">
              <Input
                :value="totalGross"
                type="number"
                placeholder="5,733"
                readonly
                class="bg-gray-50"
              />
              <div class="absolute right-2 top-1/2 -translate-y-1/2 transform">
                <div class="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Total Tax
            </label>
            <Input
              :value="totalTax"
              type="number"
              placeholder="0"
              readonly
              class="bg-gray-50"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Total Net
            </label>
            <Input
              :value="totalNet"
              type="number"
              placeholder="5,300"
              class="bg-gray-50"
              readonly
            />
          </div>
        </div>

        <!-- Data Table -->
        <div class="mb-6">
          <Table
            :columns="columns"
            :data-source="dividendItems"
            :pagination="false"
            size="small"
            bordered
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'nameOfCorporation'">
                <Input
                  :value="record.nameOfCorporation"
                  size="small"
                  placeholder="Enter corporation name"
                  @change="
                    (e) =>
                      updateDividendField(
                        record.id,
                        'nameOfCorporation',
                        e.target.value,
                      )
                  "
                />
              </template>
              <template v-else-if="column.key === 'warrantNo'">
                <Input
                  :value="record.warrantNo"
                  size="small"
                  placeholder="Enter warrant no."
                  @change="
                    (e) =>
                      updateDividendField(
                        record.id,
                        'warrantNo',
                        e.target.value,
                      )
                  "
                />
              </template>
              <template v-else-if="column.key === 'date'">
                <Input
                  :value="record.date"
                  size="small"
                  type="date"
                  @change="
                    (e) =>
                      updateDividendField(record.id, 'date', e.target.value)
                  "
                />
              </template>
              <template v-else-if="column.key === 'reitTaxable'">
                <Checkbox
                  :checked="record.reitTaxable"
                  @change="
                    (e) =>
                      updateDividendField(
                        record.id,
                        'reitTaxable',
                        e.target.checked,
                      )
                  "
                />
              </template>
              <template v-else-if="column.key === 'gross'">
                <Input
                  :value="record.gross"
                  size="small"
                  type="number"
                  placeholder="0"
                  @change="
                    (e) =>
                      updateDividendField(
                        record.id,
                        'gross',
                        Number(e.target.value),
                      )
                  "
                />
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
  </DividendIncomeModal>
</template>

<style scoped>
.dividend-modal-content {
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
