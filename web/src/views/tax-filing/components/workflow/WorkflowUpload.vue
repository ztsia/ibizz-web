<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { Card, Button, Upload, Tag } from 'ant-design-vue';
import SharedTimeline from '../shared/SharedTimeline.vue';
import WorkflowDisabledOverlay from './shared/WorkflowDisabledOverlay.vue';
import { useTaxFilingStore } from '#/store/tax-filing';
import type { TimelineStep, TimelineConfig } from '../../types';
import type {
  WorkflowUploadProps as Props,
  WorkflowUploadEmits as Emits,
} from '../../types/workflow-types';

const { Dragger } = Upload;

const props = withDefaults(defineProps<Props>(), {
  uploadedFiles: () => [],
  disabled: false,
});

const emit = defineEmits<Emits>();
const taxFilingStore = useTaxFilingStore();

// Use store state instead of local state
const localUploadedFiles = computed(() => taxFilingStore.uploadedFiles);
const showTimeline = ref(true);
const timelineCompleted = ref(false);

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Upload Coordinator Assignment',
    description: 'Assigning document handler and validation agents',
    details: ['Document Handler Agent assigned', 'Validation Agent activated'],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying document handler and validation agents',
    details: [
      'Document Handler Agent deployed',
      'Validation Agent synchronized',
    ],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Upload Interface Preparation',
    description: 'Preparing upload interface and validation systems',
    details: [
      'Upload interface initialized',
      'Security protocols activated',
      'File validation ready',
    ],
    hasProgress: true,
    progressKey: 'preparation',
  },
  {
    id: 4,
    title: 'Upload System Ready',
    description: 'Document upload system ready for file processing',
    details: ['Upload system fully operational', 'Ready to receive documents'],
  },
];

const timelineConfig: TimelineConfig = {
  stepTimings: [500, 1000, 2500, 3500],
  progressConfigs: {
    deployment: { increment: 25, interval: 100 },
    preparation: { increment: 10, interval: 250 },
  },
  autoCollapseDelay: 2000,
};

// Get basic file details without AI analysis
const getFileDetails = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'xlsx' || ext === 'xls') {
    return {
      format: 'Excel Spreadsheet',
    };
  }

  if (ext === 'pdf') {
    return {
      format: 'PDF Document',
    };
  }

  return {
    format: 'Document',
  };
};

// File upload handler
const handleFileUpload = (info: any) => {
  if (props.disabled) return;

  const { fileList } = info;
  const newFiles = fileList.map((file: any) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'done',
    file: file.originFileObj || file,
  }));

  // If no files exist, replace; otherwise, add to existing files
  if (localUploadedFiles.value.length === 0) {
    taxFilingStore.setUploadedFiles(newFiles);
  } else {
    // Add only new files that don't already exist
    const existingFileNames = new Set(
      localUploadedFiles.value.map((f) => f.name),
    );
    const uniqueNewFiles = newFiles.filter(
      (file) => !existingFileNames.has(file.name),
    );
    taxFilingStore.setUploadedFiles([
      ...localUploadedFiles.value,
      ...uniqueNewFiles,
    ]);
  }

  emit('step-loaded');
  emit('file-upload', localUploadedFiles.value);
};

// Handle timeline completion
const handleTimelineCompleted = () => {
  timelineCompleted.value = true;
  emit('step-loaded');
};

// Handle step shown
const handleStepShown = () => {
  emit('step-loaded');
};

// Remove file
const removeFile = (index: number) => {
  if (props.disabled) return;
  taxFilingStore.removeUploadedFile(index);
  emit('file-upload', localUploadedFiles.value);
};

// Complete step
const completeStep = () => {
  if (props.disabled) return;
  emit('step-complete', { files: localUploadedFiles.value });
};

// Clear uploaded files when component mounts
onMounted(() => {
  taxFilingStore.setUploadedFiles([]);
});

// Watch for changes in uploaded files from props and sync with store
watch(
  () => props.uploadedFiles,
  (newFiles) => {
    if (newFiles && newFiles.length > 0) {
      taxFilingStore.setUploadedFiles([...newFiles]);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div :class="{ 'pointer-events-none relative opacity-60': props.disabled }">
    <!-- Step-specific timeline -->
    <SharedTimeline
      v-if="showTimeline"
      title="Document Upload Timeline"
      color-theme="blue"
      :steps="timelineSteps"
      :config="timelineConfig"
      @completed="handleTimelineCompleted"
      @step-shown="handleStepShown"
      class="mb-8"
    />

    <!-- Enhanced Card with modern styling -->
    <Card
      v-if="timelineCompleted"
      class="rounded-xl border shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <!-- Enhanced Upload Area - Only show when no files uploaded -->
      <div v-if="localUploadedFiles.length === 0" class="mb-6">
        <Dragger
          :multiple="false"
          :before-upload="() => false"
          :disabled="props.disabled"
          @change="handleFileUpload"
          class="transition-all duration-300"
        >
          <div class="px-6 py-8">
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center"
            >
              <UploadOutlined class="text-2xl" />
            </div>
            <h3 class="mb-2 text-lg font-semibold">Upload Tax Document</h3>
            <p class="mb-3">Drag & drop a file here or click to browse</p>

            <!-- Document Guidelines -->
            <div class="mb-4 rounded-lg border border-blue-200 p-4">
              <h4 class="mb-2 flex items-center gap-2 text-sm font-medium">
                <svg
                  class="h-4 w-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
                Document Guidelines
              </h4>
              <div class="space-y-2 text-xs">
                <div class="flex items-start gap-2">
                  <span class="font-bold text-green-500">✓</span>
                  <span
                    >Financial statements (Income Statement, Balance Sheet, Cash
                    Flow)</span
                  >
                </div>
                <div class="flex items-start gap-2">
                  <span class="font-bold text-green-500">✓</span>
                  <span>Tax forms (1120, 1065, 1040, Schedule K-1, etc.)</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="font-bold text-green-500">✓</span>
                  <span
                    >Supporting documents (receipts, invoices, bank
                    statements)</span
                  >
                </div>
                <div class="flex items-start gap-2">
                  <span class="font-bold text-amber-500">!</span>
                  <span
                    >Ensure documents are clear and readable (min 300 DPI for
                    scanned files)</span
                  >
                </div>
                <div class="flex items-start gap-2">
                  <span class="font-bold text-amber-500">!</span>
                  <span>File size should not exceed 10MB per document</span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap justify-center gap-2 text-xs">
              <span class="rounded border px-2 py-1">PDF</span>
              <span class="rounded border px-2 py-1">Excel</span>
              <span class="rounded border px-2 py-1">Word</span>
              <span class="rounded border px-2 py-1">Images (JPG, PNG)</span>
            </div>
          </div>
        </Dragger>
      </div>

      <!-- Enhanced File List - Replaces upload area when files are uploaded -->
      <div v-if="localUploadedFiles.length > 0" class="space-y-6">
        <div class="pt-6">
          <div class="mb-4 flex items-center justify-between">
            <h4 class="flex items-center gap-2 text-lg font-semibold">
              <div class="flex h-6 w-6 items-center justify-center">
                <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              Uploaded Document
            </h4>
            <span class="px-3 py-1 text-sm font-medium">
              {{ localUploadedFiles.length }} file{{
                localUploadedFiles.length !== 1 ? 's' : ''
              }}
            </span>
          </div>

          <div class="grid gap-3">
            <div
              v-for="(file, index) in localUploadedFiles"
              :key="index"
              class="flex items-center justify-between p-4 transition-colors"
            >
              <div class="flex flex-1 items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <h5 class="truncate font-medium">{{ file.name }}</h5>
                  <p class="text-sm">
                    {{ (file.size / 1024).toFixed(1) }} KB •
                    {{ getFileDetails(file.name).format }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Tag color="success" class="font-medium"> ✓ Uploaded </Tag>
                <button
                  @click="removeFile(index)"
                  class="p-1 transition-colors"
                  title="Remove file"
                >
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center border-t pt-4">
          <Button
            type="primary"
            size="large"
            :disabled="props.disabled"
            @click="completeStep"
            class="h-auto px-8 py-2 font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <span class="flex items-center gap-2">
              Continue to Classification
            </span>
          </Button>
        </div>
      </div>
    </Card>

    <!-- Disabled overlay -->
    <WorkflowDisabledOverlay :disabled="props.disabled" />
  </div>
</template>

<style scoped>
/* All styling now handled by Tailwind classes */
</style>
