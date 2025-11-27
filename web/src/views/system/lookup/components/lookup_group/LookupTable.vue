<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div class="flex-1">
        <div
          v-if="hasMore || page > 1 || (searchQuery && searchQuery.length > 0)"
          class="relative"
        >
          <Input
            v-model="searchQuery"
            type="search"
            placeholder="Search code, name or description..."
            data-test="search"
            class="w-full pr-8"
            @input="onSearchChange"
          />
          <!-- clear button appears when there's a query -->
          <Button
            v-if="searchQuery && searchQuery.length > 0"
            variant="ghost"
            size="icon"
            class="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            data-test="search-clear"
            @click="clearSearch"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        v-if="props.selection.length > 0"
        variant="destructive"
        data-test="delete-selected"
        @click="confirmBulkDelete"
      >
        Delete Selected
      </Button>
      <Button v-if="props.showActions" data-test="add-item" @click="openAdd">
        Add Item
      </Button>
    </div>

    <div class="mt-3 overflow-x-auto rounded-lg border">
      <table data-test="lookup-table" class="w-full text-sm">
        <thead class="bg-background">
          <tr>
            <th class="w-12 px-4 py-3 text-center">
              <input
                ref="selectAllCheckbox"
                type="checkbox"
                class="border-input text-primary focus:ring-primary h-4 w-4 rounded disabled:opacity-50"
                :checked="isAllSelected"
                :disabled="props.selectionDisabled || localItems.length === 0"
                title="Select All"
                @change="toggleSelectAll"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.name"
              class="text-foreground px-4 py-3 text-left font-medium"
            >
              {{ col.label || col.name }}
            </th>
            <th
              v-if="props.showActions"
              class="text-foreground w-24 px-4 py-3 text-center font-medium"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loadingPage && localItems && localItems.length === 0">
            <td
              :colspan="columns.length + 1 + (props.showActions ? 1 : 0)"
              class="border-t px-4 py-3 text-center"
            >
              No records found.
            </td>
          </tr>
          <tr v-for="item in localItems" :key="item.id" class="border-t">
            <td class="px-4 py-3 text-center">
              <input
                type="checkbox"
                class="border-input text-primary focus:ring-primary h-4 w-4 rounded disabled:opacity-50"
                :checked="props.selection.includes(item.id)"
                :disabled="props.selectionDisabled"
                @change="toggleItemSelection(item.id, $event.target.checked)"
              />
            </td>
            <td v-for="col in columns" :key="col.name" class="px-4 py-3">
              {{
                getFormattedValue(
                  item.columns ? item.columns[col.name] : '',
                  col,
                )
              }}
            </td>
            <td v-if="props.showActions" class="w-24 px-4 py-3 text-center">
              <GroupActions
                :group="item"
                @edit="openEdit"
                @delete="confirmDelete"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="hasPager && (hasMore || page > 1)"
      class="mt-4 flex flex-wrap items-center justify-start gap-2 text-sm"
    >
      <Button
        variant="outline"
        size="sm"
        data-test="first-page"
        :disabled="page <= 1 || loadingPage"
        @click="fetchPage(1)"
      >
        First
      </Button>
      <Button
        variant="outline"
        size="sm"
        data-test="prev-page"
        :disabled="page <= 1 || loadingPage"
        @click="prevPage"
      >
        Prev
      </Button>

      <div class="relative flex items-center">
        <Input
          v-model.number="pageInput"
          data-test="page"
          type="number"
          min="1"
          :max="totalPages ?? undefined"
          :disabled="loadingPage"
          class="h-8 w-14 rounded-md border p-1 text-center text-sm"
          aria-label="Page number"
          @keyup.enter="onPageInputSubmit"
          @blur="onPageInputSubmit"
          @input="onPageInputChange"
        />
        <span v-if="totalPages != null" class="text-muted-foreground ml-2"
          >of {{ totalPages }}</span
        >
        <span
          v-if="invalidPage"
          class="ml-2 font-bold text-red-700"
          title="Page out of range"
          >✕</span
        >
      </div>

      <Button
        variant="outline"
        size="sm"
        data-test="next-page"
        :disabled="!hasMore || loadingPage"
        @click="nextPage"
      >
        Next
      </Button>
      <Button
        variant="outline"
        size="sm"
        data-test="last-page"
        :disabled="!hasMore || loadingPage"
        @click="jumpToLast"
      >
        Last
      </Button>
    </div>

    <!-- Reuse shared DeleteConfirm modal -->
    <delete-confirm
      v-model="showDeleteModal"
      title="Confirm delete"
      message="Are you sure you want to delete this item? This action cannot be undone."
      :target-label="deleteTargetLabel"
      @confirm="performDelete"
      @cancel="cancelDelete"
    />

    <lookup-item-form ref="lookupItemFormRef" @save="handleCreateOrUpdate" />
    <GenericFormModal ref="genericFormModalRef" @save="handleGenericSave" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue';
import { DeleteConfirm } from '../../../shared_components';
import { LookupItemForm, GroupActions } from '..';
import GenericFormModal from '../../../form_c/components/GenericFormModal.vue';
import * as lookupService from '../../../services';
import {
  notifySuccess,
  notifyError,
  formatNumber,
  normalizeString,
} from '../../utils';
import { Button, Input } from '@vben-core/shadcn-ui';
import { X } from '@vben/icons';

/**
 * Open the item form in "edit" mode for the provided item.
 */
import {
  getFormSubmission,
  saveFormSubmission,
} from '../../../services/generic_form_service';

const props = withDefaults(
  defineProps<{
    title?: string;
    columns?: any[];
    items?: any[];
    perPage?: number;
    groupId?: string | null;
    group?: any | null;
    hasPager?: boolean;
    selection?: string[];
    showActions?: boolean;
    selectionDisabled?: boolean;
    addForm?: string;
  }>(),
  {
    columns: () => [],
    items: () => [],
    hasPager: true,
    selection: () => [],
    showActions: true,
    selectionDisabled: false,
    addForm: undefined,
  },
);

// Template and runtime helpers: ensure `columns` is always an array to avoid
// template-level 'possibly undefined' complaints from the language server.
const columns = computed(() => props.columns || []);

const emit = defineEmits<{
  (e: 'create', payload: any): void;
  (e: 'update', payload: any): void;
  (e: 'delete', id: any): void;
  (e: 'update:selection', value: string[]): void;
}>();

// Reactive state
const lookupItemFormRef = ref<any>(null);
const genericFormModalRef = ref<any>(null);
const localItems = ref<any[]>((props.items && [...props.items]) || []);
const page = ref(1);
const pageInput = ref(1);
const totalCount = ref<number | null>(null);
const totalPages = ref<number | null>(null);
const invalidPage = ref(false);
const loadingPage = ref(false);
const hasMore = ref(false);
const searchQuery = ref('');
let _searchTimer: any = null;
const showDeleteModal = ref(false);
const deleteTarget = ref<any | null>(null);
const isBulkDelete = ref(false);
const selectAllCheckbox = ref<HTMLInputElement | null>(null);

// Computed properties for the "Select All" checkbox state
const visibleItemIds = computed(
  () => new Set(localItems.value.map((item) => item.id)),
);

const getFormattedValue = (value: any, column: any): string => {
  if (column.type === 'currency' || column.type === 'number') {
    return formatNumber(value);
  }
  // If it's a string value and not explicitly marked as raw, normalize it
  if (typeof value === 'string' && column.type !== 'raw') {
    return normalizeString(value);
  }
  return value || '';
};

const selectedVisibleCount = computed(() => {
  if (!props.selection) return 0;
  return props.selection.filter((id) => visibleItemIds.value.has(id)).length;
});

const isAllSelected = computed(() => {
  if (visibleItemIds.value.size === 0) return false;
  return selectedVisibleCount.value === visibleItemIds.value.size;
});

const isPartiallySelected = computed(() => {
  return selectedVisibleCount.value > 0 && !isAllSelected.value;
});

// Watcher to set the indeterminate property on the checkbox
watch(
  isPartiallySelected,
  (isPartial) => {
    if (selectAllCheckbox.value) {
      selectAllCheckbox.value.indeterminate = isPartial;
    }
  },
  { immediate: true, flush: 'post' },
);

function toggleSelectAll() {
  const currentSelection = new Set(props.selection || []);
  const visibleIds = [...visibleItemIds.value];

  if (isAllSelected.value) {
    // If all are selected, deselect all visible items
    visibleIds.forEach((id) => currentSelection.delete(id));
  } else {
    // If not all are selected (or partially selected), select all visible items
    visibleIds.forEach((id) => currentSelection.add(id));
  }
  emit('update:selection', [...currentSelection]);
}

function toggleItemSelection(itemId: string, checked: boolean) {
  if (!props.selection) return;
  const newSelection = [...props.selection];
  const index = newSelection.indexOf(itemId);

  if (checked && index === -1) {
    // If checked and not already in selection, add it
    newSelection.push(itemId);
  } else if (!checked && index > -1) {
    // If unchecked and in selection, remove it
    newSelection.splice(index, 1);
  }
  emit('update:selection', newSelection);
}

const instance = getCurrentInstance();
/**
 * Safe access helper that prefers explicit prop values but falls back to
 * attributes passed on the component vnode (useful when using template refs
 * or programmatic invocation).
 *
 * Parameters:
 * - key: property name to lookup on instance.props or vnode.props.
 * Returns: the effective value or undefined.
 */
function effectiveAttr(key: string) {
  return (
    (instance && (instance.props as any)[key]) ||
    (instance && (instance.vnode.props as any)[key])
  );
}

/**
 * Resolve the effective group id for service calls.
 *
 * Behaviour: prefers `props.groupId`, then checks runtime attributes.
 */
const effectiveGroupId = () =>
  props.groupId || (effectiveAttr('groupId') as any) || null;

/**
 * Compute a human-friendly label for the currently selected delete target.
 *
 * Returns the first available readable column (name/value/description/label/code)
 * or the fallback stringified id.
 */
const deleteTargetLabel = computed(() => {
  if (isBulkDelete.value) {
    return `${props.selection.length} items`;
  }
  const t = deleteTarget.value;
  if (!t) return '';
  return (
    t.columns?.name ||
    t.columns?.value ||
    t.columns?.description ||
    t.columns?.label ||
    t.columns?.code ||
    String(t.id)
  );
});

watch(
  () => props.groupId,
  (newVal, oldVal) => {
    if (newVal === oldVal) return;
    localItems.value = [];
    page.value = 1;
    hasMore.value = false;
    searchQuery.value = '';
    fetchPage(1).catch(() => {});
  },
);

watch(
  () => props.group,
  (newVal, oldVal) => {
    if (newVal === oldVal) return;
    localItems.value = [];
    page.value = 1;
    hasMore.value = false;
    searchQuery.value = '';
    fetchPage(1).catch(() => {});
  },
);

watch(
  () => props.items,
  (newVal) => {
    localItems.value = newVal ? [...newVal] : [];
  },
);

watch(page, (newVal) => {
  pageInput.value = newVal;
});

onMounted(() => {
  if ((!props.items || props.items.length === 0) && props.hasPager !== false) {
    fetchPage(1).catch(() => {});
  }
});

/**
 * Fetch a page of items from the lookup service.
 *
 * Parameters:
 * - p: page number (1-based).
 *
 * Behaviour:
 * - Sets `loadingPage` while fetching.
 * - Updates `localItems`, pagination counters, and `hasMore`.
 * - Accepts optional `searchQuery` and `perPage` props.
 * Side effects: mutates reactive state used by the template.
 */
async function fetchPage(p = 1) {
  loadingPage.value = true;
  try {
    const res = await lookupService.listItems(effectiveGroupId(), {
      page: p,
      perPage: props.perPage || 10,
      q:
        searchQuery.value && searchQuery.value.length > 0
          ? searchQuery.value
          : undefined,
      count: true,
    });

    const items = Array.isArray(res) ? res : (res && (res.items || [])) || [];
    // `res` can be an array or an object; cast to any before accessing `.total`
    const r: any = res as any;
    const total = r && r.total !== undefined ? r.total : null;

    if (total !== null && !Number.isNaN(Number(total))) {
      totalCount.value = Number(total);
      totalPages.value = Math.max(
        1,
        Math.ceil(totalCount.value / (props.perPage || 10)),
      );
    } else {
      totalCount.value = null;
      totalPages.value = null;
    }

    localItems.value = items.slice(0, props.perPage || 10);
    page.value = p;
    hasMore.value =
      totalPages.value === null
        ? items.length > (props.perPage || 10)
        : page.value < totalPages.value;
  } finally {
    loadingPage.value = false;
  }
}

/**
 * Debounced handler for search input changes.
 *
 * Behaviour: waits 300ms after the last keystroke then refetches page 1.
 */
function onSearchChange() {
  if (_searchTimer) clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => {
    fetchPage(1).catch(() => {});
  }, 300);
}

/**
 * Clear the current search query and refresh the list.
 */
function clearSearch() {
  searchQuery.value = '';
  if (_searchTimer) clearTimeout(_searchTimer);
  fetchPage(1).catch(() => {});
}

/**
 * Prepare and open the delete confirmation modal for the given item.
 * Side effects: sets `deleteTarget` and shows the modal.
 */
function confirmDelete(item: any) {
  deleteTarget.value = item;
  isBulkDelete.value = false;
  showDeleteModal.value = true;
}

function confirmBulkDelete() {
  isBulkDelete.value = true;
  showDeleteModal.value = true;
}

/**
 * Perform deletion of the currently selected delete target.
 *
 * Behaviour: hides the modal, clears the target and attempts removal via
 * `remove(item)`. Errors are caught and ignored to avoid UI interruption.
 */
async function performDelete() {
  if (isBulkDelete.value) {
    showDeleteModal.value = false;
    try {
      await removeBulk(props.selection);
    } catch {
      /* ignore */
    }
    return;
  }

  if (!deleteTarget.value) return;
  const item = deleteTarget.value;
  showDeleteModal.value = false;
  deleteTarget.value = null;
  try {
    await remove(item);
  } catch {
    /* ignore */
  }
}

/**
 * Cancel the delete flow and reset modal state.
 */
function cancelDelete() {
  showDeleteModal.value = false;
  deleteTarget.value = null;
}

/**
 * Open the item form in "add" mode.
 */
function openAdd() {
  if (props.addForm) {
    genericFormModalRef.value?.open(props.addForm);
  } else {
    lookupItemFormRef.value?.open({
      initial: null,
      columns: columns.value,
      group: props.group || effectiveAttr('group') || null,
      groupId: effectiveGroupId(),
    });
  }
}

// ... (existing imports)

// ... (existing code)

/**
 * Open the item form in "edit" mode for the provided item.
 */
async function openEdit(item: any) {
  let initialData = item;
  if (item.columns && item.columns.submissionId) {
    try {
      const submission = await getFormSubmission(item.columns.submissionId);
      if (submission) {
        initialData = submission.data;
      }
    } catch (error) {
      console.error('Failed to load submission data:', error);
      notifyError('Failed to load full form data.');
    }
  }

  if (props.addForm) {
    genericFormModalRef.value?.open(props.addForm, { initialData });
  } else {
    lookupItemFormRef.value?.open({
      initial: item,
      columns: columns.value,
      group: props.group || effectiveAttr('group') || null,
      groupId: effectiveGroupId(),
    });
  }
}

function handleGenericSave(data: any) {
  // data is the full form submission data
  handleCreateOrUpdate({ columns: data, isGenericSubmission: true });
}

/**
 * Handle item creation or update from the child form.
 */
async function handleCreateOrUpdate(payload: any) {
  let columnsToSave = payload.columns;
  let submissionId = payload.id; // Use existing ID if updating

  if (payload.isGenericSubmission && props.addForm) {
    // 1. Save the full submission
    try {
      const submission = {
        submissionId: payload.id || '', // Empty for new
        templateId: props.addForm,
        year: 2025, // TODO: Get from context or props
        data: payload.columns,
        updated_at: new Date().toISOString(),
      };
      const savedSubmission = await saveFormSubmission(submission);
      submissionId = savedSubmission.submissionId;

      // 2. Create summary for lookup table
      // Extract fields that match the lookup columns
      const summaryColumns: any = { submissionId };
      props.columns?.forEach((col) => {
        const key = col.key || col.name;
        if (key && payload.columns[key] !== undefined) {
          summaryColumns[key] = payload.columns[key];
        }
      });
      columnsToSave = summaryColumns;
    } catch (error) {
      console.error('Failed to save generic submission:', error);
      notifyError('Failed to save form data.');
      return;
    }
  }

  const itemPayload = {
    id: payload.id, // This might need adjustment for new items vs updates
    columns: columnsToSave,
  };

  if (payload.id) {
    // ... (existing update logic using itemPayload)
    const idx = localItems.value.findIndex((i) => i.id === payload.id);
    if (idx === -1) {
      notifyError('Item to update not found locally.');
      return;
    }
    const originalItem = localItems.value[idx];
    const before = { ...originalItem };
    localItems.value.splice(idx, 1, {
      ...originalItem,
      columns: columnsToSave,
    });
    try {
      const res = await lookupService.updateItem(
        effectiveGroupId() || 'unknown',
        payload.id,
        itemPayload,
      );
      notifySuccess('Item updated');
      emit('update', res);
      try {
        await fetchPage(page.value);
      } catch {
        /* ignore */
      }
    } catch (error) {
      localItems.value.splice(idx, 1, before);
      console.error('Update failed:', error);
      notifyError('Failed to update item');
    }
  } else {
    // ... (existing create logic using itemPayload)
    const tempId = `tmp-${Date.now()}`;
    const newItem = { id: tempId, columns: columnsToSave };
    localItems.value.unshift(newItem as any);
    try {
      const res = await lookupService.createItem(
        effectiveGroupId() || 'unknown',
        itemPayload,
      );
      const idx = localItems.value.findIndex((i) => i.id === tempId);
      if (idx !== -1) localItems.value.splice(idx, 1, res);
      notifySuccess('Item created');
      emit('create', res);
      try {
        await fetchPage(1);
      } catch {
        /* ignore */
      }
    } catch (error) {
      localItems.value = localItems.value.filter((i) => i.id !== tempId);
      console.error('Create failed:', error);
      notifyError('Failed to create item');
    }
  }
}

/**
 * Remove multiple items.
 */
async function removeBulk(ids: string[]) {
  const before = [...localItems.value];
  // Optimistic update
  localItems.value = localItems.value.filter((i) => !ids.includes(i.id));

  try {
    await lookupService.deleteItems(effectiveGroupId() || 'unknown', ids);
    notifySuccess('Items deleted');
    emit('update:selection', []);
    try {
      // Refresh current page
      await fetchPage(page.value);
    } catch {
      /* ignore */
    }
  } catch (error) {
    localItems.value = before;
    console.error('Bulk delete failed:', error);
    notifyError('Failed to delete items');
  }
}

/**
 * Remove an item both locally and on the server.
 *
 * Behaviour:
 * - Optimistically removes the item from `localItems` then calls the
 *   service to delete it. On error, restores the previous state and shows
 *   an error notification.
 * - After successful deletion, emits a `delete` event and refreshes the
 *   current page (or previous page when needed).
 */
async function remove(item: any) {
  const before = [...localItems.value];
  localItems.value = localItems.value.filter((i) => i.id !== item.id);
  try {
    await lookupService.deleteItem(effectiveGroupId() || 'unknown', item.id);
    notifySuccess('Item deleted');
    emit('delete', item.id);
    try {
      await (localItems.value.length === 0 && page.value > 1
        ? fetchPage(page.value - 1)
        : fetchPage(page.value));
    } catch {
      /* ignore */
    }
  } catch (error) {
    localItems.value = before;
    console.error('Delete failed:', error);
    notifyError('Failed to delete item');
  }
}

/**
 * Navigate to the next page (if available).
 */
async function nextPage() {
  if (!hasMore.value || loadingPage.value) return;
  await fetchPage(page.value + 1);
}

/**
 * Navigate to the previous page (if available).
 */
async function prevPage() {
  if (page.value <= 1 || loadingPage.value) return;
  await fetchPage(page.value - 1);
}

/**
 * Validate and apply the page number entered by the user in the page input.
 *
 * Behaviour: checks bounds, marks invalidPage when out-of-range, and
 * fetches the requested page when valid.
 */
function onPageInputSubmit() {
  let raw = Number(pageInput.value as any);
  if (!Number.isFinite(raw)) raw = Number.NaN;
  const floored = Number.isNaN(raw) ? Number.NaN : Math.floor(raw as number);
  if (!Number.isFinite(floored) || floored < 1) {
    invalidPage.value = true;
    pageInput.value = page.value;
    return;
  }
  const p = Math.max(1, floored as number);
  if (totalPages.value !== null && p > totalPages.value) {
    invalidPage.value = true;
    pageInput.value = page.value;
    return;
  }
  if (p === page.value) return;
  invalidPage.value = false;
  fetchPage(p).catch(() => {});
}

/**
 * Handler for page input changes — clamps the input to the maximum allowed
 * page when known and resets invalidPage state.
 */
function onPageInputChange() {
  if (invalidPage.value) invalidPage.value = false;
  if (
    totalPages.value !== null &&
    Number.isFinite(pageInput.value as any) &&
    (pageInput.value as number) > totalPages.value
  ) {
    pageInput.value = totalPages.value as number;
    invalidPage.value = false;
  }
}

/**
 * Jump to the last page by probing pages exponentially then binary-searching
 * the last available page when `totalPages` is unknown.
 *
 * Behaviour: attempts to discover the last page while keeping network usage
 * reasonable. Logs and swallows errors on failure.
 */
async function jumpToLast() {
  if (loadingPage.value) return;
  if (totalPages.value !== null) {
    if (page.value !== totalPages.value) await fetchPage(totalPages.value);
    return;
  }
  if (!hasMore.value) return;
  try {
    let cur = page.value;
    let step = 1;
    let upper: number | null = null;
    while (true) {
      const candidate = cur + step;
      await fetchPage(candidate);
      if (hasMore.value) {
        cur = candidate;
        step = step * 2;
        if (step > 100_000) break;
        continue;
      } else {
        upper = candidate;
        break;
      }
    }
    if (upper === null) return;
    let lo = cur;
    let hi = upper;
    while (lo + 1 < hi) {
      const mid = Math.floor((lo + hi) / 2);
      await fetchPage(mid);
      if (hasMore.value) lo = mid;
      else hi = mid;
    }
    if (page.value !== hi) await fetchPage(hi);
  } catch (error) {
    console.error('Failed to jump to last page', error);
  }
}
</script>
