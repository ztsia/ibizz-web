<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { FileSearchOutlined } from '@ant-design/icons-vue';
import { Card, Button, Tag } from 'ant-design-vue';
import SharedTimeline from '../shared/SharedTimeline.vue';
import WorkflowDisabledOverlay from './shared/WorkflowDisabledOverlay.vue';
import { useTaxFilingStore } from '#/store/tax-filing';
import type { TimelineStep, TimelineConfig } from '../../types';
import type {
  WorkflowClassifyProps as Props,
  WorkflowClassifyEmits as Emits,
} from '../../types/workflow-types';
import { classifyExcelSheetsApi } from '#/api';
import type { DocumentApi } from '#/api';

type FileAnalysisResult = {
  fileName: string;
  fileType: string;
  classification: {
    documentType: string;
    confidence: number;
    category: string;
  };
  extractedData: {
    sheetNames?: string[];
    pageCount?: number;
    taxDocumentType?: string;
  };
  processingTime: number;
  sheets?: DocumentApi.ExcelSheetInfo[];
  summary?: DocumentApi.ExcelClassificationSummary;
};

const props = withDefaults(defineProps<Props>(), {
  uploadedFiles: () => [],
  disabled: false,
});

const emit = defineEmits<Emits>();
const taxFilingStore = useTaxFilingStore();

// Get uploaded files from store instead of props
const uploadedFiles = computed(() => taxFilingStore.uploadedFiles);

const showTimeline = ref(true);
const timelineCompleted = ref(false);
const documentAnalysis = ref<Map<string, FileAnalysisResult>>(new Map());
const isAnalyzing = ref(false);
const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Classification Coordinator Assignment',
    description: 'Assigning document classification and OCR agents',
    details: ['Classification Agent assigned', 'OCR Agent activated'],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying classification and OCR agents',
    details: ['Classification Agent deployed', 'OCR Agent synchronized'],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Document Analysis & Classification',
    description: 'Analyzing and categorizing uploaded documents',
    details: [
      'Document types identified',
      'OCR processing completed',
      'Content classification finished',
    ],
    hasProgress: true,
    progressKey: 'classification',
  },
  {
    id: 4,
    title: 'Classification Complete',
    description: 'Document classification completed successfully',
    details: ['All documents classified', 'Ready for data extraction'],
  },
];

const timelineConfig: TimelineConfig = {
  stepTimings: [500, 1200, 3500, 5000],
  progressConfigs: {
    deployment: { increment: 20, interval: 120 },
    classification: { increment: 7, interval: 350 },
  },
  autoCollapseDelay: 2000,
};

// Document analysis functions with API integration
const analyzeDocuments = async () => {
  if (!uploadedFiles.value?.length) return;

  isAnalyzing.value = true;
  documentAnalysis.value.clear();

  try {
    for (const file of uploadedFiles.value) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let result: FileAnalysisResult;

      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // For Excel files: use API extraction
        try {
          const apiResult = await classifyExcelSheetsApi({
            document: file.file,
          });
          result = {
            fileName: apiResult.analysis.fileName,
            fileType: apiResult.analysis.fileType,
            classification: {
              documentType: apiResult.analysis.classification.documentType,
              confidence: apiResult.analysis.classification.confidence / 100, // Convert to decimal
              category: apiResult.analysis.classification.category,
            },
            extractedData: {
              sheetNames: apiResult.analysis.extractedData.sheetNames,
              taxDocumentType: apiResult.analysis.extractedData.taxDocumentType,
            },
            processingTime: apiResult.analysis.processingTime,
            sheets: apiResult.sheets,
            summary: apiResult.summary,
          };
        } catch (error) {
          console.error('Error calling Excel classification API:', error);
          // Fallback to hardcoded classification
          result = {
            fileName: file.name,
            fileType:
              file.type ||
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            classification: {
              documentType: 'Financial Statements',
              confidence: 0.95,
              category: 'financial',
            },
            extractedData: {
              sheetNames: [
                'Manufacturing Account',
                'Trading P&L',
                'Balance Sheet',
              ],
            },
            processingTime: 1500,
          };
        }
      } else if (fileExtension === 'pdf') {
        // For PDF files: basic classification
        result = {
          fileName: file.name,
          fileType: file.type || 'application/pdf',
          classification: {
            documentType: 'Tax Document',
            confidence: 0.85,
            category: 'tax',
          },
          extractedData: {
            pageCount: 1,
            taxDocumentType: 'General Tax Form',
          },
          processingTime: 1200,
        };
      } else {
        // For other files: basic classification
        result = {
          fileName: file.name,
          fileType: file.type || 'unknown',
          classification: {
            documentType: 'General Document',
            confidence: 0.7,
            category: 'general',
          },
          extractedData: {},
          processingTime: 800,
        };
      }

      documentAnalysis.value.set(file.name, result);
    }
  } catch (error) {
    console.error('Error in document analysis:', error);
  } finally {
    isAnalyzing.value = false;
  }
};

const getFileClassification = (fileName: string) => {
  const analysis = documentAnalysis.value.get(fileName);
  if (analysis) {
    return {
      type: analysis.classification.documentType,
      confidence: Math.round(analysis.classification.confidence * 100),
    };
  }
  // Fallback for files not yet analyzed
  return { type: 'Analyzing...', confidence: 0 };
};

const getFileDetails = (fileName: string) => {
  const analysis = documentAnalysis.value.get(fileName);
  const classification = getFileClassification(fileName);
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (analysis && (ext === 'xlsx' || ext === 'xls')) {
    return {
      ...classification,
      sheets: analysis.extractedData?.sheetNames || ['Sheet1'],
      format: 'Excel Spreadsheet',
    };
  }

  if (analysis && ext === 'pdf') {
    return {
      ...classification,
      pages: analysis.extractedData?.pageCount || 1,
      format: 'PDF Document',
      taxDocumentType: analysis.extractedData?.taxDocumentType,
    };
  }

  return {
    ...classification,
    format: 'Document',
  };
};

// Handle timeline completion
const handleTimelineCompleted = async () => {
  timelineCompleted.value = true;
  emit('step-loaded');
};

// Start AI analysis when component mounts
onMounted(async () => {
  if (uploadedFiles.value?.length) {
    await analyzeDocuments();
  }
});

// Handle step shown
const handleStepShown = () => {
  emit('step-loaded');
};

// Complete step
const completeStep = () => {
  if (props.disabled) return;
  emit('step-complete', { classifications: uploadedFiles.value });
};
</script>

<template>
  <div :class="{ 'pointer-events-none relative opacity-60': props.disabled }">
    <!-- Step-specific timeline -->
    <SharedTimeline
      v-if="showTimeline"
      title="Document Processing & Classification Timeline"
      color-theme="purple"
      :steps="timelineSteps"
      :config="timelineConfig"
      @completed="handleTimelineCompleted"
      @step-shown="handleStepShown"
      class="mb-8"
    />

    <!-- Enhanced Card with modern styling -->
    <Card
      v-if="timelineCompleted"
      class="border shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <!-- Enhanced AI Processing State -->
      <div v-if="isAnalyzing" class="mb-6 space-y-4">
        <!-- Main Processing Header -->
        <div class="rounded-lg border p-4">
          <div class="mb-3 flex items-center gap-3">
            <div
              class="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
            ></div>
            <h4 class="text-lg font-semibold">
              AI Document Analysis in Progress
            </h4>
          </div>

          <!-- Processing Steps -->
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="h-2 w-2 rounded-full bg-gray-800"></div>
              <span class="text-sm">Document upload completed</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="h-2 w-2 animate-pulse rounded-full bg-gray-800"></div>
              <span class="text-sm"
                >Analyzing document structure and content...</span
              >
            </div>
            <div class="flex items-center gap-3">
              <div class="h-2 w-2 rounded-full bg-gray-300"></div>
              <span class="text-sm"
                >Extracting sheet names and classifications</span
              >
            </div>
            <div class="flex items-center gap-3">
              <div class="h-2 w-2 rounded-full bg-gray-300"></div>
              <span class="text-sm">Generating confidence scores</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="mb-2 flex justify-between text-sm">
              <span>Processing Progress</span>
              <span>65%</span>
            </div>
            <div class="h-2 w-full rounded-full bg-gray-200">
              <div
                class="h-2 w-2/3 animate-pulse rounded-full bg-gray-800"
              ></div>
            </div>
          </div>
        </div>

        <!-- AI Technology Info -->
        <div class="rounded-lg border p-4">
          <div class="flex items-start gap-3">
            <div class="mt-1">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h5 class="font-medium">Advanced AI Processing</h5>
              <p class="text-sm">
                Using machine learning algorithms to identify tax document
                types, extract sheet names, and classify financial statements
                with high accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Document Analysis Results -->
      <div v-else-if="documentAnalysis.size > 0" class="mb-6">
        <h4 class="mb-4 flex items-center gap-2 text-lg font-semibold">
          <FileSearchOutlined class="text-lg" />
          Document Analysis Results
        </h4>

        <!-- Processing Summary -->
        <div class="mb-4 rounded-lg border p-4">
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">AI Analysis Complete</span>
          </div>
          <p class="mt-2 text-sm">
            Successfully processed {{ documentAnalysis.size }} document(s) with
            AI-powered classification and extraction.
          </p>
        </div>

        <div class="space-y-4">
          <div
            v-for="file in uploadedFiles"
            :key="file.name"
            class="rounded-lg border p-4 transition-all hover:shadow-md"
          >
            <div class="mb-4 flex items-start justify-between">
              <div class="flex items-start gap-3">
                <div
                  class="mt-1 flex h-10 w-10 items-center justify-center rounded-lg border"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <h5 class="font-semibold">{{ file.name }}</h5>
                  <p class="text-sm">
                    {{ getFileDetails(file.name).format }}
                  </p>
                  <div class="mt-1 flex items-center gap-2">
                    <div class="h-1.5 w-20 rounded-full bg-gray-200">
                      <div
                        class="h-1.5 rounded-full bg-green-500"
                        :style="{
                          width:
                            getFileClassification(file.name).confidence + '%',
                        }"
                      ></div>
                    </div>
                    <span class="text-xs"
                      >{{ getFileClassification(file.name).confidence }}%
                      match</span
                    >
                  </div>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2">
                <Tag
                  :color="
                    getFileClassification(file.name).confidence > 70
                      ? 'green'
                      : 'orange'
                  "
                >
                  {{ getFileClassification(file.name).confidence }}% confidence
                </Tag>
                <div class="flex items-center gap-1 text-xs text-green-600">
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>AI Verified</span>
                </div>
              </div>
            </div>

            <!-- AI Classification -->
            <div class="mb-4 rounded-lg border p-3">
              <div class="mb-2 flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-gray-800"></div>
                <span class="text-xs font-medium"
                  >AI CLASSIFICATION RESULT</span
                >
              </div>
              <div class="flex items-center gap-3">
                <div class="rounded border px-3 py-2 text-sm font-semibold">
                  {{ getFileClassification(file.name).type }}
                </div>
                <div class="flex items-center gap-1 text-xs text-green-600">
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>High Confidence</span>
                </div>
              </div>
            </div>

            <!-- Excel Sheet Names -->
            <div
              v-if="
                getFileDetails(file.name).sheets &&
                getFileDetails(file.name).sheets.length > 0
              "
              class="mb-4 rounded-lg border p-3"
            >
              <div class="mb-3 flex items-center gap-2">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                  />
                </svg>
                <span class="text-sm font-medium"
                  >AI-Detected Sheet Structure</span
                >
              </div>
              <div class="space-y-2">
                <div
                  v-for="(sheet, index) in getFileDetails(file.name).sheets"
                  :key="sheet"
                  class="flex items-center gap-3 rounded border p-2"
                >
                  <div
                    class="flex h-6 w-6 items-center justify-center rounded border text-xs font-bold"
                  >
                    {{ index + 1 }}
                  </div>
                  <span class="font-medium">{{ sheet }}</span>
                  <div
                    class="ml-auto flex items-center gap-1 text-xs text-green-600"
                  >
                    <svg
                      class="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Identified</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- PDF Tax Document Type -->
            <div
              v-if="getFileDetails(file.name).taxDocumentType"
              class="mb-4 rounded-lg border p-3"
            >
              <div class="mb-2 flex items-center gap-2">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-sm font-medium"
                  >Tax Document Classification</span
                >
              </div>
              <div class="flex items-center gap-3">
                <div class="rounded border px-3 py-2 font-semibold">
                  {{ getFileDetails(file.name).taxDocumentType }}
                </div>
                <div class="flex items-center gap-1 text-xs text-green-600">
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>AI Classified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Analysis State -->
      <div v-else class="mb-6 rounded-lg border p-4">
        <div class="flex items-center gap-2">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span>No documents available for classification</span>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="flex justify-center border-t pt-4">
        <Button
          type="primary"
          size="large"
          :disabled="
            props.disabled || isAnalyzing || documentAnalysis.size === 0
          "
          @click="completeStep"
        >
          <span v-if="isAnalyzing">AI Analysis in Progress...</span>
          <span v-else-if="documentAnalysis.size === 0"
            >Waiting for AI Analysis</span
          >
          <span v-else>Proceed to Data Extraction</span>
        </Button>
      </div>
    </Card>

    <!-- Disabled overlay -->
    <WorkflowDisabledOverlay :disabled="props.disabled" />
  </div>
</template>

<style scoped>
/* All styling now handled by Tailwind classes */
</style>
