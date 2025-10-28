<script lang="ts" setup>
import { ref, computed, h } from 'vue';
import {
  Button,
  Input,
  Select,
  Table,
  Typography,
  message,
} from 'ant-design-vue';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import { useVbenModal } from '@vben/common-ui';

const { Title } = Typography;
const { Option } = Select;

interface CapitalAllowanceAsset {
  id: string;
  description: string;
  assetType: string;
  yearAcquired: number;
  dateAcquired: string;
  cost: number;
  allowanceRate: number;
  allowanceAmount: number;
  writtenDownValue: number;
  remarks?: string;
}

interface Props {
  title?: string;
}

interface Emits {
  (e: 'save', data: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Capital Allowance',
});

const emit = defineEmits<Emits>();

// Initialize Vben modal for Capital Allowance
const [CapitalAllowanceModal, capitalAllowanceModalApi] = useVbenModal({
  title: 'Capital Allowance Management',
  showConfirmButton: false,
  width: '1200px',
});

// Expose modal API
defineExpose({
  capitalAllowanceModalApi,
});

// Form state
const showAddForm = ref(false);
const selectedAssetType = ref('plant-machinery');
const formData = ref<CapitalAllowanceAsset>({
  id: '',
  description: '',
  assetType: 'plant-machinery',
  yearAcquired: new Date().getFullYear(),
  dateAcquired: '',
  cost: 0,
  allowanceRate: 20,
  allowanceAmount: 0,
  writtenDownValue: 0,
  remarks: '',
});

// Asset data
const assets = ref<CapitalAllowanceAsset[]>([
  {
    id: '1',
    description: 'Manufacturing Equipment',
    assetType: 'plant-machinery',
    yearAcquired: 2024,
    dateAcquired: '2024-01-15',
    cost: 250_000,
    allowanceRate: 20,
    allowanceAmount: 50_000,
    writtenDownValue: 200_000,
    remarks: 'Factory production line',
  },
  {
    id: '2',
    description: 'Company Vehicle - Toyota Camry',
    assetType: 'motor-vehicle',
    yearAcquired: 2024,
    dateAcquired: '2024-03-10',
    cost: 120_000,
    allowanceRate: 20,
    allowanceAmount: 24_000,
    writtenDownValue: 96_000,
    remarks: 'Executive vehicle',
  },
  {
    id: '3',
    description: 'Office Computers',
    assetType: 'it-equipment',
    yearAcquired: 2024,
    dateAcquired: '2024-02-20',
    cost: 45_000,
    allowanceRate: 20,
    allowanceAmount: 9000,
    writtenDownValue: 36_000,
    remarks: 'Office workstations',
  },
]);

// Asset type options
const assetTypeOptions = [
  { value: 'plant-machinery', label: 'Plant & Machinery', rate: 20 },
  { value: 'motor-vehicle', label: 'Motor Vehicle', rate: 20 },
  { value: 'it-equipment', label: 'IT Equipment', rate: 20 },
  { value: 'furniture-fittings', label: 'Furniture & Fittings', rate: 10 },
  { value: 'building', label: 'Building', rate: 3 },
];

// Computed totals
const totals = computed(() => {
  const totalCost = assets.value.reduce((sum, asset) => sum + asset.cost, 0);
  const totalAllowance = assets.value.reduce(
    (sum, asset) => sum + asset.allowanceAmount,
    0,
  );
  const totalWDV = assets.value.reduce(
    (sum, asset) => sum + asset.writtenDownValue,
    0,
  );

  return {
    totalCost,
    totalAllowance,
    totalWDV,
    totalAssets: assets.value.length,
  };
});

// Filtered assets by type
const filteredAssets = computed(() => {
  if (selectedAssetType.value === 'all') {
    return assets.value;
  }
  return assets.value.filter(
    (asset) => asset.assetType === selectedAssetType.value,
  );
});

// Table columns
const columns = [
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    width: 200,
  },
  {
    title: 'Asset Type',
    dataIndex: 'assetType',
    key: 'assetType',
    width: 150,
    customRender: ({ text }: { text: string }) => {
      const option = assetTypeOptions.find((opt) => opt.value === text);
      return option?.label || text;
    },
  },
  {
    title: 'Year Acquired',
    dataIndex: 'yearAcquired',
    key: 'yearAcquired',
    width: 120,
  },
  {
    title: 'Date Acquired',
    dataIndex: 'dateAcquired',
    key: 'dateAcquired',
    width: 130,
  },
  {
    title: 'Cost (RM)',
    dataIndex: 'cost',
    key: 'cost',
    width: 120,
    customRender: ({ text }: { text: number }) => {
      return text.toLocaleString();
    },
  },
  {
    title: 'Rate (%)',
    dataIndex: 'allowanceRate',
    key: 'allowanceRate',
    width: 100,
  },
  {
    title: 'Allowance (RM)',
    dataIndex: 'allowanceAmount',
    key: 'allowanceAmount',
    width: 140,
    customRender: ({ text }: { text: number }) => {
      return text.toLocaleString();
    },
  },
  {
    title: 'WDV (RM)',
    dataIndex: 'writtenDownValue',
    key: 'writtenDownValue',
    width: 120,
    customRender: ({ text }: { text: number }) => {
      return text.toLocaleString();
    },
  },
  {
    title: 'Action',
    key: 'action',
    width: 100,
    customRender: ({ record }: { record: CapitalAllowanceAsset }) => {
      return h('div', { class: 'flex gap-1' }, [
        h(
          Button,
          {
            type: 'link',
            size: 'small',
            onClick: () => editAsset(record),
          },
          { icon: () => h(EditOutlined) },
        ),
        h(
          Button,
          {
            type: 'link',
            size: 'small',
            danger: true,
            onClick: () => deleteAsset(record.id),
          },
          { icon: () => h(DeleteOutlined) },
        ),
      ]);
    },
  },
];

// Methods
const handleClose = () => {
  capitalAllowanceModalApi.close();
};

const handleSave = () => {
  const data = {
    assets: assets.value,
    totals: totals.value,
  };
  emit('save', data);
  handleClose();
};

const addNewAsset = (assetType?: string) => {
  showAddForm.value = true;
  // Reset form data
  const defaultRate =
    assetTypeOptions.find(
      (opt) => opt.value === (assetType || 'plant-machinery'),
    )?.rate || 20;
  formData.value = {
    id: '',
    description: '',
    assetType: assetType || 'plant-machinery',
    yearAcquired: new Date().getFullYear(),
    dateAcquired: '',
    cost: 0,
    allowanceRate: defaultRate,
    allowanceAmount: 0,
    writtenDownValue: 0,
    remarks: '',
  };
};

const editAsset = (asset: CapitalAllowanceAsset) => {
  showAddForm.value = true;
  formData.value = { ...asset };
};

const deleteAsset = (id: string) => {
  const index = assets.value.findIndex((asset) => asset.id === id);
  if (index !== -1) {
    assets.value.splice(index, 1);
    message.success('Asset deleted successfully');
  }
};

// Form methods
const handleFormSave = () => {
  if (formData.value.description.trim() && formData.value.cost > 0) {
    // Calculate allowance amount and WDV
    const allowanceAmount =
      formData.value.cost * (formData.value.allowanceRate / 100);
    const writtenDownValue = formData.value.cost - allowanceAmount;

    const assetData = {
      ...formData.value,
      allowanceAmount,
      writtenDownValue,
    };

    if (formData.value.id) {
      // Update existing asset
      const index = assets.value.findIndex(
        (asset) => asset.id === formData.value.id,
      );
      if (index !== -1) {
        assets.value[index] = assetData;
        message.success('Asset updated successfully');
      }
    } else {
      // Add new asset
      assetData.id = Date.now().toString();
      assets.value.push(assetData);
      message.success('Asset added successfully');
    }

    showAddForm.value = false;
  } else {
    message.error('Please fill in all required fields');
  }
};

const handleFormClose = () => {
  showAddForm.value = false;
};

const handleAssetTypeChange = (value: string) => {
  const option = assetTypeOptions.find((opt) => opt.value === value);
  if (option) {
    formData.value.allowanceRate = option.rate;
    // Recalculate allowance amount if cost is already entered
    if (formData.value.cost > 0) {
      formData.value.allowanceAmount =
        formData.value.cost * (option.rate / 100);
      formData.value.writtenDownValue =
        formData.value.cost - formData.value.allowanceAmount;
    }
  }
};

const handleCostChange = () => {
  if (formData.value.cost > 0 && formData.value.allowanceRate > 0) {
    formData.value.allowanceAmount =
      formData.value.cost * (formData.value.allowanceRate / 100);
    formData.value.writtenDownValue =
      formData.value.cost - formData.value.allowanceAmount;
  }
};

const handleRateChange = () => {
  if (formData.value.cost > 0 && formData.value.allowanceRate > 0) {
    formData.value.allowanceAmount =
      formData.value.cost * (formData.value.allowanceRate / 100);
    formData.value.writtenDownValue =
      formData.value.cost - formData.value.allowanceAmount;
  }
};
</script>

<template>
  <CapitalAllowanceModal class="capital-allowance-modal">
    <div class="capital-modal-content p-4">
      <!-- Add/Edit Form -->
      <div v-if="showAddForm" class="mb-6">
        <!-- Form Header -->
        <div class="mb-6 flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white"
          >
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900">
              {{ formData.id ? 'Edit Asset' : 'Add New Asset' }}
            </h2>
            <p class="text-sm text-gray-600">Capital Allowance Management</p>
          </div>
          <div class="ml-auto flex gap-2">
            <Button @click="handleFormClose">Cancel</Button>
            <Button type="primary" @click="handleFormSave">{{
              formData.id ? 'Update' : 'Save'
            }}</Button>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <!-- Row 1 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Asset Description *</label
              >
              <Input
                v-model:value="formData.description"
                placeholder="e.g., Manufacturing Equipment"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Asset Type *</label
              >
              <Select
                v-model:value="formData.assetType"
                placeholder="Select asset type"
                @change="handleAssetTypeChange"
                class="w-full"
              >
                <Option
                  v-for="option in assetTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }} ({{ option.rate }}%)
                </Option>
              </Select>
            </div>
          </div>

          <!-- Row 2 -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Year Acquired *</label
              >
              <Input
                v-model:value="formData.yearAcquired"
                type="number"
                :min="2000"
                :max="2030"
                placeholder="2024"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Date Acquired</label
              >
              <Input v-model:value="formData.dateAcquired" type="date" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Cost (RM) *</label
              >
              <Input
                v-model:value="formData.cost"
                type="number"
                placeholder="0"
                @change="handleCostChange"
              />
            </div>
          </div>

          <!-- Row 3 -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Allowance Rate (%)</label
              >
              <Input
                v-model:value="formData.allowanceRate"
                type="number"
                placeholder="20"
                suffix="%"
                @change="handleRateChange"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Allowance Amount (RM)</label
              >
              <Input
                :value="formData.allowanceAmount"
                type="number"
                placeholder="0"
                readonly
                class="bg-gray-50"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Written Down Value (RM)</label
              >
              <Input
                :value="formData.writtenDownValue"
                type="number"
                placeholder="0"
                readonly
                class="bg-gray-50"
              />
            </div>
          </div>

          <!-- Row 4 -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700"
              >Remarks</label
            >
            <Input
              v-model:value="formData.remarks"
              placeholder="Additional notes or comments"
            />
          </div>
        </div>
      </div>

      <!-- Main View -->
      <div v-else>
        <!-- Header with icon and title -->
        <div class="mb-6 flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white"
          >
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
            <p class="text-sm text-gray-600">Manufacturing Business</p>
          </div>
          <div class="ml-auto flex gap-2">
            <Select
              v-model:value="selectedAssetType"
              placeholder="Filter by type"
              class="w-48"
            >
              <Option value="all">All Asset Types</Option>
              <Option
                v-for="option in assetTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </Option>
            </Select>
            <Button type="primary" @click="addNewAsset()">
              <template #icon><PlusOutlined /></template>
              Add Asset
            </Button>
          </div>
        </div>

        <!-- Summary Fields -->
        <div class="mb-6 grid grid-cols-4 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700"
              >Total Assets</label
            >
            <Input
              :value="totals.totalAssets"
              type="number"
              readonly
              class="bg-gray-50"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700"
              >Total Cost (RM)</label
            >
            <Input
              :value="totals.totalCost.toLocaleString()"
              readonly
              class="bg-gray-50"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700"
              >Total Allowance (RM)</label
            >
            <div class="relative">
              <Input
                :value="totals.totalAllowance.toLocaleString()"
                readonly
                class="bg-gray-50"
              />
              <div class="absolute right-2 top-1/2 -translate-y-1/2 transform">
                <div class="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700"
              >Total WDV (RM)</label
            >
            <Input
              :value="totals.totalWDV.toLocaleString()"
              readonly
              class="bg-gray-50"
            />
          </div>
        </div>

        <!-- Data Table -->
        <div class="mb-6">
          <Table
            :columns="columns"
            :data-source="filteredAssets"
            :pagination="false"
            size="small"
            bordered
            :scroll="{ x: 1000 }"
          />
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end gap-3">
          <Button @click="handleClose">Cancel</Button>
          <Button type="primary" @click="handleSave">Save Changes</Button>
        </div>
      </div>
    </div>
  </CapitalAllowanceModal>
</template>

<style scoped>
.capital-modal-content {
  max-height: 80vh;
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

:deep(.ant-select-selector) {
  border-radius: 6px;
}

:deep(.ant-input) {
  border-radius: 6px;
}
</style>
