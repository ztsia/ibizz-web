<template>
  <div>
    <!-- Diff Controls -->
    <div class="border-b bg-gray-50 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">View Mode:</span>
            <div class="flex rounded-lg border bg-white p-1">
              <button
                @click="viewMode = 'side-by-side'"
                class="rounded px-3 py-1 text-sm transition-colors"
                :class="
                  viewMode === 'side-by-side'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                "
              >
                Side by Side
              </button>
              <button
                @click="viewMode = 'unified'"
                class="rounded px-3 py-1 text-sm transition-colors"
                :class="
                  viewMode === 'unified'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                "
              >
                Unified
              </button>
              <button
                @click="viewMode = 'split'"
                class="rounded px-3 py-1 text-sm transition-colors"
                :class="
                  viewMode === 'split'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                "
              >
                Split
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              id="show-whitespace"
              v-model="showWhitespace"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="show-whitespace" class="text-sm text-gray-700"
              >Show whitespace</label
            >
          </div>

          <div class="flex items-center gap-2">
            <input
              id="word-wrap"
              v-model="wordWrap"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="word-wrap" class="text-sm text-gray-700"
              >Word wrap</label
            >
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="copyDiff"
            class="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
          >
            <Copy class="h-4 w-4" />
            Copy Diff
          </button>
          <button
            @click="downloadDiff"
            class="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Download class="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>

    <!-- Change Info -->
    <div class="border-b bg-blue-50 p-4">
      <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <div>
          <span class="text-gray-600">Change Type:</span>
          <span class="ml-2 font-medium capitalize">{{
            change?.changeType
          }}</span>
        </div>
        <div>
          <span class="text-gray-600">Version:</span>
          <span class="ml-2 font-medium">{{ change?.version }}</span>
        </div>
        <div>
          <span class="text-gray-600">Changed By:</span>
          <span class="ml-2 font-medium">{{ change?.changedBy }}</span>
        </div>
        <div>
          <span class="text-gray-600">Date:</span>
          <span class="ml-2 font-medium">{{
            formatDate(change?.changedAt || '')
          }}</span>
        </div>
      </div>
      <div class="mt-2">
        <span class="text-gray-600">Reason:</span>
        <span class="ml-2 text-gray-900">{{ change?.reason }}</span>
      </div>
    </div>

    <!-- Diff Content -->
    <div class="max-h-[60vh] flex-1 overflow-hidden">
      <!-- Side by Side View -->
      <div v-if="viewMode === 'side-by-side'" class="flex h-full">
        <div class="flex-1 border-r">
          <div class="flex items-center gap-2 border-b bg-red-50 px-4 py-2">
            <Minus class="h-4 w-4 text-red-600" />
            <span class="text-sm font-medium text-red-700">Before</span>
            <span class="text-xs text-red-600"
              >({{ getLineCount(change?.oldValue || '') }} lines)</span
            >
          </div>
          <div class="h-[calc(90vh-300px)] overflow-auto">
            <pre
              class="p-4 font-mono text-sm leading-relaxed"
              :class="{
                'whitespace-pre-wrap': wordWrap,
                'whitespace-pre': !wordWrap,
              }"
              v-html="formatContent(change?.oldValue || '', 'removed')"
            ></pre>
          </div>
        </div>

        <div class="flex-1">
          <div class="flex items-center gap-2 border-b bg-green-50 px-4 py-2">
            <Plus class="h-4 w-4 text-green-600" />
            <span class="text-sm font-medium text-green-700">After</span>
            <span class="text-xs text-green-600"
              >({{ getLineCount(change?.newValue || '') }} lines)</span
            >
          </div>
          <div class="h-[calc(90vh-300px)] overflow-auto">
            <pre
              class="p-4 font-mono text-sm leading-relaxed"
              :class="{
                'whitespace-pre-wrap': wordWrap,
                'whitespace-pre': !wordWrap,
              }"
              v-html="formatContent(change?.newValue || '', 'added')"
            ></pre>
          </div>
        </div>
      </div>

      <!-- Unified View -->
      <div v-else-if="viewMode === 'unified'" class="h-full">
        <div class="flex items-center gap-2 border-b bg-gray-50 px-4 py-2">
          <GitCompare class="h-4 w-4 text-gray-600" />
          <span class="text-sm font-medium text-gray-700">Unified Diff</span>
          <span class="text-xs text-gray-600"
            >({{ unifiedDiff.length }} lines)</span
          >
        </div>
        <div class="h-[calc(90vh-300px)] overflow-auto">
          <div class="font-mono text-sm">
            <div
              v-for="(line, index) in unifiedDiff"
              :key="index"
              class="flex hover:bg-gray-50"
              :class="getUnifiedLineClass(line)"
            >
              <span
                class="w-12 flex-shrink-0 border-r bg-gray-50 px-2 py-1 text-right text-gray-400"
              >
                {{ index + 1 }}
              </span>
              <span
                class="w-8 flex-shrink-0 py-1 text-center"
                :class="getUnifiedPrefixClass(line)"
              >
                {{ getUnifiedPrefix(line) }}
              </span>
              <span
                class="flex-1 px-2 py-1"
                :class="{
                  'whitespace-pre-wrap': wordWrap,
                  'whitespace-pre': !wordWrap,
                }"
                v-html="formatUnifiedContent(line)"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Split View -->
      <div v-else class="h-full">
        <div class="border-b bg-gray-50 px-4 py-2">
          <span class="text-sm font-medium text-gray-700"
            >Character-level Diff</span
          >
        </div>
        <div class="h-[calc(90vh-300px)] overflow-auto p-4">
          <div
            class="text-sm leading-relaxed"
            :class="{
              'whitespace-pre-wrap': wordWrap,
              'whitespace-pre': !wordWrap,
            }"
            v-html="characterDiff"
          ></div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="border-t bg-gray-50 px-6 py-3">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center gap-6">
          <span>{{ getStatistics().additions }} additions</span>
          <span>{{ getStatistics().deletions }} deletions</span>
          <span>{{ getStatistics().changes }} changes</span>
        </div>
        <div>Size: {{ formatBytes(getContentSize()) }}</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t bg-white px-6 py-4">
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
import { ref, computed } from 'vue';
import { Copy, Download, Plus, Minus, GitCompare } from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import type { TaxRuleChangeLog } from '#/api/configuration/tax-rules';

interface Props {
  change: TaxRuleChangeLog | null;
}

interface UnifiedDiffLine {
  type: 'context' | 'removed' | 'added' | 'header';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

const props = defineProps<Props>();
defineEmits<{
  close: [];
  cancel: [];
  confirm: [];
}>();

// State
const viewMode = ref<'side-by-side' | 'unified' | 'split'>('side-by-side');
const showWhitespace = ref(false);
const wordWrap = ref(true);

// Computed
const unifiedDiff = computed(() => {
  if (!props.change) return [];
  return generateUnifiedDiff(
    props.change.oldValue || '',
    props.change.newValue || '',
  );
});

const characterDiff = computed(() => {
  if (!props.change) return '';
  return generateCharacterDiff(
    props.change.oldValue || '',
    props.change.newValue || '',
  );
});

// Methods
const generateUnifiedDiff = (
  oldText: string,
  newText: string,
): UnifiedDiffLine[] => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result: UnifiedDiffLine[] = [];

  // Simple diff algorithm
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex];
    const newLine = newLines[newIndex];

    if (oldIndex >= oldLines.length) {
      // Only new lines remaining
      result.push({
        type: 'added',
        content: newLine,
        newLineNumber: newIndex + 1,
      });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      // Only old lines remaining
      result.push({
        type: 'removed',
        content: oldLine,
        oldLineNumber: oldIndex + 1,
      });
      oldIndex++;
    } else if (oldLine === newLine) {
      // Lines are the same
      result.push({
        type: 'context',
        content: oldLine,
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1,
      });
      oldIndex++;
      newIndex++;
    } else {
      // Lines are different
      result.push(
        {
          type: 'removed',
          content: oldLine,
          oldLineNumber: oldIndex + 1,
        },
        {
          type: 'added',
          content: newLine,
          newLineNumber: newIndex + 1,
        },
      );
      oldIndex++;
      newIndex++;
    }
  }

  return result;
};

const generateCharacterDiff = (oldText: string, newText: string): string => {
  // Simple character-level diff
  const oldChars = [...oldText];
  const newChars = [...newText];
  let result = '';

  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldChars.length || newIndex < newChars.length) {
    const oldChar = oldChars[oldIndex];
    const newChar = newChars[newIndex];

    if (oldIndex >= oldChars.length) {
      result += `<span class="bg-green-200 text-green-800">${escapeHtml(newChar)}</span>`;
      newIndex++;
    } else if (newIndex >= newChars.length) {
      result += `<span class="bg-red-200 text-red-800">${escapeHtml(oldChar)}</span>`;
      oldIndex++;
    } else if (oldChar === newChar) {
      result += escapeHtml(oldChar);
      oldIndex++;
      newIndex++;
    } else {
      result += `<span class="bg-red-200 text-red-800">${escapeHtml(oldChar)}</span>`;
      result += `<span class="bg-green-200 text-green-800">${escapeHtml(newChar)}</span>`;
      oldIndex++;
      newIndex++;
    }
  }

  return result;
};

const formatContent = (content: string, _type: 'removed' | 'added') => {
  let formatted = escapeHtml(content);

  if (showWhitespace.value) {
    formatted = formatted.replaceAll(' ', '·').replaceAll('\t', '→   ');
  }

  return formatted;
};

const formatUnifiedContent = (line: UnifiedDiffLine) => {
  let content = escapeHtml(line.content);

  if (showWhitespace.value) {
    content = content.replaceAll(' ', '·').replaceAll('\t', '→   ');
  }

  return content;
};

const getUnifiedLineClass = (line: UnifiedDiffLine) => {
  const classes = {
    context: '',
    removed: 'bg-red-50',
    added: 'bg-green-50',
    header: 'bg-gray-100',
  };
  return classes[line.type];
};

const getUnifiedPrefixClass = (line: UnifiedDiffLine) => {
  const classes = {
    context: 'text-gray-400',
    removed: 'text-red-600 bg-red-100',
    added: 'text-green-600 bg-green-100',
    header: 'text-gray-600',
  };
  return classes[line.type];
};

const getUnifiedPrefix = (line: UnifiedDiffLine) => {
  const prefixes = {
    context: ' ',
    removed: '-',
    added: '+',
    header: '@',
  };
  return prefixes[line.type];
};

const getLineCount = (content: string) => {
  return content.split('\n').length;
};

const getStatistics = () => {
  if (!props.change) {
    return { additions: 0, deletions: 0, changes: 0 };
  }

  const oldLines = (props.change.oldValue || '').split('\n');
  const newLines = (props.change.newValue || '').split('\n');

  let additions = 0;
  let deletions = 0;
  let changes = 0;

  const maxLines = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === undefined) {
      additions++;
    } else if (newLine === undefined) {
      deletions++;
    } else if (oldLine !== newLine) {
      changes++;
    }
  }

  return { additions, deletions, changes };
};

const getContentSize = () => {
  if (!props.change) return 0;
  const oldSize = (props.change.oldValue || '').length;
  const newSize = (props.change.newValue || '').length;
  return Math.max(oldSize, newSize);
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
};

const escapeHtml = (text: string) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const copyDiff = async () => {
  if (!props.change) return;

  const diffText = `--- Before\n${props.change.oldValue || ''}\n+++ After\n${props.change.newValue || ''}`;

  try {
    await navigator.clipboard.writeText(diffText);
    message.success('Diff copied to clipboard');
  } catch {
    message.error('Failed to copy diff');
  }
};

const downloadDiff = () => {
  if (!props.change) return;

  const diffText = `--- Before\n${props.change.oldValue || ''}\n+++ After\n${props.change.newValue || ''}`;
  const blob = new Blob([diffText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `diff-${props.change.fieldChanged}-${props.change.version}.txt`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};
</script>
