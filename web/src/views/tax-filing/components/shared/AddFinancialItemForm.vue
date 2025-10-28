<script lang="ts" setup>
import { computed } from 'vue';
import { Button, InputNumber, Input, message } from 'ant-design-vue';
import { Plus, Calculator, ArrowRight } from 'lucide-vue-next';

interface FormData {
  description: string;
  amount: number;
  sheet_source: string;
}

interface Props {
  sectionType: string;
  sectionLabel: string;
  formData: FormData;
  showForm: boolean;
  disabled?: boolean;
  // Balance Sheet specific props for rounding functionality
  hasRoundingPreview?: boolean;
  originalAmount?: number;
  showRoundingIndicator?: boolean;
}

interface Emits {
  (e: 'add-item', sectionType: string): void;
  (e: 'cancel-form', sectionType: string): void;
  (e: 'show-form', sectionType: string): void;
  (e: 'form-input', sectionType: string, value: number): void;
  (e: 'clear-rounding', sectionType: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  hasRoundingPreview: false,
  originalAmount: 0,
  showRoundingIndicator: false,
});

const emit = defineEmits<Emits>();

// Helper functions
const formatNumber = (value: number) => {
  if (value === 0) return '0';
  if (!value) return '0';

  const absValue = Math.abs(value);
  const formattedValue = absValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

const handleAddItem = () => {
  if (!props.formData.description.trim() || props.formData.amount <= 0) {
    message.error('Please enter a valid description and amount');
    return;
  }
  emit('add-item', props.sectionType);
};

const handleCancel = () => {
  emit('cancel-form', props.sectionType);
};

const handleShowForm = () => {
  emit('show-form', props.sectionType);
};

const handleFormInput = (value: number) => {
  emit('form-input', props.sectionType, value);
};

const handleAmountChange = (value: number) => {
  props.formData.amount = Number(value) || 0;
  emit('clear-rounding', props.sectionType);
};

// Determine if this is a Balance Sheet form (has rounding functionality)
const isBalanceSheetForm = computed(() => {
  return props.hasRoundingPreview !== undefined;
});
</script>

<template>
  <div v-if="!disabled" class="add-row-section mt-3">
    <!-- Add Button -->
    <Button
      v-if="!showForm"
      type="dashed"
      @click="handleShowForm"
      class="add-row-btn"
    >
      <Plus class="mr-2 h-4 w-4" />
      Add New {{ sectionLabel }}
    </Button>

    <!-- Form -->
    <div v-if="showForm" class="add-row-form">
      <div class="form-row">
        <!-- Description Input -->
        <Input
          v-model:value="formData.description"
          placeholder="Enter description"
          class="description-input"
        />
        
        <!-- Amount Input with conditional rounding support -->
        <div class="flex items-center gap-3">
          <!-- Balance Sheet Form (with rounding) -->
          <template v-if="isBalanceSheetForm">
            <InputNumber
              v-model:value="formData.amount"
              :precision="2"
              :step="0.01"
              placeholder="Amount"
              class="amount-input"
              @input="(value) => handleFormInput(Number(value) || 0)"
              @change="(value) => handleAmountChange(Number(value) || 0)"
            />
            <!-- Rounding Preview for Balance Sheet -->
            <div
              v-if="hasRoundingPreview"
              class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 px-2 py-1 text-xs font-medium transition-all duration-300"
            >
              <Calculator class="h-3 w-3 text-blue-600" />
              <span class="text-gray-600">{{ formatNumber(originalAmount) }}</span>
              <ArrowRight class="h-3 w-3 text-purple-500" />
              <span class="font-semibold text-purple-700">{{ formatNumber(Math.round(originalAmount)) }}</span>
            </div>
          </template>
          
          <!-- Profit & Loss Form (no rounding) -->
          <template v-else>
            <InputNumber
              v-model:value="formData.amount"
              :precision="0"
              :step="1"
              :parser="(value) => Math.round(Number(value.replace(/\$\s?|(,*)/g, '')))"
              placeholder="Amount"
              class="amount-input"
              @change="(value) => handleAmountChange(Math.round(Number(value) || 0))"
            />
          </template>
        </div>
        
        <!-- Action Buttons -->
        <div class="form-actions">
          <Button
            type="primary"
            size="small"
            @click="handleAddItem"
          >
            Add
          </Button>
          <Button
            size="small"
            @click="handleCancel"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-row-section {
  @apply mt-4 rounded-lg border-2 border-dashed border-gray-200 p-4 transition-all duration-200;
}

.add-row-section:hover {
  @apply border-primary-300 bg-primary-50/30;
}

.add-row-btn {
  @apply w-full border-primary-200 text-primary-600 transition-all duration-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700;
}

.add-row-form {
  @apply mt-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm;
}

.form-row {
  @apply flex flex-col gap-3 sm:flex-row sm:items-start;
}

.description-input {
  @apply flex-1;
}

.amount-input {
  @apply w-full sm:w-40;
}

.form-actions {
  @apply flex gap-2;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .form-row {
    @apply space-y-3;
  }
  
  .form-actions {
    @apply w-full justify-end;
  }
}

/* Animation for smooth transitions */
.add-row-section:not(:hover) .add-row-btn {
  @apply opacity-70;
}

.add-row-section:hover .add-row-btn {
  @apply opacity-100 shadow-sm;
}
</style>