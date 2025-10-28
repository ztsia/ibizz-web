<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Button, InputNumber, Input, message, Modal } from 'ant-design-vue';
import { Check, Plus, Edit, Trash2, Save, X } from 'lucide-vue-next';
import { useVbenModal } from '@vben/common-ui';
import { useTaxFilingStore } from '#/store/tax-filing';
import type { ExtractedItem } from '#/store/tax-filing';

interface Props {
  disabled?: boolean;
  showSingleReviewButton?: boolean;
  modalType?: 'trading' | 'manufacturing' | 'both';
}

interface Emits {
  (e: 'review-all'): void;
  (e: 'item-updated', data: { item: ExtractedItem; category: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showSingleReviewButton: true,
  modalType: 'both',
});

const emit = defineEmits<Emits>();

// Initialize Vben modal for Profit & Loss
const [ProfitLossModal, profitLossModalApi] = useVbenModal({
  title: 'Profit & Loss Statement',
  showConfirmButton: false,
  width: '90%',
  class: 'pl-statement-modal',
});

// Expose modal API
defineExpose({
  profitLossModalApi,
});

// Store and client data
const taxFilingStore = useTaxFilingStore();
const clientInfo = computed(() => taxFilingStore.selectedClient);

// Client-derived data
const companyName = computed(
  () =>
    clientInfo.value?.basicParticulars.companyName ||
    'Name of the Owner/Corporate Name (Vertical Style)',
);
const currentYear = new Date().getFullYear();
const periodEnd = `31 December ${currentYear}`;

// Get financial data from store - using new ExtractedItem interface
const allPLItems = computed(() => {
  return taxFilingStore.pAndLStatementItems;
});

// Group items by section and sort by section_order and item_order
const groupedSections = computed(() => {
  const sections = new Map<string, ExtractedItem[]>();

  allPLItems.value.forEach((item) => {
    if (!sections.has(item.section)) {
      sections.set(item.section, []);
    }
    sections.get(item.section)!.push(item);
  });

  // Sort items within each section by item_order
  sections.forEach((items) => {
    items.sort((a, b) => a.item_order - b.item_order);
  });

  // Convert to array and sort by section_order
  return [...sections.entries()]
    .map(([sectionName, items]) => ({
      name: sectionName,
      order: items[0]?.section_order || 0,
      items,
    }))
    .sort((a, b) => a.order - b.order);
});

// Calculate specific totals for P&L structure
const salesItems = computed(() =>
  allPLItems.value.filter((item) => item.section === 'Revenue'),
);

const costOfGoodsItems = computed(() =>
  allPLItems.value.filter((item) => item.section === 'Cost of Goods Sold'),
);

const otherIncomeItems = computed(() =>
  allPLItems.value.filter((item) => item.section === 'Other Income'),
);

const expenseItems = computed(() =>
  allPLItems.value.filter((item) => item.section === 'Expenses'),
);

// Calculate totals
const netSales = computed(() => {
  return salesItems.value.reduce((total, item) => {
    if (item.adjustment_type === 'less') {
      return total - item.amount;
    }
    return total + item.amount;
  }, 0);
});

const costOfSales = computed(() => {
  return costOfGoodsItems.value.reduce((total, item) => {
    if (item.adjustment_type === 'less') {
      return total - item.amount;
    }
    return total + item.amount;
  }, 0);
});

const grossProfit = computed(() => netSales.value - costOfSales.value);

const totalOtherIncome = computed(() => {
  return otherIncomeItems.value.reduce((total, item) => total + item.amount, 0);
});

const totalExpenses = computed(() => {
  return expenseItems.value.reduce((total, item) => total + item.amount, 0);
});

const netProfit = computed(
  () => grossProfit.value + totalOtherIncome.value - totalExpenses.value,
);

// Helper functions
const formatNumber = (value: number) => {
  if (value === 0) return '-';
  return Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const formatDescription = (description: string) => {
  return description
    .replaceAll('_', ' ')
    .replaceAll(/\b\w/g, (l) => l.toUpperCase());
};

// Edit state management
const editingItem = ref<string | null>(null);
const editForm = ref({
  description: '',
  amount: 0,
});

// Edit functions
const startEdit = (item: ExtractedItem) => {
  if (props.disabled) return;
  editingItem.value = item.id;
  editForm.value = {
    description: item.description,
    amount: item.amount,
  };
};

const saveEdit = (item: ExtractedItem) => {
  if (props.disabled) return;

  const updatedItem: ExtractedItem = {
    ...item,
    description: editForm.value.description,
    amount: editForm.value.amount,
  };

  taxFilingStore.updateExtractedItem(item.id, updatedItem);
  editingItem.value = null;
  message.success('Item updated successfully');
  emit('item-updated', { item: updatedItem, category: item.section });
};

const cancelEdit = () => {
  editingItem.value = null;
  editForm.value = { description: '', amount: 0 };
};

// Add new item functionality
const showAddForm = ref<string | null>(null);
const newItemForm = ref({
  description: '',
  amount: 0,
  adjustment_type: 'normal' as 'normal' | 'less' | 'add',
});

const addNewItem = (sectionName: string, sectionOrder: number) => {
  if (!newItemForm.value.description.trim() || newItemForm.value.amount < 0) {
    message.error('Please enter a valid description and amount');
    return;
  }

  // Find the highest item_order in this section
  const sectionItems = allPLItems.value.filter(
    (item) => item.section === sectionName,
  );
  const maxItemOrder =
    sectionItems.length > 0
      ? Math.max(...sectionItems.map((item) => item.item_order))
      : 0;

  const newItem: ExtractedItem = {
    id: `${sectionName.toLowerCase().replaceAll(/\s+/g, '-')}-${Date.now()}`,
    description: newItemForm.value.description,
    amount: newItemForm.value.amount,
    sheet_source: 'Manual Entry',
    section: sectionName,
    section_order: sectionOrder,
    item_order: maxItemOrder + 1,
    adjustment_type: newItemForm.value.adjustment_type,
    editable: true,
  };

  taxFilingStore.addExtractedItem(newItem);

  // Reset form
  newItemForm.value = {
    description: '',
    amount: 0,
    adjustment_type: 'normal',
  };
  showAddForm.value = null;

  message.success('New item added successfully');
};

const removeItem = (item: ExtractedItem) => {
  if (props.disabled) return;

  Modal.confirm({
    title: 'Confirm Deletion',
    content: `Are you sure you want to remove "${item.description}"?`,
    okText: 'Yes, Delete',
    cancelText: 'Cancel',
    okType: 'danger',
    onOk() {
      taxFilingStore.removeExtractedItem(item.id, 'Profit & Loss');
      message.success('Item removed successfully');
    },
  });
};

const getAdjustmentPrefix = (adjustmentType: string) => {
  switch (adjustmentType) {
    case 'add': {
      return '(+) ';
    }
    case 'less': {
      return '(-) ';
    }
    default: {
      return '';
    }
  }
};

const shouldShowInParentheses = (item: ExtractedItem) => {
  return item.adjustment_type === 'less';
};

// Modal functions
const closeModal = () => {
  profitLossModalApi.close();
};

const handleReviewAll = () => {
  emit('review-all');
};
</script>

<template>
  <ProfitLossModal class="pl-statement-modal">
    <!-- Traditional P&L Statement -->
    <div class="traditional-pl-statement">
      <!-- Header -->
      <div class="pl-header">
        <div class="company-name">{{ companyName }}</div>
        <div class="statement-title">
          Income Statement for the Year Ended {{ periodEnd }}
        </div>
        <div class="currency-columns">
          <span class="currency-label">$$</span>
          <span class="currency-label">$$</span>
        </div>
      </div>

      <!-- Sales Section -->
      <div class="pl-section">
        <div class="section-items">
          <div
            v-for="item in salesItems"
            :key="item.id"
            class="pl-line-item"
            :class="{ editing: editingItem === item.id }"
          >
            <div class="item-description">
              <template v-if="editingItem === item.id">
                <Input
                  v-model:value="editForm.description"
                  class="edit-description"
                  @pressEnter="saveEdit(item)"
                />
              </template>
              <template v-else>
                <span class="description-text" @dblclick="startEdit(item)">
                  {{ getAdjustmentPrefix(item.adjustment_type)
                  }}{{ formatDescription(item.description) }}
                </span>
              </template>
            </div>

            <div class="item-amount">
              <template v-if="editingItem === item.id">
                <div class="edit-controls">
                  <InputNumber
                    v-model:value="editForm.amount"
                    :precision="0"
                    class="edit-amount"
                    @pressEnter="saveEdit(item)"
                  />
                  <Button size="small" type="primary" @click="saveEdit(item)">
                    <Save class="h-3 w-3" />
                  </Button>
                  <Button size="small" @click="cancelEdit">
                    <X class="h-3 w-3" />
                  </Button>
                </div>
              </template>
              <template v-else>
                <div class="amount-display" @dblclick="startEdit(item)">
                  <span
                    v-if="shouldShowInParentheses(item)"
                    class="amount-value"
                  >
                    ({{ formatNumber(item.amount) }})
                  </span>
                  <span v-else class="amount-value">
                    {{ formatNumber(item.amount) }}
                  </span>
                  <Button
                    v-if="!props.disabled"
                    size="small"
                    type="text"
                    class="edit-btn"
                    @click="startEdit(item)"
                  >
                    <Edit class="h-3 w-3" />
                  </Button>
                  <Button
                    v-if="!props.disabled"
                    size="small"
                    type="text"
                    danger
                    class="delete-btn"
                    @click="removeItem(item)"
                  >
                    <Trash2 class="h-3 w-3" />
                  </Button>
                </div>
              </template>
            </div>
          </div>

          <!-- Add new sales item -->
          <div v-if="showAddForm === 'Revenue'" class="add-item-form">
            <div class="form-row">
              <Input
                v-model:value="newItemForm.description"
                placeholder="Description"
                class="description-input"
              />
              <InputNumber
                v-model:value="newItemForm.amount"
                :precision="0"
                placeholder="Amount"
                class="amount-input"
              />
              <select
                v-model="newItemForm.adjustment_type"
                class="adjustment-select"
              >
                <option value="normal">Normal</option>
                <option value="less">Less (-)</option>
                <option value="add">Add (+)</option>
              </select>
              <Button
                size="small"
                type="primary"
                @click="addNewItem('Revenue', 1)"
              >
                Add
              </Button>
              <Button size="small" @click="showAddForm = null"> Cancel </Button>
            </div>
          </div>

          <Button
            v-if="!props.disabled && showAddForm !== 'Revenue'"
            type="dashed"
            size="small"
            class="add-item-btn"
            @click="showAddForm = 'Revenue'"
          >
            <Plus class="mr-1 h-3 w-3" /> Add Sales Item
          </Button>
        </div>

        <!-- Net Sales Total -->
        <div class="subtotal-line">
          <div class="subtotal-description"></div>
          <div class="subtotal-amount">{{ formatNumber(netSales) }}</div>
        </div>
      </div>

      <!-- Cost of Goods Sold Section -->
      <div class="pl-section" v-if="costOfGoodsItems.length > 0">
        <div class="section-items">
          <div
            v-for="item in costOfGoodsItems"
            :key="item.id"
            class="pl-line-item"
            :class="{ editing: editingItem === item.id }"
          >
            <div class="item-description">
              <template v-if="editingItem === item.id">
                <Input
                  v-model:value="editForm.description"
                  class="edit-description"
                  @pressEnter="saveEdit(item)"
                />
              </template>
              <template v-else>
                <span class="description-text" @dblclick="startEdit(item)">
                  {{ getAdjustmentPrefix(item.adjustment_type)
                  }}{{ formatDescription(item.description) }}
                </span>
              </template>
            </div>

            <div class="item-amount">
              <template v-if="editingItem === item.id">
                <div class="edit-controls">
                  <InputNumber
                    v-model:value="editForm.amount"
                    :precision="0"
                    class="edit-amount"
                    @pressEnter="saveEdit(item)"
                  />
                  <Button size="small" type="primary" @click="saveEdit(item)">
                    <Save class="h-3 w-3" />
                  </Button>
                  <Button size="small" @click="cancelEdit">
                    <X class="h-3 w-3" />
                  </Button>
                </div>
              </template>
              <template v-else>
                <div class="amount-display" @dblclick="startEdit(item)">
                  <span
                    v-if="shouldShowInParentheses(item)"
                    class="amount-value"
                  >
                    ({{ formatNumber(item.amount) }})
                  </span>
                  <span v-else class="amount-value">
                    {{ formatNumber(item.amount) }}
                  </span>
                  <Button
                    v-if="!props.disabled"
                    size="small"
                    type="text"
                    class="edit-btn"
                    @click="startEdit(item)"
                  >
                    <Edit class="h-3 w-3" />
                  </Button>
                  <Button
                    v-if="!props.disabled"
                    size="small"
                    type="text"
                    danger
                    class="delete-btn"
                    @click="removeItem(item)"
                  >
                    <Trash2 class="h-3 w-3" />
                  </Button>
                </div>
              </template>
            </div>
          </div>

          <!-- Add new COGS item -->
          <div
            v-if="showAddForm === 'Cost of Goods Sold'"
            class="add-item-form"
          >
            <div class="form-row">
              <Input
                v-model:value="newItemForm.description"
                placeholder="Description"
                class="description-input"
              />
              <InputNumber
                v-model:value="newItemForm.amount"
                :precision="0"
                placeholder="Amount"
                class="amount-input"
              />
              <select
                v-model="newItemForm.adjustment_type"
                class="adjustment-select"
              >
                <option value="normal">Normal</option>
                <option value="less">Less (-)</option>
                <option value="add">Add (+)</option>
              </select>
              <Button
                size="small"
                type="primary"
                @click="addNewItem('Cost of Goods Sold', 2)"
              >
                Add
              </Button>
              <Button size="small" @click="showAddForm = null"> Cancel </Button>
            </div>
          </div>

          <Button
            v-if="!props.disabled && showAddForm !== 'Cost of Goods Sold'"
            type="dashed"
            size="small"
            class="add-item-btn"
            @click="showAddForm = 'Cost of Goods Sold'"
          >
            <Plus class="mr-1 h-3 w-3" /> Add COGS Item
          </Button>
        </div>

        <!-- Cost of Sales Total -->
        <div class="subtotal-line">
          <div class="subtotal-description">Cost of Sales</div>
          <div class="subtotal-amount">{{ formatNumber(costOfSales) }}</div>
        </div>
      </div>

      <!-- Gross Profit -->
      <div class="total-line">
        <div class="total-description">Gross Profit</div>
        <div class="total-amount">{{ formatNumber(grossProfit) }}</div>
      </div>

      <!-- Other Income Section -->
      <div
        class="pl-section"
        v-if="otherIncomeItems.length > 0 || !props.disabled"
      >
        <div class="section-header">Add: Other Income</div>
        <div class="section-items">
          <div
            v-for="item in otherIncomeItems"
            :key="item.id"
            class="pl-line-item"
            :class="{ editing: editingItem === item.id }"
          >
            <div class="item-description">
              <template v-if="editingItem === item.id">
                <Input
                  v-model:value="editForm.description"
                  class="edit-description"
                  @pressEnter="saveEdit(item)"
                />
              </template>
              <template v-else>
                <span class="description-text" @dblclick="startEdit(item)">
                  {{ formatDescription(item.description) }}
                </span>
              </template>
            </div>

            <div class="item-amount">
              <template v-if="editingItem === item.id">
                <div class="edit-controls">
                  <InputNumber
                    v-model:value="editForm.amount"
                    :precision="0"
                    class="edit-amount"
                    @pressEnter="saveEdit(item)"
                  />
                  <Button size="small" type="primary" @click="saveEdit(item)">
                    <Save class="h-3 w-3" />
                  </Button>
                  <Button size="small" @click="cancelEdit">
                    <X class="h-3 w-3" />
                  </Button>
                </div>
              </template>
              <template v-else>
                <div class="amount-display" @dblclick="startEdit(item)">
                  <span class="amount-value">{{
                    formatNumber(item.amount)
                  }}</span>
                  <Button
                    v-if="!props.disabled"
                    size="small"
                    type="text"
                    class="edit-btn"
                    @click="startEdit(item)"
                  >
                    <Edit class="h-3 w-3" />
                  </Button>
                  <Button
                    v-if="!props.disabled"
                    size="small"
                    type="text"
                    danger
                    class="delete-btn"
                    @click="removeItem(item)"
                  >
                    <Trash2 class="h-3 w-3" />
                  </Button>
                </div>
              </template>
            </div>
          </div>

          <!-- Add new other income item -->
          <div v-if="showAddForm === 'Other Income'" class="add-item-form">
            <div class="form-row">
              <Input
                v-model:value="newItemForm.description"
                placeholder="Description"
                class="description-input"
              />
              <InputNumber
                v-model:value="newItemForm.amount"
                :precision="0"
                placeholder="Amount"
                class="amount-input"
              />
              <Button
                size="small"
                type="primary"
                @click="addNewItem('Other Income', 4)"
              >
                Add
              </Button>
              <Button size="small" @click="showAddForm = null"> Cancel </Button>
            </div>
          </div>

          <Button
            v-if="!props.disabled && showAddForm !== 'Other Income'"
            type="dashed"
            size="small"
            class="add-item-btn"
            @click="showAddForm = 'Other Income'"
          >
            <Plus class="mr-1 h-3 w-3" /> Add Other Income
          </Button>
        </div>

        <!-- Other Income Total -->
        <div class="subtotal-line" v-if="otherIncomeItems.length > 0">
          <div class="subtotal-description"></div>
          <div class="subtotal-amount">
            {{ formatNumber(totalOtherIncome) }}
          </div>
        </div>
      </div>

      <!-- Expenses Section -->
      <div class="pl-section">
        <div class="section-header">Less: Expenses</div>
        <div class="section-items">
          <div
            v-for="item in expenseItems"
            :key="item.id"
            class="pl-line-item"
            :class="{ editing: editingItem === item.id }"
          >
            <div class="item-description">
              <template v-if="editingItem === item.id">
                <Input
                  v-model:value="editForm.description"
                  class="edit-description"
                  @pressEnter="saveEdit(item)"
                />
              </template>
              <template v-else>
                <span class="description-text" @dblclick="startEdit(item)">
                  {{ formatDescription(item.description) }}
                </span>
              </template>
            </div>

            <div class="item-amount">
              <template v-if="editingItem === item.id">
                <div class="edit-controls">
                  <InputNumber
                    v-model:value="editForm.amount"
                    :precision="0"
                    class="edit-amount"
                    @pressEnter="saveEdit(item)"
                  />
                  <Button size="small" type="primary" @click="saveEdit(item)">
                    <Save class="h-3 w-3" />
                  </Button>
                  <Button size="small" @click="cancelEdit">
                    <X class="h-3 w-3" />
                  </Button>
                </div>
              </template>
              <template v-else>
                <div class="amount-display" @dblclick="startEdit(item)">
                  <span class="amount-value">{{
                    formatNumber(item.amount)
                  }}</span>
                  <Button
                    v-if="!props.disabled"
                    size="small"
                    type="text"
                    class="edit-btn"
                    @click="startEdit(item)"
                  >
                    <Edit class="h-3 w-3" />
                  </Button>
                  <Button
                    v-if="!props.disabled"
                    size="small"
                    type="text"
                    danger
                    class="delete-btn"
                    @click="removeItem(item)"
                  >
                    <Trash2 class="h-3 w-3" />
                  </Button>
                </div>
              </template>
            </div>
          </div>

          <!-- Add new expense item -->
          <div v-if="showAddForm === 'Expenses'" class="add-item-form">
            <div class="form-row">
              <Input
                v-model:value="newItemForm.description"
                placeholder="Description"
                class="description-input"
              />
              <InputNumber
                v-model:value="newItemForm.amount"
                :precision="0"
                placeholder="Amount"
                class="amount-input"
              />
              <Button
                size="small"
                type="primary"
                @click="addNewItem('Expenses', 5)"
              >
                Add
              </Button>
              <Button size="small" @click="showAddForm = null"> Cancel </Button>
            </div>
          </div>

          <Button
            v-if="!props.disabled && showAddForm !== 'Expenses'"
            type="dashed"
            size="small"
            class="add-item-btn"
            @click="showAddForm = 'Expenses'"
          >
            <Plus class="mr-1 h-3 w-3" /> Add Expense
          </Button>
        </div>

        <!-- Total Expenses -->
        <div class="subtotal-line">
          <div class="subtotal-description"></div>
          <div class="subtotal-amount">({{ formatNumber(totalExpenses) }})</div>
        </div>
      </div>

      <!-- Net Profit -->
      <div class="final-total-line">
        <div class="final-total-description">Net Profit</div>
        <div class="final-total-amount">{{ formatNumber(netProfit) }}</div>
      </div>
    </div>

    <!-- Modal Footer -->
    <div class="modal-footer">
      <div class="footer-actions">
        <Button @click="closeModal">Close</Button>
        <div class="action-buttons">
          <Button
            v-if="showSingleReviewButton"
            type="primary"
            :disabled="disabled"
            @click="handleReviewAll"
          >
            <Check class="mr-2 h-4 w-4" />
            Mark All Reviewed
          </Button>
        </div>
      </div>
    </div>
  </ProfitLossModal>
</template>

<style scoped>
.pl-statement-modal {
  max-width: 800px;
  margin: 0 auto;
}

.traditional-pl-statement {
  background: white;
  padding: 40px;
  line-height: 1.6;
  color: #000;
}

/* Header Styles */
.pl-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #000;
  padding-bottom: 20px;
}

.company-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.statement-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}

.currency-columns {
  display: flex;
  justify-content: flex-end;
  gap: 80px;
  margin-top: 10px;
}

.currency-label {
  font-weight: bold;
  font-size: 14px;
}

/* Section Styles */
.pl-section {
  margin-bottom: 20px;
}

.section-header {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
}

.section-items {
  margin-left: 0;
}

/* Line Item Styles */
.pl-line-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
  min-height: 24px;
  position: relative;
}

.pl-line-item:hover {
  background-color: #f8f9fa;
}

.pl-line-item.editing {
  background-color: #e3f2fd;
}

.item-description {
  flex: 1;
  padding-right: 20px;
}

.description-text {
  cursor: pointer;
  font-size: 14px;
}

.description-text:hover {
  color: #1976d2;
  text-decoration: underline;
}

.item-amount {
  width: 120px;
  text-align: right;
  position: relative;
}

.amount-display {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.amount-value {
  font-size: 14px;
  min-width: 80px;
  text-align: right;
}

/* Edit Controls */
.edit-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

.edit-description {
  width: 300px;
}

.edit-amount {
  width: 100px;
}

.edit-btn,
.delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
  padding: 2px 4px;
  height: 20px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pl-line-item:hover .edit-btn,
.pl-line-item:hover .delete-btn {
  opacity: 1;
}

/* Add Item Form */
.add-item-form {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin: 8px 0;
}

.form-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.description-input {
  flex: 1;
}

.amount-input {
  width: 100px;
}

.adjustment-select {
  width: 100px;
  padding: 4px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.add-item-btn {
  margin: 4px 0;
  font-size: 12px;
  height: 24px;
}

/* Total Lines */
.subtotal-line {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-top: 1px solid #000;
  margin-top: 8px;
}

.subtotal-description {
  font-weight: normal;
  font-size: 14px;
}

.subtotal-amount {
  font-weight: normal;
  font-size: 14px;
  width: 120px;
  text-align: right;
}

.total-line {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-top: 1px solid #000;
  margin: 16px 0;
}

.total-description {
  font-weight: bold;
  font-size: 14px;
}

.total-amount {
  font-weight: bold;
  font-size: 14px;
  width: 120px;
  text-align: right;
}

.final-total-line {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  margin: 20px 0;
}

.final-total-description {
  font-weight: bold;
  font-size: 16px;
}

.final-total-amount {
  font-weight: bold;
  font-size: 16px;
  width: 120px;
  text-align: right;
}

/* Modal Footer */
.modal-footer {
  border-top: 1px solid #e8e8e8;
  padding: 16px 24px;
  background-color: #fafafa;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .traditional-pl-statement {
    padding: 20px;
  }

  .currency-columns {
    gap: 40px;
  }

  .pl-line-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .item-amount {
    width: 100%;
    text-align: left;
  }

  .amount-display {
    justify-content: flex-start;
  }
}

/* Print Styles */
@media print {
  .edit-btn,
  .delete-btn,
  .add-item-btn,
  .add-item-form,
  .modal-footer {
    display: none !important;
  }

  .traditional-pl-statement {
    padding: 0;
    box-shadow: none;
  }
}
</style>
