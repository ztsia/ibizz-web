<script lang="ts" setup>
import { computed } from 'vue';
import { useTaxFilingStore } from '#/store/tax-filing';
import type {
  BalanceSheetProps,
  BalanceSheetEmits,
} from '../types/component-types';
import type { FinancialItem } from '#/store/tax-filing';

const props = withDefaults(defineProps<BalanceSheetProps>(), {
  editable: true,
  companyName: 'COMPANY SDN BHD',
  reportingPeriod: 'BALANCE SHEET AS AT 31ST DEC 2024',
});

const emit = defineEmits<BalanceSheetEmits>();

// Use tax filing store
const taxFilingStore = useTaxFilingStore();

// Get balance sheet items from store
const bsItems = computed(() => {
  const items = taxFilingStore.bsItems;
  console.log('bsItems from store:', items);
  console.log('bsItems length:', items.length);
  return items;
});

// Group items by type
const nonCurrentAssets = computed(() => {
  const items = bsItems.value.filter(
    (item) => item.type === 'non-current-asset',
  );
  console.log('nonCurrentAssets:', items);
  return items;
});

const currentAssets = computed(() => {
  const items = bsItems.value.filter((item) => item.type === 'current-asset');
  console.log('currentAssets:', items);
  return items;
});

const currentLiabilities = computed(() => {
  const items = bsItems.value.filter(
    (item) => item.type === 'current-liability',
  );
  console.log('currentLiabilities:', items);
  return items;
});

const longTermLiabilities = computed(() => {
  const items = bsItems.value.filter(
    (item) => item.type === 'long-term-liability',
  );
  console.log('longTermLiabilities:', items);
  return items;
});

const equity = computed(() => {
  const items = bsItems.value.filter((item) => item.type === 'capital');
  console.log('equity:', items);
  return items;
});

// Calculate totals
const totalNonCurrentAssets = computed(() =>
  nonCurrentAssets.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalCurrentAssets = computed(() =>
  currentAssets.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalAssets = computed(
  () => totalNonCurrentAssets.value + totalCurrentAssets.value,
);

const totalCurrentLiabilities = computed(() =>
  currentLiabilities.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalLongTermLiabilities = computed(() =>
  longTermLiabilities.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalLiabilities = computed(
  () => totalCurrentLiabilities.value + totalLongTermLiabilities.value,
);

const totalEquity = computed(() =>
  equity.value.reduce((sum, item) => sum + item.amount, 0),
);

const totalLiabilitiesAndEquity = computed(
  () => totalLiabilities.value + totalEquity.value,
);

// Balance verification
const isBalanced = computed(() => {
  return Math.abs(totalAssets.value - totalLiabilitiesAndEquity.value) < 0.01;
});

// Format number helper
const formatNumber = (value: number) => {
  if (!value) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Update item in store
const updateItem = (
  item: FinancialItem,
  newValue: string | number | FinancialItem,
) => {
  const index = taxFilingStore.bSItems.findIndex(
    (storeItem) =>
      storeItem.description === item.description &&
      storeItem.type === item.type,
  );

  if (index !== -1) {
    let updatedItem: FinancialItem;

    if (typeof newValue === 'object' && newValue !== null) {
      // Handle description update (when newValue is a FinancialItem object)
      updatedItem = { ...newValue };
    } else {
      // Handle amount update (when newValue is string or number)
      updatedItem = {
        ...item,
        amount:
          typeof newValue === 'string'
            ? Number.parseFloat(newValue.replaceAll(',', '')) || 0
            : newValue,
      };
    }

    console.log('Updating item at index:', index, 'with:', updatedItem);
    taxFilingStore.updateHardcodedItem(index, updatedItem, 'bs');
  }
};

// Add new row functionality
const addNewRow = (sectionType: string) => {
  const typeMap: Record<string, FinancialItem['type']> = {
    nonCurrentAssets: 'non-current-asset',
    currentAssets: 'current-asset',
    currentLiabilities: 'current-liability',
    longTermLiabilities: 'long-term-liability',
    equity: 'capital',
  };

  const newItem: FinancialItem = {
    description: 'New Item',
    amount: 0,
    sheet_source: 'Manual Entry',
    type: typeMap[sectionType] || 'current-asset',
    editable: true,
  };

  taxFilingStore.addBSItem(newItem);
  handleDataChange();
};

// Handle data changes
const handleDataChange = () => {
  emit('data-change', {
    balanceSheetData: {
      nonCurrentAssets: nonCurrentAssets.value,
      currentAssets: currentAssets.value,
      currentLiabilities: currentLiabilities.value,
      nonCurrentLiabilities: longTermLiabilities.value,
      equity: equity.value,
    },
    totals: {
      totalCurrentAssets: totalCurrentAssets.value,
      totalNonCurrentAssets: totalNonCurrentAssets.value,
      totalAssets: totalAssets.value,
      totalCurrentLiabilities: totalCurrentLiabilities.value,
      totalNonCurrentLiabilities: totalLongTermLiabilities.value,
      totalLiabilities: totalLiabilities.value,
      totalEquity: totalEquity.value,
      totalLiabilitiesAndEquity: totalLiabilitiesAndEquity.value,
      isBalanced: isBalanced.value,
    },
  });
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="rounded-lg border">
      <div class="border-b px-6 py-4">
        <h3 class="text-lg font-semibold">BALANCE SHEET</h3>
        <p class="text-sm">{{ companyName }}</p>
        <p class="text-sm">{{ reportingPeriod }}</p>
      </div>
    </div>

    <!-- Assets Section -->
    <div class="rounded-lg border">
      <div class="overflow-hidden">
        <table class="w-full">
          <tbody>
            <!-- Assets Header -->
            <tr class="border-b">
              <td
                class="bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
              >
                ASSETS
              </td>
              <td class="bg-green-50 px-4 py-3"></td>
            </tr>

            <!-- Non-Current Assets -->
            <tr class="border-b">
              <td class="bg-green-100 px-4 py-3 text-sm font-medium">
                NON-CURRENT ASSETS
              </td>
              <td class="bg-green-100 px-4 py-3"></td>
            </tr>
            <tr
              v-for="(item, index) in nonCurrentAssets"
              :key="`nca-${index}`"
              class="border-b border-gray-100"
            >
              <td class="px-4 py-2 pl-8 text-sm">
                <input
                  v-if="editable"
                  :value="item.description"
                  type="text"
                  class="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  @input="
                    (e) =>
                      updateItem(item, {
                        ...item,
                        description: (e.target as HTMLInputElement).value,
                      })
                  "
                  @change="handleDataChange"
                />
                <span v-else class="text-sm">{{ item.description }}</span>
              </td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  :value="formatNumber(item.amount)"
                  type="text"
                  class="w-32 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  @input="
                    (e) =>
                      updateItem(item, (e.target as HTMLInputElement).value)
                  "
                  @change="handleDataChange"
                />
                <span v-else class="font-mono text-sm">{{
                  formatNumber(item.amount)
                }}</span>
              </td>
            </tr>
            <tr v-if="editable" class="border-b border-gray-100">
              <td class="px-4 py-2 text-center">
                <button
                  @click="addNewRow('nonCurrentAssets')"
                  class="text-sm font-medium text-green-600 hover:text-green-800"
                >
                  + Add New Row
                </button>
              </td>
              <td class="px-4 py-2"></td>
            </tr>
            <tr class="border-b bg-green-100">
              <td class="px-4 py-3 text-sm font-medium">
                TOTAL NON-CURRENT ASSETS
              </td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-medium">{{
                  formatNumber(totalNonCurrentAssets)
                }}</span>
              </td>
            </tr>

            <!-- Current Assets -->
            <tr class="border-b">
              <td class="bg-green-100 px-4 py-3 text-sm font-medium">
                CURRENT ASSETS
              </td>
              <td class="bg-green-100 px-4 py-3"></td>
            </tr>
            <tr
              v-for="(item, index) in currentAssets"
              :key="`ca-${index}`"
              class="border-b border-gray-100"
            >
              <td class="px-4 py-2 pl-8 text-sm">
                <input
                  v-if="editable"
                  :value="item.description"
                  type="text"
                  class="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  @input="
                    (e) =>
                      updateItem(item, {
                        ...item,
                        description: (e.target as HTMLInputElement).value,
                      })
                  "
                  @change="handleDataChange"
                />
                <span v-else class="text-sm">{{ item.description }}</span>
              </td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  :value="formatNumber(item.amount)"
                  type="text"
                  class="w-32 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  @input="
                    (e) =>
                      updateItem(item, (e.target as HTMLInputElement).value)
                  "
                  @change="handleDataChange"
                />
                <span v-else class="font-mono text-sm">{{
                  formatNumber(item.amount)
                }}</span>
              </td>
            </tr>
            <tr v-if="editable" class="border-b border-gray-100">
              <td class="px-4 py-2 text-center">
                <button
                  @click="addNewRow('currentAssets')"
                  class="text-sm font-medium text-green-600 hover:text-green-800"
                >
                  + Add New Row
                </button>
              </td>
              <td class="px-4 py-2"></td>
            </tr>
            <tr class="border-b bg-green-100">
              <td class="px-4 py-3 text-sm font-medium">
                TOTAL CURRENT ASSETS
              </td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-medium">{{
                  formatNumber(totalCurrentAssets)
                }}</span>
              </td>
            </tr>

            <!-- Total Assets -->
            <tr class="border-b bg-green-200">
              <td class="px-4 py-3 text-sm font-bold text-green-800">
                TOTAL ASSETS
              </td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-bold text-green-800">{{
                  formatNumber(totalAssets)
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Liabilities Section -->
    <div class="rounded-lg border">
      <div class="overflow-hidden">
        <table class="w-full">
          <tbody>
            <!-- Liabilities Header -->
            <tr class="border-b">
              <td class="bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                LIABILITIES
              </td>
              <td class="bg-red-50 px-4 py-3"></td>
            </tr>

            <!-- Current Liabilities -->
            <tr class="border-b">
              <td class="bg-red-100 px-4 py-3 text-sm font-medium">
                CURRENT LIABILITIES
              </td>
              <td class="bg-red-100 px-4 py-3"></td>
            </tr>
            <tr
              v-for="(item, index) in currentLiabilities"
              :key="`cl-${index}`"
              class="border-b border-gray-100"
            >
              <td class="px-4 py-2 pl-8 text-sm">
                <input
                  v-if="editable"
                  :value="item.description"
                  type="text"
                  class="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  @input="
                    (e) =>
                      updateItem(item, {
                        ...item,
                        description: (e.target as HTMLInputElement).value,
                      })
                  "
                  @change="handleDataChange"
                />
                <span v-else class="text-sm">{{ item.description }}</span>
              </td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  :value="formatNumber(item.amount)"
                  type="text"
                  class="w-32 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  @input="
                    (e) =>
                      updateItem(item, (e.target as HTMLInputElement).value)
                  "
                  @change="handleDataChange"
                />
                <span v-else class="font-mono text-sm">{{
                  formatNumber(item.amount)
                }}</span>
              </td>
            </tr>
            <tr v-if="editable" class="border-b border-gray-100">
              <td class="px-4 py-2 text-center">
                <button
                  @click="addNewRow('currentLiabilities')"
                  class="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  + Add New Row
                </button>
              </td>
              <td class="px-4 py-2"></td>
            </tr>
            <tr class="border-b bg-red-100">
              <td class="px-4 py-3 text-sm font-medium">
                TOTAL CURRENT LIABILITIES
              </td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-medium">{{
                  formatNumber(totalCurrentLiabilities)
                }}</span>
              </td>
            </tr>

            <!-- Non-Current Liabilities -->
            <tr class="border-b">
              <td class="bg-orange-100 px-4 py-3 text-sm font-medium">
                NON-CURRENT LIABILITIES
              </td>
              <td class="bg-orange-100 px-4 py-3"></td>
            </tr>
            <tr
              v-for="(item, index) in longTermLiabilities"
              :key="`ltl-${index}`"
              class="border-b border-gray-100"
            >
              <td class="px-4 py-2 pl-8 text-sm">
                <input
                  v-if="editable"
                  :value="item.description"
                  type="text"
                  class="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  @input="
                    (e) =>
                      updateItem(item, {
                        ...item,
                        description: (e.target as HTMLInputElement).value,
                      })
                  "
                  @change="handleDataChange"
                />
                <span v-else class="text-sm">{{ item.description }}</span>
              </td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  :value="formatNumber(item.amount)"
                  type="text"
                  class="w-32 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  @input="
                    (e) =>
                      updateItem(item, (e.target as HTMLInputElement).value)
                  "
                  @change="handleDataChange"
                />
                <span v-else class="font-mono text-sm">{{
                  formatNumber(item.amount)
                }}</span>
              </td>
            </tr>
            <tr v-if="editable" class="border-b border-gray-100">
              <td class="px-4 py-2 text-center">
                <button
                  @click="addNewRow('longTermLiabilities')"
                  class="text-sm font-medium text-orange-600 hover:text-orange-800"
                >
                  + Add New Row
                </button>
              </td>
              <td class="px-4 py-2"></td>
            </tr>
            <tr class="border-b bg-orange-100">
              <td class="px-4 py-3 text-sm font-medium">
                TOTAL NON-CURRENT LIABILITIES
              </td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-medium">{{
                  formatNumber(totalLongTermLiabilities)
                }}</span>
              </td>
            </tr>

            <!-- Total Liabilities -->
            <tr class="border-b bg-red-200">
              <td class="px-4 py-3 text-sm font-bold text-red-800">
                TOTAL LIABILITIES
              </td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-bold text-red-800">{{
                  formatNumber(totalLiabilities)
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Equity Section -->
    <div class="rounded-lg border">
      <div class="overflow-hidden">
        <table class="w-full">
          <tbody>
            <!-- Equity Header -->
            <tr class="border-b">
              <td
                class="bg-purple-50 px-4 py-3 text-sm font-medium text-purple-800"
              >
                EQUITY
              </td>
              <td class="bg-purple-50 px-4 py-3"></td>
            </tr>
            <tr
              v-for="(item, index) in equity"
              :key="`eq-${index}`"
              class="border-b border-gray-100"
            >
              <td class="px-4 py-2 pl-8 text-sm">
                <input
                  v-if="editable"
                  :value="item.description"
                  type="text"
                  class="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @input="
                    (e) =>
                      updateItem(item, {
                        ...item,
                        description: (e.target as HTMLInputElement).value,
                      })
                  "
                  @change="handleDataChange"
                />
                <span v-else class="text-sm">{{ item.description }}</span>
              </td>
              <td class="px-4 py-2 text-right">
                <input
                  v-if="editable"
                  :value="formatNumber(item.amount)"
                  type="text"
                  class="w-32 rounded border-none bg-transparent px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @input="
                    (e) =>
                      updateItem(item, (e.target as HTMLInputElement).value)
                  "
                  @change="handleDataChange"
                />
                <span v-else class="font-mono text-sm">{{
                  formatNumber(item.amount)
                }}</span>
              </td>
            </tr>
            <tr v-if="editable" class="border-b border-gray-100">
              <td class="px-4 py-2 text-center">
                <button
                  @click="addNewRow('equity')"
                  class="text-sm font-medium text-purple-600 hover:text-purple-800"
                >
                  + Add New Row
                </button>
              </td>
              <td class="px-4 py-2"></td>
            </tr>
            <tr class="border-b bg-blue-100">
              <td class="px-4 py-3 text-sm font-bold text-blue-800">
                TOTAL EQUITY
              </td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-bold text-blue-800">{{
                  formatNumber(totalEquity)
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Balance Verification -->
    <div class="rounded-lg border">
      <div class="overflow-hidden">
        <table class="w-full">
          <tbody>
            <tr class="border-b bg-blue-200">
              <td class="px-4 py-3 text-sm font-bold text-blue-800">
                TOTAL LIABILITIES & EQUITY
              </td>
              <td class="px-4 py-3 text-right">
                <span class="font-mono text-sm font-bold text-blue-800">{{
                  formatNumber(totalLiabilitiesAndEquity)
                }}</span>
              </td>
            </tr>
            <tr class="bg-gray-50">
              <td class="px-4 py-3 text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <span>Balance Verification:</span>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': isBalanced,
                      'bg-red-100 text-red-800': !isBalanced,
                    }"
                  >
                    <svg
                      v-if="isBalanced"
                      class="mr-1 h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <svg
                      v-else
                      class="mr-1 h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    {{ isBalanced ? 'Balanced' : 'Not Balanced' }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <span class="text-sm text-gray-600">
                  Assets = Liabilities + Equity
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}
</style>
