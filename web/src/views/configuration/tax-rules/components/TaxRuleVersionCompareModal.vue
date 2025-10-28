<template>
  <div>
    <!-- Version Selection -->
    <div class="border-b bg-gray-50 p-6">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">From Version:</label>
          <select
            v-model="fromVersion"
            class="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option
              v-for="version in availableVersions"
              :key="version"
              :value="version"
            >
              Version {{ version }}
            </option>
          </select>
        </div>

        <ArrowRight class="h-5 w-5 text-gray-400" />

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">To Version:</label>
          <select
            v-model="toVersion"
            class="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option
              v-for="version in availableVersions"
              :key="version"
              :value="version"
            >
              Version {{ version }}
            </option>
          </select>
        </div>

        <button
          @click="loadComparison"
          :disabled="loading || fromVersion === toVersion"
          class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GitCompare class="h-4 w-4" />
          Compare
        </button>

        <div class="flex-1"></div>

        <div class="flex items-center gap-2">
          <button
            @click="toggleViewMode"
            class="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50"
          >
            <Columns v-if="viewMode === 'side-by-side'" class="h-4 w-4" />
            <Rows v-else class="h-4 w-4" />
            {{ viewMode === 'side-by-side' ? 'Unified' : 'Side-by-Side' }}
          </button>

          <button
            @click="exportComparison"
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

    <!-- Comparison Content -->
    <div v-else-if="comparisonData" class="max-h-[70vh] flex-1 overflow-y-auto">
      <!-- Summary -->
      <div class="border-b bg-blue-50 p-6">
        <h3 class="mb-3 font-medium text-gray-900">Comparison Summary</h3>
        <div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div class="rounded-lg bg-white p-3">
            <div class="text-gray-600">Total Changes</div>
            <div class="text-2xl font-bold text-blue-600">
              {{ comparisonData.differences.length }}
            </div>
          </div>
          <div class="rounded-lg bg-white p-3">
            <div class="text-gray-600">From Version</div>
            <div class="text-lg font-semibold">v{{ fromVersion }}</div>
            <div class="text-xs text-gray-500">
              {{ formatDate(comparisonData.from.lastModified) }}
            </div>
          </div>
          <div class="rounded-lg bg-white p-3">
            <div class="text-gray-600">To Version</div>
            <div class="text-lg font-semibold">v{{ toVersion }}</div>
            <div class="text-xs text-gray-500">
              {{ formatDate(comparisonData.to.lastModified) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Differences List -->
      <div class="p-6">
        <div
          v-if="comparisonData.differences.length === 0"
          class="py-12 text-center"
        >
          <CheckCircle class="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h3 class="mb-2 text-lg font-medium text-gray-900">
            No Differences Found
          </h3>
          <p class="text-gray-600">The selected versions are identical.</p>
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="(diff, index) in comparisonData.differences"
            :key="index"
            class="overflow-hidden rounded-lg border bg-white"
          >
            <!-- Difference Header -->
            <div class="border-b bg-gray-50 px-4 py-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100"
                  >
                    <Edit class="h-3 w-3 text-blue-600" />
                  </div>
                  <span class="font-medium text-gray-900">{{
                    diff.field
                  }}</span>
                </div>
                <button
                  @click="toggleDiffExpansion(index)"
                  class="rounded p-1 hover:bg-gray-200"
                >
                  <ChevronDown
                    class="h-4 w-4 text-gray-500 transition-transform"
                    :class="{ 'rotate-180': expandedDiffs.has(index) }"
                  />
                </button>
              </div>
            </div>

            <!-- Difference Content -->
            <div v-if="expandedDiffs.has(index)" class="p-4">
              <!-- Side-by-Side View -->
              <div
                v-if="viewMode === 'side-by-side'"
                class="grid grid-cols-2 gap-4"
              >
                <!-- Old Version -->
                <div>
                  <div class="mb-2 flex items-center gap-2">
                    <Minus class="h-4 w-4 text-red-500" />
                    <span class="text-sm font-medium text-red-700"
                      >Version {{ fromVersion }}</span
                    >
                  </div>
                  <div
                    class="max-h-96 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3"
                  >
                    <pre
                      class="whitespace-pre-wrap font-mono text-sm text-red-800"
                      >{{ diff.oldValue || 'N/A' }}</pre
                    >
                  </div>
                </div>

                <!-- New Version -->
                <div>
                  <div class="mb-2 flex items-center gap-2">
                    <Plus class="h-4 w-4 text-green-500" />
                    <span class="text-sm font-medium text-green-700"
                      >Version {{ toVersion }}</span
                    >
                  </div>
                  <div
                    class="max-h-96 overflow-y-auto rounded-lg border border-green-200 bg-green-50 p-3"
                  >
                    <pre
                      class="whitespace-pre-wrap font-mono text-sm text-green-800"
                      >{{ diff.newValue || 'N/A' }}</pre
                    >
                  </div>
                </div>
              </div>

              <!-- Unified View -->
              <div v-else class="space-y-4">
                <div class="rounded-lg bg-gray-50 p-4">
                  <div class="mb-2 text-sm font-medium text-gray-700">
                    Unified Diff View
                  </div>
                  <div
                    class="max-h-96 overflow-y-auto rounded border bg-white p-3"
                  >
                    <div class="space-y-1 font-mono text-sm">
                      <div
                        v-for="(line, lineIndex) in getUnifiedDiff(
                          diff.oldValue,
                          diff.newValue,
                        )"
                        :key="lineIndex"
                        class="flex"
                        :class="getUnifiedDiffLineClass(line)"
                      >
                        <span
                          class="mr-2 w-8 flex-shrink-0 text-right text-gray-400"
                          >{{ lineIndex + 1 }}</span
                        >
                        <span class="flex-1">{{ line.content }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Word-level Diff for smaller changes -->
              <div
                v-if="isSmallChange(diff.oldValue, diff.newValue)"
                class="mt-4"
              >
                <div class="mb-2 text-sm font-medium text-gray-700">
                  Word-level Changes
                </div>
                <div class="rounded-lg bg-gray-50 p-3">
                  <div
                    class="text-sm"
                    v-html="getWordLevelDiff(diff.oldValue, diff.newValue)"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Collapsed Preview -->
            <div v-else class="p-4">
              <div class="text-sm text-gray-600">
                <span class="text-red-600">{{
                  getChangePreview(diff.oldValue, 'removed')
                }}</span>
                <ArrowRight class="mx-2 inline h-4 w-4 text-gray-400" />
                <span class="text-green-600">{{
                  getChangePreview(diff.newValue, 'added')
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-12">
      <GitCompare class="mb-4 h-12 w-12 text-gray-400" />
      <h3 class="mb-2 text-lg font-medium text-gray-900">
        Select Versions to Compare
      </h3>
      <p class="text-gray-600">
        Choose two different versions to see the changes.
      </p>
    </div>

    <!-- Modal Footer -->
    <div class="border-t bg-gray-50 p-6">
      <div class="flex w-full items-center justify-between">
        <div class="text-sm text-gray-600">
          {{
            comparisonData
              ? `Showing ${comparisonData.differences.length} differences`
              : 'No comparison loaded'
          }}
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="comparisonData && fromVersion > 1"
            @click="revertToVersion"
            class="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
          >
            <RotateCcw class="h-4 w-4" />
            Revert to v{{ fromVersion }}
          </button>
          <button
            @click="$emit('close')"
            class="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  GitCompare,
  ArrowRight,
  Download,
  Columns,
  Rows,
  Edit,
  Plus,
  Minus,
  ChevronDown,
  CheckCircle,
  RotateCcw,
} from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import type { TaxRuleSection } from '#/api/configuration/tax-rules';
import {
  compareTaxRuleVersions,
  revertTaxRuleSection,
} from '#/api/configuration/tax-rules';

interface Props {
  section: TaxRuleSection | null;
}

interface ComparisonData {
  from: TaxRuleSection;
  to: TaxRuleSection;
  differences: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

interface UnifiedDiffLine {
  type: 'context' | 'removed' | 'added';
  content: string;
}

const props = defineProps<Props>();
defineEmits<{
  close: [];
  cancel: [];
  confirm: [];
}>();

// State
const loading = ref(false);
const fromVersion = ref(1);
const toVersion = ref(1);
const viewMode = ref<'side-by-side' | 'unified'>('side-by-side');
const comparisonData = ref<ComparisonData | null>(null);
const expandedDiffs = ref(new Set<number>());

// Computed
const availableVersions = computed(() => {
  if (!props.section) return [];
  return Array.from({ length: props.section.version }, (_, i) => i + 1);
});

// Methods
const loadComparison = async () => {
  if (!props.section || fromVersion.value === toVersion.value) return;

  try {
    loading.value = true;
    const response = await compareTaxRuleVersions(
      props.section.id,
      fromVersion.value,
      toVersion.value,
    );
    comparisonData.value = response;

    // Auto-expand first few differences
    expandedDiffs.value.clear();
    for (let i = 0; i < Math.min(3, response.differences.length); i++) {
      expandedDiffs.value.add(i);
    }
  } catch (error) {
    message.error('Failed to load version comparison');
    console.error('Error loading comparison:', error);
  } finally {
    loading.value = false;
  }
};

const toggleDiffExpansion = (index: number) => {
  if (expandedDiffs.value.has(index)) {
    expandedDiffs.value.delete(index);
  } else {
    expandedDiffs.value.add(index);
  }
};

const toggleViewMode = () => {
  viewMode.value =
    viewMode.value === 'side-by-side' ? 'unified' : 'side-by-side';
};

const getUnifiedDiff = (
  oldValue: string,
  newValue: string,
): UnifiedDiffLine[] => {
  // Simple unified diff implementation
  const oldLines = (oldValue || '').split('\n');
  const newLines = (newValue || '').split('\n');
  const result: UnifiedDiffLine[] = [];

  const maxLines = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      result.push({ type: 'context', content: oldLine || '' });
    } else {
      if (oldLine !== undefined) {
        result.push({ type: 'removed', content: oldLine });
      }
      if (newLine !== undefined) {
        result.push({ type: 'added', content: newLine });
      }
    }
  }

  return result;
};

const getUnifiedDiffLineClass = (line: UnifiedDiffLine) => {
  const classes = {
    context: 'text-gray-700',
    removed: 'bg-red-50 text-red-800',
    added: 'bg-green-50 text-green-800',
  };
  return classes[line.type];
};

const isSmallChange = (oldValue: string, newValue: string) => {
  const oldLength = (oldValue || '').length;
  const newLength = (newValue || '').length;
  return Math.max(oldLength, newLength) < 500;
};

const getWordLevelDiff = (oldValue: string, newValue: string) => {
  // Simple word-level diff highlighting
  const oldWords = (oldValue || '').split(/\s+/);
  const newWords = (newValue || '').split(/\s+/);

  let result = '';
  const maxWords = Math.max(oldWords.length, newWords.length);

  for (let i = 0; i < maxWords; i++) {
    const oldWord = oldWords[i];
    const newWord = newWords[i];

    if (oldWord === newWord) {
      result += `${oldWord} `;
    } else {
      if (oldWord !== undefined) {
        result += `<span class="bg-red-200 text-red-800 px-1 rounded">${oldWord}</span> `;
      }
      if (newWord !== undefined) {
        result += `<span class="bg-green-200 text-green-800 px-1 rounded">${newWord}</span> `;
      }
    }
  }

  return result.trim();
};

const getChangePreview = (value: string, type: 'added' | 'removed') => {
  if (!value) return type === 'removed' ? 'Removed' : 'Added';
  const preview = value.length > 100 ? `${value.slice(0, 100)}...` : value;
  return preview.replaceAll('\n', ' ');
};

const revertToVersion = async () => {
  if (!props.section || !comparisonData.value) return;

  const confirmed = confirm(
    `Are you sure you want to revert to version ${fromVersion.value}? This will create a new version with the old content.`,
  );

  if (!confirmed) return;

  try {
    const reason = prompt('Please provide a reason for reverting:');
    if (!reason) return;

    await revertTaxRuleSection(props.section.id, fromVersion.value, reason);
    message.success(`Successfully reverted to version ${fromVersion.value}`);
    // Optionally close modal or refresh data
  } catch (error) {
    message.error('Failed to revert to previous version');
    console.error('Error reverting version:', error);
  }
};

const exportComparison = () => {
  // Implementation for exporting comparison
  message.info('Export functionality will be implemented');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Initialize versions
onMounted(() => {
  if (props.section) {
    toVersion.value = props.section.version;
    fromVersion.value = Math.max(1, props.section.version - 1);
  }
});
</script>
