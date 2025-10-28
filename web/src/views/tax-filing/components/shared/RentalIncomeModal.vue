<script lang="ts" setup>
import { ref, h, computed } from 'vue';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Table,
  message,
} from 'ant-design-vue';
import {
  PlusOutlined,
  MinusOutlined,
  EditOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue';
import { useVbenModal } from '@vben/common-ui';
import { useTaxFilingStore } from '#/store/tax-filing';
import type { RentalIncomeItem } from '#/store/tax-filing';

// Use the store
const taxFilingStore = useTaxFilingStore();

interface OtherField {
  id: string;
  description: string;
  amount: number;
}

interface Props {
  title?: string;
}

interface Emits {
  (e: 'save', data: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Rental Income',
});

const emit = defineEmits<Emits>();

// Initialize Vben modal for Rental Income
const [RentalIncomeModal, rentalIncomeModalApi] = useVbenModal({
  title: 'Rental Income',
  showConfirmButton: false,
});

// Expose modal API
defineExpose({
  rentalIncomeModalApi,
});

// Add form state
const showAddForm = ref(false);
const isExtracting = ref(false);

// Get data from store
const rentalItems = computed(() => taxFilingStore.getRentalIncomeItems());
const rentalTotals = computed(() => taxFilingStore.rentalTotals);

// Summary fields
const summaryData = ref({
  partnershipRental: 0,
  interestIncurred: 0,
  claimCABF: 0,
  setOffRentalLoss: false,
  setOffCategory: false,
});

// Form data for adding new items
const formData = ref({
  type: '1-STOREY FACTORY',
  date: '',
  descriptionOfProperty: '',
  address1: '',
  address2: '',
  postcode: '',
  townCity: '',
  state: 'SELANGOR',
  grossRent: 0,
  netRent: 0,
  assessment: 0,
  quitRent: 0,
  insurance: 0,
  bankInterest: 0,
  repairs: 0,
  managementFees: 0,
  misc: 0,
  renewalOfTenancy: 0,
  advanceRentalReceived: 0,
  rentalDeductionIncentive: 0,
  under4a: false,
  iba: false,
});

// Dynamic other fields for form
const otherFields = ref<OtherField[]>([
  { id: '1', description: '', amount: 0 },
  { id: '2', description: '', amount: 0 },
  { id: '3', description: '', amount: 0 },
]);

// Table columns
const columns = [
  {
    title: 'Description Of Property',
    dataIndex: 'descriptionOfProperty',
    key: 'descriptionOfProperty',
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Gross Rent',
    dataIndex: 'grossRent',
    key: 'grossRent',
    customRender: ({ text }: { text: number }) => {
      return text.toLocaleString();
    },
  },
  {
    title: 'Net Rent',
    dataIndex: 'netRent',
    key: 'netRent',
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

// Property type options
const propertyTypes = [
  '1-STOREY FACTORY',
  '2-STOREY FACTORY',
  'WAREHOUSE',
  'OFFICE BUILDING',
  'RESIDENTIAL',
  'COMMERCIAL',
];

// State options
const stateOptions = [
  'JOHOR',
  'KEDAH',
  'KELANTAN',
  'MELAKA',
  'NEGERI SEMBILAN',
  'PAHANG',
  'PERAK',
  'PERLIS',
  'PULAU PINANG',
  'SABAH',
  'SARAWAK',
  'SELANGOR',
  'TERENGGANU',
  'WILAYAH PERSEKUTUAN KUALA LUMPUR',
  'WILAYAH PERSEKUTUAN LABUAN',
  'WILAYAH PERSEKUTUAN PUTRAJAYA',
];

// Methods
const handleClose = () => {
  rentalIncomeModalApi.close();
};

const handleDelete = () => {
  // Reset form data
  formData.value = {
    type: '1-STOREY FACTORY',
    date: '',
    descriptionOfProperty: '',
    address1: '',
    address2: '',
    postcode: '',
    townCity: '',
    state: 'SELANGOR',
    grossRent: 0,
    netRent: 0,
    assessment: 0,
    quitRent: 0,
    insurance: 0,
    bankInterest: 0,
    repairs: 0,
    managementFees: 0,
    misc: 0,
    renewalOfTenancy: 0,
    advanceRentalReceived: 0,
    rentalDeductionIncentive: 0,
    under4a: false,
    iba: false,
  };
  otherFields.value = [
    { id: '1', description: '', amount: 0 },
    { id: '2', description: '', amount: 0 },
    { id: '3', description: '', amount: 0 },
  ];
};

const handleSave = () => {
  const data = {
    rentalItems: rentalItems.value,
    summaryData: summaryData.value,
    rentalTotals: rentalTotals.value,
  };
  emit('save', data);
  handleClose();
};

const addNewItem = () => {
  showAddForm.value = true;
  // Reset form data
  formData.value = {
    type: '1-STOREY FACTORY',
    date: '',
    descriptionOfProperty: '',
    address1: '',
    address2: '',
    postcode: '',
    townCity: '',
    state: 'SELANGOR',
    grossRent: 0,
    netRent: 0,
    assessment: 0,
    quitRent: 0,
    insurance: 0,
    bankInterest: 0,
    repairs: 0,
    managementFees: 0,
    misc: 0,
    renewalOfTenancy: 0,
    advanceRentalReceived: 0,
    rentalDeductionIncentive: 0,
    under4a: false,
    iba: false,
  };
  otherFields.value = [
    { id: '1', description: '', amount: 0 },
    { id: '2', description: '', amount: 0 },
    { id: '3', description: '', amount: 0 },
  ];
};

// Form methods
const handleFormSave = () => {
  if (formData.value.descriptionOfProperty.trim()) {
    const newItem: RentalIncomeItem = {
      id: Date.now().toString(),
      ...formData.value,
      partnershipRental: summaryData.value.partnershipRental > 0,
      interestIncurred: summaryData.value.interestIncurred,
      claimCA: summaryData.value.claimCABF > 0,
      setOffRentalLoss: summaryData.value.setOffRentalLoss,
      setOffCategory: summaryData.value.setOffCategory,
    };
    taxFilingStore.addRentalIncomeItem(newItem);
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
    type: '1-STOREY FACTORY',
    date: '',
    descriptionOfProperty: '',
    address1: '',
    address2: '',
    postcode: '',
    townCity: '',
    state: 'SELANGOR',
    grossRent: 0,
    netRent: 0,
    assessment: 0,
    quitRent: 0,
    insurance: 0,
    bankInterest: 0,
    repairs: 0,
    managementFees: 0,
    misc: 0,
    renewalOfTenancy: 0,
    advanceRentalReceived: 0,
    rentalDeductionIncentive: 0,
    under4a: false,
    iba: false,
  };
  otherFields.value = [
    { id: '1', description: '', amount: 0 },
    { id: '2', description: '', amount: 0 },
    { id: '3', description: '', amount: 0 },
  ];
};

const addOtherField = () => {
  const newId = (otherFields.value.length + 1).toString();
  otherFields.value.push({
    id: newId,
    description: '',
    amount: 0,
  });
};

const removeOtherField = (index: number) => {
  if (otherFields.value.length > 1) {
    otherFields.value.splice(index, 1);
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

    await taxFilingStore.extractRentalIncomeFromApi(file);
    message.success('Rental income data extracted successfully!');
  } catch (error) {
    console.error('Error during auto-extraction:', error);
    message.error('Failed to extract rental income data. Please try again.');
  } finally {
    isExtracting.value = false;
  }
};
</script>

<template>
  <RentalIncomeModal class="rental-income-modal">
    <div class="rental-modal-content p-4">
      <!-- Add New Form -->
      <div v-if="showAddForm" class="mb-6">
        <!-- Form Header -->
        <div class="mb-6 flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white"
          >
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
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
          <!-- Row 1: Type and Date -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Type</label
              >
              <Select
                v-model:value="formData.type"
                class="w-full"
                placeholder="Select property type"
              >
                <Select.Option
                  v-for="type in propertyTypes"
                  :key="type"
                  :value="type"
                >
                  {{ type }}
                </Select.Option>
              </Select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Date</label
              >
              <Input v-model:value="formData.date" type="date" />
            </div>
          </div>

          <!-- Row 2: Description of Property -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700"
              >Description of Property</label
            >
            <Input
              v-model:value="formData.descriptionOfProperty"
              placeholder="Factory"
            />
          </div>

          <!-- Row 3: Address 1 and Address 2 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Address 1</label
              >
              <Input
                v-model:value="formData.address1"
                placeholder="Lot 18, Jalan Kemuning Prima"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Address 2</label
              >
              <Input v-model:value="formData.address2" placeholder="" />
            </div>
          </div>

          <!-- Row 4: Postcode, Town/City, State -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Postcode</label
              >
              <Input v-model:value="formData.postcode" placeholder="40400" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Town/City</label
              >
              <Input
                v-model:value="formData.townCity"
                placeholder="Shah Alam"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >State</label
              >
              <Select
                v-model:value="formData.state"
                class="w-full"
                placeholder="Select state"
              >
                <Select.Option
                  v-for="state in stateOptions"
                  :key="state"
                  :value="state"
                >
                  {{ state }}
                </Select.Option>
              </Select>
            </div>
          </div>

          <!-- Row 5: Gross Rent, Net Rent, Assessment, Quit Rent -->
          <div class="grid grid-cols-4 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Gross Rent</label
              >
              <Input
                v-model:value="formData.grossRent"
                type="number"
                placeholder="37939"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Net Rent</label
              >
              <Input
                v-model:value="formData.netRent"
                type="number"
                placeholder="33541"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Assessment</label
              >
              <Input
                v-model:value="formData.assessment"
                type="number"
                placeholder="2828"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Quit Rent</label
              >
              <Input
                v-model:value="formData.quitRent"
                type="number"
                placeholder="282"
              />
            </div>
          </div>

          <!-- Row 6: Insurance, Bank Interest, Repairs, Management Fees -->
          <div class="grid grid-cols-4 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Insurance</label
              >
              <Input
                v-model:value="formData.insurance"
                type="number"
                placeholder="1288"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Bank Interest</label
              >
              <Input
                v-model:value="formData.bankInterest"
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Repairs</label
              >
              <Input
                v-model:value="formData.repairs"
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Management Fees</label
              >
              <Input
                v-model:value="formData.managementFees"
                type="number"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Row 7: Misc, Renewal of Tenancy -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Misc</label
              >
              <Input
                v-model:value="formData.misc"
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Renewal of Tenancy</label
              >
              <Input
                v-model:value="formData.renewalOfTenancy"
                type="number"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Dynamic Other Fields -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-700">
                Other Descriptions & Amounts
              </h3>
              <Button size="small" @click="addOtherField">
                <template #icon><PlusOutlined /></template>
                Add Field
              </Button>
            </div>

            <div
              v-for="(field, index) in otherFields"
              :key="field.id"
              class="grid grid-cols-2 items-end gap-4"
            >
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Other Description {{ index + 1 }}
                </label>
                <Input
                  v-model:value="field.description"
                  :placeholder="`Other Description ${index + 1}`"
                />
              </div>
              <div class="flex gap-2">
                <div class="flex-1">
                  <label class="mb-1 block text-sm font-medium text-gray-700">
                    Other Amount {{ index + 1 }}
                  </label>
                  <Input
                    v-model:value="field.amount"
                    type="number"
                    placeholder="0"
                  />
                </div>
                <Button
                  v-if="otherFields.length > 1"
                  size="small"
                  danger
                  @click="removeOtherField(index)"
                  class="mt-6"
                >
                  <template #icon><MinusOutlined /></template>
                </Button>
              </div>
            </div>
          </div>

          <!-- Row 8: Advance Rental Received, Rental Deduction Incentive -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Advance Rental Received</label
              >
              <Input
                v-model:value="formData.advanceRentalReceived"
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Rental Deduction Incentive</label
              >
              <Input
                v-model:value="formData.rentalDeductionIncentive"
                type="number"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Checkboxes -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center">
              <Checkbox v-model:checked="formData.under4a" class="mr-2" />
              <label class="text-sm text-gray-700">Under 4(a)</label>
            </div>
            <div class="flex items-center">
              <Checkbox v-model:checked="formData.iba" class="mr-2" />
              <label class="text-sm text-gray-700">IBA</label>
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
              d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
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
        <div class="mb-6 grid grid-cols-3 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Partnership Rental
            </label>
            <Input
              v-model:value="summaryData.partnershipRental"
              type="number"
              placeholder="0"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Interest Incurred
            </label>
            <Input
              v-model:value="summaryData.interestIncurred"
              type="number"
              placeholder="0"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Claim CA b/f
            </label>
            <Input
              v-model:value="summaryData.claimCABF"
              type="number"
              placeholder="0"
            />
          </div>
        </div>

        <!-- Checkboxes -->
        <div class="mb-6 grid grid-cols-2 gap-4">
          <div class="flex items-center">
            <Checkbox
              v-model:checked="summaryData.setOffRentalLoss"
              class="mr-2"
            />
            <label class="text-sm text-gray-700">Set-off Rental Loss</label>
          </div>
          <div class="flex items-center">
            <Checkbox
              v-model:checked="summaryData.setOffCategory"
              class="mr-2"
            />
            <label class="text-sm text-gray-700">Set-off Category</label>
          </div>
        </div>

        <!-- Data Table -->
        <div class="mb-6">
          <Table
            :columns="columns"
            :data-source="rentalItems"
            :pagination="false"
            size="small"
            bordered
          />
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end gap-3">
          <Button @click="handleClose">Cancel</Button>
          <Button type="primary" @click="handleSave">Save</Button>
        </div>
      </div>
    </div>
  </RentalIncomeModal>
</template>

<style scoped>
.rental-modal-content {
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
