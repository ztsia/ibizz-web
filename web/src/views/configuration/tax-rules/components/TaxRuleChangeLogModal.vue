<template>
  <div>
    <!-- Filters -->
    <div class="border-b bg-gray-50 p-6">
      <div class="flex flex-col gap-4 md:flex-row">
        <div class="flex-1">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search changes..."
              class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <select
            v-model="filterChangeType"
            class="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Changes</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="delete">Deleted</option>
          </select>
          <input
            v-model="filterDateFrom"
            type="date"
            class="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          <input
            v-model="filterDateTo"
            type="date"
            class="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="exportChangeLog"
            class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Download class="h-4 w-4" />
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"
      ></div>
    </div>

    <!-- Change Log List -->
    <div v-else class="max-h-[60vh] flex-1 overflow-y-auto">
      <div class="p-6">
        <div class="space-y-4">
          <div
            v-for="change in filteredChanges"
            :key="change.id"
            class="rounded-lg border bg-white transition-shadow hover:shadow-md"
          >
            <div class="p-4">
              <!-- Change Header -->
              <div class="mb-3 flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full"
                    :class="getChangeTypeClass(change.changeType)"
                  >
                    <component
                      :is="getChangeTypeIcon(change.changeType)"
                      class="h-4 w-4"
                    />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-gray-900">{{
                        change.fieldChanged
                      }}</span>
                      <span
                        class="rounded-full px-2 py-1 text-xs font-medium"
                        :class="getChangeTypeBadgeClass(change.changeType)"
                      >
                        {{
                          change.changeType.charAt(0).toUpperCase() +
                          change.changeType.slice(1)
                        }}
                      </span>
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ formatDate(change.changedAt) }} by
                      {{ change.changedBy }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500"
                    >v{{ change.version }}</span
                  >
                  <button
                    @click="toggleChangeDetails(change.id)"
                    class="rounded p-1 hover:bg-gray-100"
                  >
                    <ChevronDown
                      class="h-4 w-4 text-gray-500 transition-transform"
                      :class="{ 'rotate-180': expandedChanges.has(change.id) }"
                    />
                  </button>
                </div>
              </div>

              <!-- Change Reason -->
              <div class="mb-3">
                <div class="text-sm text-gray-700">
                  <span class="font-medium">Reason:</span> {{ change.reason }}
                </div>
              </div>

              <!-- Change Details (Expandable) -->
              <div
                v-if="expandedChanges.has(change.id)"
                class="mt-4 border-t pt-4"
              >
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <!-- Before -->
                  <div>
                    <div class="mb-2 flex items-center gap-2">
                      <Minus class="h-4 w-4 text-red-500" />
                      <span class="text-sm font-medium text-red-700"
                        >Before</span
                      >
                    </div>
                    <div class="rounded-lg border border-red-200 bg-red-50 p-3">
                      <pre
                        class="whitespace-pre-wrap font-mono text-sm text-red-800"
                        >{{ change.oldValue || 'N/A' }}</pre
                      >
                    </div>
                  </div>

                  <!-- After -->
                  <div>
                    <div class="mb-2 flex items-center gap-2">
                      <Plus class="h-4 w-4 text-green-500" />
                      <span class="text-sm font-medium text-green-700"
                        >After</span
                      >
                    </div>
                    <div
                      class="rounded-lg border border-green-200 bg-green-50 p-3"
                    >
                      <pre
                        class="whitespace-pre-wrap font-mono text-sm text-green-800"
                        >{{ change.newValue || 'N/A' }}</pre
                      >
                    </div>
                  </div>
                </div>

                <!-- Diff View Toggle -->
                <div class="mt-4 flex justify-center">
                  <button
                    @click="showDiffView(change)"
                    class="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <GitCompare class="h-4 w-4" />
                    View Detailed Diff
                  </button>
                </div>
              </div>

              <!-- Quick Preview for collapsed state -->
              <div v-else class="text-sm text-gray-600">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1">
                    <span class="text-red-600">-</span>
                    <span class="max-w-xs truncate">{{
                      truncateText(change.oldValue, 50)
                    }}</span>
                  </div>
                  <ArrowRight class="h-4 w-4 text-gray-400" />
                  <div class="flex items-center gap-1">
                    <span class="text-green-600">+</span>
                    <span class="max-w-xs truncate">{{
                      truncateText(change.newValue, 50)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredChanges.length === 0" class="py-12 text-center">
          <History class="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 class="mb-2 text-lg font-medium text-gray-900">
            No changes found
          </h3>
          <p class="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-6 flex justify-center">
          <div class="flex items-center gap-2">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span class="px-4 py-2 text-sm text-gray-600">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Diff View Modal -->
    <TaxRuleDiffModal
      v-if="showDiffModal"
      :change="selectedChange"
      @close="showDiffModal = false"
    />

    <!-- Modal Footer -->
    <div class="border-t bg-gray-50 px-6 py-4">
      <div class="flex w-full items-center justify-end">
        <button
          @click="$emit('close')"
          class="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  Search,
  Download,
  History,
  Plus,
  Minus,
  Edit,
  Trash2,
  ChevronDown,
  ArrowRight,
  GitCompare,
} from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import type { TaxRuleChangeLog } from '#/api/configuration/tax-rules';
import {
  getTaxRuleChangeLog,
  getAllTaxRuleChangeLogs,
} from '#/api/configuration/tax-rules';
import TaxRuleDiffModal from './TaxRuleDiffModal.vue';

interface Props {
  sectionId?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  sectionId: null,
});

defineEmits<{
  close: [];
  cancel: [];
  confirm: [];
}>();

// State
const loading = ref(false);
const changes = ref<TaxRuleChangeLog[]>([]);
const searchQuery = ref('');
const filterChangeType = ref('');
const filterDateFrom = ref('');
const filterDateTo = ref('');
const expandedChanges = ref(new Set<string>());
const currentPage = ref(1);
const pageSize = ref(20);
const totalChanges = ref(0);
const showDiffModal = ref(false);
const selectedChange = ref<TaxRuleChangeLog | null>(null);

// Computed
const filteredChanges = computed(() => {
  return changes.value.filter((change) => {
    const matchesSearch =
      change.fieldChanged
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      change.reason.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      change.changedBy.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesType =
      !filterChangeType.value || change.changeType === filterChangeType.value;

    const changeDate = new Date(change.changedAt).toISOString().split('T')[0];
    const matchesDateFrom =
      !filterDateFrom.value || changeDate >= filterDateFrom.value;
    const matchesDateTo =
      !filterDateTo.value || changeDate <= filterDateTo.value;

    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
  });
});

const totalPages = computed(() =>
  Math.ceil(totalChanges.value / pageSize.value),
);

// Methods
const loadChanges = async () => {
  try {
    loading.value = true;

    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      dateFrom: filterDateFrom.value || undefined,
      dateTo: filterDateTo.value || undefined,
    };

    const response = await (props.sectionId
      ? getTaxRuleChangeLog(props.sectionId, params)
      : getAllTaxRuleChangeLogs(params));

    changes.value = response.changes;
    totalChanges.value = response.total;
  } catch (error) {
    message.error('Failed to load change log');
    console.error('Error loading changes:', error);
  } finally {
    loading.value = false;
  }
};

const toggleChangeDetails = (changeId: string) => {
  if (expandedChanges.value.has(changeId)) {
    expandedChanges.value.delete(changeId);
  } else {
    expandedChanges.value.add(changeId);
  }
};

const showDiffView = (change: TaxRuleChangeLog) => {
  selectedChange.value = change;
  showDiffModal.value = true;
};

const getChangeTypeClass = (type: string) => {
  const classes = {
    create: 'bg-green-100 text-green-600',
    update: 'bg-blue-100 text-blue-600',
    delete: 'bg-red-100 text-red-600',
  };
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-600';
};

const getChangeTypeBadgeClass = (type: string) => {
  const classes = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
  };
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

const getChangeTypeIcon = (type: string) => {
  const icons = {
    create: Plus,
    update: Edit,
    delete: Trash2,
  };
  return icons[type as keyof typeof icons] || Edit;
};

const truncateText = (text: string, maxLength: number) => {
  if (!text) return 'N/A';
  return text.length > maxLength
    ? `${text.slice(0, Math.max(0, maxLength))}...`
    : text;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const exportChangeLog = () => {
  // Implementation for exporting change log
  message.info('Export functionality will be implemented');
};

// Watchers
watch([currentPage, filterDateFrom, filterDateTo], () => {
  loadChanges();
});

// Lifecycle
onMounted(() => {
  loadChanges();
});
</script>
