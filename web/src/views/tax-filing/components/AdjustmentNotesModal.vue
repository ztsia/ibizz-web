<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue';
import { Button, Modal, Popconfirm, message } from 'ant-design-vue';
import { useTaxFilingStore } from '#/store';
import type { AdjustmentNote } from '#/store';
import type {
  AdjustmentNotesModalProps,
  AdjustmentNotesModalEmits as Emits,
} from '../types/component-types';

const props = withDefaults(defineProps<AdjustmentNotesModalProps>(), {
  visible: false,
  selectedExpenseIndex: -1,
  section39Eligibility: undefined,
  linkedItem: undefined,
});

const emit = defineEmits<Emits>();

// Local state
const showSection39Rules = ref(false);
const selectedRows = ref<Set<number>>(new Set());
const isLoading = ref(false);

// Use shared adjustment notes from store
const taxFilingStore = useTaxFilingStore();
const {
  addAdjustmentNote: storeAddAdjustmentNote,
  updateAdjustmentNote,
  getAdjustmentNotes,
  removeAdjustmentNote,
} = taxFilingStore;

// Methods
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-MY').format(value);
};

// Auto-resize textarea function
const autoResizeTextarea = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
};

// This function was moved below with enhanced functionality

const addAdjustmentNote = () => {
  const newNote: AdjustmentNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    date: 'DD/MM/YYYY',
    payee: 'Payee',
    s390: false,
    s60f: false,
    absorb: 0,
    amount: 0,
    description: '',
    deductionItems: [],
  };
  const key =
    props.selectedExpenseIndex === -1 ||
    props.selectedExpenseIndex === 'standalone'
      ? 'standalone'
      : props.selectedExpenseIndex.toString();
  storeAddAdjustmentNote(key, newNote);
};

const addNewRow = () => {
  // Simply add a new adjustment note
  addAdjustmentNote();
};

// Get current key for adjustment notes
const getCurrentKey = () => {
  return props.selectedExpenseIndex === -1 ||
    props.selectedExpenseIndex === 'standalone'
    ? 'standalone'
    : props.selectedExpenseIndex.toString();
};

// Delete individual adjustment note
const deleteAdjustmentNote = (noteIndex: number) => {
  const key = getCurrentKey();
  removeAdjustmentNote(key, noteIndex);
  message.success('Adjustment note deleted successfully');
};

// Clone adjustment note
const cloneAdjustmentNote = (note: AdjustmentNote) => {
  const clonedNote: AdjustmentNote = {
    ...note,
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    date: note.date,
    payee: note.payee,
    s390: note.s390,
    s60f: note.s60f,
    absorb: note.absorb,
    amount: note.amount,
    description: note.description,
    deductionItems: [...(note.deductionItems || [])],
  };
  const key = getCurrentKey();
  storeAddAdjustmentNote(key, clonedNote);
  message.success('Adjustment note cloned successfully');
};

// Toggle row selection for bulk operations
const toggleRowSelection = (noteIndex: number) => {
  if (selectedRows.value.has(noteIndex)) {
    selectedRows.value.delete(noteIndex);
  } else {
    selectedRows.value.add(noteIndex);
  }
};

// Select all rows
const selectAllRows = () => {
  const key = getCurrentKey();
  const notes = getAdjustmentNotes(key);
  if (selectedRows.value.size === notes.length) {
    selectedRows.value.clear();
  } else {
    selectedRows.value.clear();
    notes.forEach((_, index) => selectedRows.value.add(index));
  }
};

// Bulk delete selected rows
const bulkDeleteSelected = () => {
  const key = getCurrentKey();
  const sortedIndices = [...selectedRows.value].sort((a, b) => b - a);

  sortedIndices.forEach((index) => {
    removeAdjustmentNote(key, index);
  });

  selectedRows.value.clear();
  message.success(
    `${sortedIndices.length} adjustment notes deleted successfully`,
  );
};

// Save all changes
const saveChanges = async () => {
  isLoading.value = true;
  try {
    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success('All changes saved successfully');
    emit('save');
  } catch {
    message.error('Failed to save changes');
  } finally {
    isLoading.value = false;
  }
};

// Clear selections when modal closes
const closeAdjustmentModal = () => {
  selectedRows.value.clear();
  emit('update:visible', false);
  emit('close');
  showSection39Rules.value = false;
};

// Check if all rows are selected
const isAllSelected = computed(() => {
  const key = getCurrentKey();
  const notes = getAdjustmentNotes(key);
  return notes.length > 0 && selectedRows.value.size === notes.length;
});

// Check if some rows are selected
const isSomeSelected = computed(() => {
  return selectedRows.value.size > 0 && !isAllSelected.value;
});

// Calculate totals for adjustment modal
const calculateAdjustmentTotals = computed(() => {
  const key =
    props.selectedExpenseIndex === -1 ||
    props.selectedExpenseIndex === 'standalone'
      ? 'standalone'
      : props.selectedExpenseIndex.toString();
  const notes = getAdjustmentNotes(key);
  if (!notes || notes.length === 0) {
    return { totalS390: 0, totalS60F: 0, totalAmount: 0 };
  }

  const totalS390 = notes.reduce(
    (sum, note) =>
      sum + (note.s390 ? Number.parseFloat(String(note.amount)) || 0 : 0),
    0,
  );
  const totalS60F = notes.reduce(
    (sum, note) =>
      sum + (note.s60f ? Number.parseFloat(String(note.amount)) || 0 : 0),
    0,
  );
  const totalAmount = notes.reduce(
    (sum, note) => sum + (Number.parseFloat(String(note.amount)) || 0),
    0,
  );

  return { totalS390, totalS60F, totalAmount };
});

// Watch for section39Eligibility changes and auto-set S.39(1) checkbox
watchEffect(() => {
  if (
    props.section39Eligibility &&
    props.selectedExpenseIndex !== -1 &&
    props.selectedExpenseIndex !== 'standalone'
  ) {
    const key = props.selectedExpenseIndex.toString();
    const notes = getAdjustmentNotes(key);
    if (notes.length > 0) {
      // Auto-set S.39(1) checkbox based on eligibility
      notes.forEach((note, index) => {
        if (props.section39Eligibility.eligible) {
          const updatedNote = { ...note, s390: true };
          updateAdjustmentNote(key, index, updatedNote);
        }
      });
    }
  }
});
</script>

<template>
  <Modal
    :open="visible"
    title="Notes To Account"
    width="800px"
    @cancel="closeAdjustmentModal"
  >
    <div class="space-y-4">
      <!-- Header Info -->
      <div class="border-b pb-4">
        <!-- Linked Item Information -->
        <div v-if="props.linkedItem" class="mb-3 rounded-lg bg-blue-50 p-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-lg font-semibold text-blue-800">
                {{ props.linkedItem.description }}
              </div>
              <div class="text-sm text-blue-600">
                Amount: RM {{ formatNumber(props.linkedItem.amount) }}
              </div>
              <div class="text-xs capitalize text-blue-500">
                Type: {{ props.linkedItem.type.replace('-', ' ') }}
              </div>
            </div>
            <div class="rounded-full bg-blue-100 p-2">
              <svg
                class="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium">{{
              props.linkedItem
                ? `Adjustment Notes for ${props.linkedItem.description}`
                : props.selectedExpenseIndex === -1 ||
                    props.selectedExpenseIndex === 'standalone'
                  ? 'Standalone Adjustment Note'
                  : typeof props.selectedExpenseIndex === 'number' &&
                      props.selectedExpenseIndex >= 0
                    ? props.incomeStatementData.operatingExpenses[
                        props.selectedExpenseIndex
                      ]?.name
                    : props.expenseName || 'Expense Item'
            }}</span>
            <span v-if="selectedRows.size > 0" class="text-xs text-gray-500">
              ({{ selectedRows.size }} selected)
            </span>
          </div>
          <div class="flex space-x-2">
            <Popconfirm
              v-if="selectedRows.size > 0"
              title="Are you sure you want to delete the selected notes?"
              ok-text="Yes"
              cancel-text="No"
              @confirm="bulkDeleteSelected"
            >
              <Button size="small" danger>
                Delete Selected ({{ selectedRows.size }})
              </Button>
            </Popconfirm>
            <Button
              size="small"
              type="primary"
              :loading="isLoading"
              @click="saveChanges"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <!-- Summary Row -->
      <div class="grid grid-cols-4 gap-4 rounded bg-blue-50 p-3">
        <div class="text-center">
          <div class="text-xs text-gray-500">Total S.39(1)</div>
          <div class="font-medium">
            RM {{ formatNumber(calculateAdjustmentTotals.totalS390) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-500">Total S.60F</div>
          <div class="font-medium">
            RM {{ formatNumber(calculateAdjustmentTotals.totalS60F) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-500">Total Detailed Amount</div>
          <div class="font-medium">
            RM {{ formatNumber(calculateAdjustmentTotals.totalAmount) }}
          </div>
        </div>
        <div></div>
      </div>

      <!-- Table Headers -->
      <div class="grid grid-cols-10 gap-2 bg-gray-100 p-2 text-xs font-medium">
        <div class="flex items-center justify-center">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isSomeSelected"
            @change="selectAllRows"
            class="rounded"
          />
        </div>
        <div>No.</div>
        <div>Date</div>
        <div>Payee</div>
        <div class="text-center">S.39(1)</div>
        <div class="text-center">S.60F</div>
        <div class="text-center">Absorb %</div>
        <div class="text-center">Amount (RM)</div>
        <div>Description of Expenses</div>
        <div class="text-center">Actions</div>
      </div>

      <!-- Adjustment Entries -->
      <div
        v-if="
          getAdjustmentNotes(
            selectedExpenseIndex === -1 || selectedExpenseIndex === 'standalone'
              ? 'standalone'
              : selectedExpenseIndex.toString(),
          ).length > 0
        "
        class="space-y-2"
      >
        <div
          v-for="(note, noteIndex) in getAdjustmentNotes(
            selectedExpenseIndex === -1 || selectedExpenseIndex === 'standalone'
              ? 'standalone'
              : selectedExpenseIndex.toString(),
          )"
          :key="note.id"
          class="grid grid-cols-10 gap-2 rounded border p-2"
          :class="{ 'bg-blue-50': selectedRows.has(noteIndex) }"
        >
          <div class="flex items-center justify-center">
            <input
              type="checkbox"
              :checked="selectedRows.has(noteIndex)"
              @change="toggleRowSelection(noteIndex)"
              class="rounded"
            />
          </div>
          <div class="flex items-center text-sm">{{ noteIndex + 1 }}</div>
          <div>
            <input
              v-model="note.date"
              type="text"
              placeholder="DD/MM/YYYY"
              class="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              @input="
                updateAdjustmentNote(
                  selectedExpenseIndex === -1 ||
                    selectedExpenseIndex === 'standalone'
                    ? 'standalone'
                    : selectedExpenseIndex.toString(),
                  noteIndex,
                  note,
                )
              "
            />
          </div>
          <div>
            <input
              v-model="note.payee"
              type="text"
              placeholder="Payee"
              class="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              @input="
                updateAdjustmentNote(
                  selectedExpenseIndex === -1 ||
                    selectedExpenseIndex === 'standalone'
                    ? 'standalone'
                    : selectedExpenseIndex.toString(),
                  noteIndex,
                  note,
                )
              "
            />
          </div>
          <div class="text-center">
            <input
              v-model="note.s390"
              type="checkbox"
              class="rounded"
              @change="
                updateAdjustmentNote(
                  selectedExpenseIndex === -1 ||
                    selectedExpenseIndex === 'standalone'
                    ? 'standalone'
                    : selectedExpenseIndex.toString(),
                  noteIndex,
                  note,
                )
              "
            />
          </div>
          <div class="text-center">
            <input
              v-model="note.s60f"
              type="checkbox"
              class="rounded"
              @change="
                updateAdjustmentNote(
                  selectedExpenseIndex === -1 ||
                    selectedExpenseIndex === 'standalone'
                    ? 'standalone'
                    : selectedExpenseIndex.toString(),
                  noteIndex,
                  note,
                )
              "
            />
          </div>
          <div>
            <input
              v-model="note.absorb"
              type="number"
              step="0.01"
              class="w-full rounded border border-gray-300 px-2 py-1 text-center text-xs"
              @input="
                updateAdjustmentNote(
                  selectedExpenseIndex === -1 ||
                    selectedExpenseIndex === 'standalone'
                    ? 'standalone'
                    : selectedExpenseIndex.toString(),
                  noteIndex,
                  note,
                )
              "
            />
          </div>
          <div>
            <input
              v-model="note.amount"
              type="number"
              step="0.01"
              class="w-full rounded border border-gray-300 px-2 py-1 text-right text-xs"
              @input="
                updateAdjustmentNote(
                  selectedExpenseIndex === -1 ||
                    selectedExpenseIndex === 'standalone'
                    ? 'standalone'
                    : selectedExpenseIndex.toString(),
                  noteIndex,
                  note,
                )
              "
            />
          </div>
          <div>
            <textarea
              v-model="note.description"
              placeholder="Description"
              class="w-full resize-none overflow-hidden rounded border border-gray-300 px-2 py-1 text-xs"
              rows="1"
              @input="
                (event) => {
                  autoResizeTextarea(event);
                  updateAdjustmentNote(
                    selectedExpenseIndex === -1 ||
                      selectedExpenseIndex === 'standalone'
                      ? 'standalone'
                      : selectedExpenseIndex.toString(),
                    noteIndex,
                    note,
                  );
                }
              "
              @keydown.enter="autoResizeTextarea"
            ></textarea>
          </div>
          <div class="flex items-center justify-center space-x-1">
            <Button
              size="small"
              type="text"
              @click="cloneAdjustmentNote(note)"
              title="Clone this note"
            >
              <svg
                class="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                ></path>
              </svg>
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this note?"
              ok-text="Yes"
              cancel-text="No"
              @confirm="deleteAdjustmentNote(noteIndex)"
            >
              <Button size="small" type="text" danger title="Delete this note">
                <svg
                  class="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </Button>
            </Popconfirm>
          </div>
        </div>
      </div>

      <!-- Add New Row Button -->
      <div class="py-4 text-center">
        <Button @click="addNewRow" type="dashed" class="w-full">
          + Add New Row
        </Button>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <div>
          <span v-if="selectedRows.size > 0" class="text-sm text-gray-500">
            {{ selectedRows.size }} row(s) selected
          </span>
        </div>
        <div class="space-x-2">
          <Button @click="closeAdjustmentModal">Cancel</Button>
          <Button type="primary" :loading="isLoading" @click="saveChanges">
            Save All Changes
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
