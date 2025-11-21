<template>
  <div>
    <!-- Floating Toggle Button (when sidebar is closed) -->
    <Transition name="toggle-fade">
      <div
        v-if="!isOpen"
        class="fixed left-4 top-1/2 z-50 -translate-y-1/2 transform"
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          @click="toggleSidebar"
          class="border-0 bg-slate-700 shadow-md transition-all duration-200 hover:bg-slate-600 hover:shadow-lg"
        >
          <FileTextOutlined class="text-lg" />
        </Button>
      </div>
    </Transition>

    <!-- Sidebar Overlay -->
    <Transition name="overlay-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-black bg-opacity-25 backdrop-blur-sm"
        @click="closeSidebar"
      ></div>
    </Transition>

    <!-- Floating Sidebar -->
    <Transition name="sidebar-slide">
      <div
        v-if="isOpen"
        class="fixed left-0 top-0 z-50 h-full w-96 border-r border-gray-200 bg-white shadow-2xl"
      >
        <!-- Sidebar Header -->
        <div
          class="flex items-center justify-between border-b border-gray-200 bg-slate-50 p-4"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700"
            >
              <FileTextOutlined class="text-white" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">
                Malaysian Tax Worksheets
              </h2>
              <p class="text-sm text-slate-600">HK Forms Management</p>
            </div>
          </div>
          <Button
            type="text"
            shape="circle"
            @click="closeSidebar"
            class="text-slate-600 hover:bg-slate-100"
          >
            <CloseOutlined />
          </Button>
        </div>

        <!-- Search and Filter -->
        <div class="border-b border-gray-200 p-4">
          <Input
            v-model:value="searchQuery"
            placeholder="Search worksheets..."
            class="mb-3"
          >
            <template #prefix>
              <SearchOutlined class="text-gray-400" />
            </template>
          </Input>
          <Select
            v-model:value="selectedSection"
            placeholder="Filter by section"
            class="w-full"
            allowClear
          >
            <SelectOption value="">All Sections</SelectOption>
            <SelectOption value="main-forms">Main Forms</SelectOption>
            <SelectOption value="income-schedules"
              >Income Schedules</SelectOption
            >
            <SelectOption value="supporting-forms"
              >Supporting Forms</SelectOption
            >
          </Select>
        </div>

        <!-- Worksheets List -->
        <div class="max-h-[calc(100vh-200px)] flex-1 overflow-y-auto p-4">
          <div
            v-for="section in filteredSections"
            :key="section.id"
            class="mb-6"
          >
            <!-- Section Header -->
            <div class="mb-3 flex items-center gap-2">
              <component :is="section.icon" class="text-slate-600" />
              <h3 class="text-sm font-semibold text-slate-800">
                {{ section.title }}
              </h3>
              <div class="h-px flex-1 bg-slate-200"></div>
            </div>

            <!-- Worksheets in Section -->
            <div class="space-y-2">
              <div
                v-for="worksheet in section.worksheets"
                :key="worksheet.code"
                class="group cursor-pointer rounded-lg border border-slate-200 p-3 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                @click="previewWorksheet(worksheet)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-slate-900">{{
                        worksheet.code
                      }}</span>
                      <div
                        :class="[
                          'h-2 w-2 rounded-full',
                          worksheet.status === 'completed'
                            ? 'bg-emerald-500'
                            : worksheet.status === 'in-progress'
                              ? 'bg-amber-500'
                              : 'bg-slate-300',
                        ]"
                      ></div>
                    </div>
                    <p class="mt-1 line-clamp-2 text-xs text-slate-600">
                      {{ worksheet.description }}
                    </p>
                  </div>
                  <div
                    class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Button
                      type="text"
                      size="small"
                      @click.stop="previewWorksheet(worksheet)"
                      class="text-slate-600 hover:text-slate-800"
                    >
                      <EyeOutlined />
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      @click.stop="handleExport(worksheet)"
                      :loading="isExporting"
                      :disabled="isExporting"
                      class="text-slate-600 hover:text-slate-800"
                    >
                      <DownloadOutlined v-if="!isExporting" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Footer -->
        <div class="border-t border-slate-200 bg-slate-50 p-4">
          <div class="flex items-center justify-between text-sm text-slate-600">
            <span>{{ completionStats.total }} worksheets</span>
            <span>{{ completionStats.completed }} completed</span>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-slate-200">
            <div
              class="h-2 rounded-full bg-slate-700 transition-all duration-300"
              :style="{
                width: `${(completionStats.completed / completionStats.total) * 100}%`,
              }"
            ></div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Worksheet Preview Modal -->
    <WorksheetPreviewModal class="worksheet-preview-modal">
      <div v-if="selectedWorksheet">
        <!-- Unified Modal Header -->
        <div class="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6">
          <div class="flex items-center justify-between">
            <!-- Left Section: Form Info -->
            <div class="flex items-center gap-4">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700 shadow-md"
              >
                <component
                  :is="getWorksheetIcon(selectedWorksheet.section)"
                  class="h-6 w-6 text-white"
                />
              </div>
              <div>
                <h2 class="text-2xl font-bold text-slate-900">
                  {{ selectedWorksheet.code }}
                </h2>
                <p class="text-lg text-slate-600">
                  {{ selectedWorksheet.description }}
                </p>
              </div>
            </div>

            <!-- Right Section: Status & Actions -->
            <div class="flex items-center gap-4">
              <!-- Status Badge -->
              <div class="flex items-center gap-3">
                <div
                  :class="[
                    'inline-flex items-center rounded-full px-4 py-2 text-sm font-medium',
                    selectedWorksheet.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedWorksheet.status === 'in-progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800',
                  ]"
                >
                  <span class="mr-2">
                    {{
                      selectedWorksheet.status === 'completed'
                        ? '✓'
                        : selectedWorksheet.status === 'in-progress'
                          ? '⏳'
                          : '⏸'
                    }}
                  </span>
                  {{ selectedWorksheet.status.toUpperCase() }}
                </div>
              </div>

              <!-- Last Updated Info -->
              <div
                class="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm"
              >
                <CalendarOutlined class="h-4 w-4 text-slate-500" />
                <span class="text-sm text-slate-600"
                  >Updated:
                  {{ formatDate(selectedWorksheet.lastUpdated) }}</span
                >
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2">
                <Button
                  type="primary"
                  @click="handleExport(selectedWorksheet, 'pdf')"
                  :loading="isExporting"
                  :disabled="isExporting"
                  class="shadow-sm"
                >
                  <FilePdfOutlined v-if="!isExporting" class="mr-2 h-4 w-4" />
                  {{ isExporting ? 'Exporting...' : 'Export PDF' }}
                </Button>
                <Button
                  @click="handleExport(selectedWorksheet, 'excel')"
                  :loading="isExporting"
                  :disabled="isExporting"
                  class="shadow-sm"
                >
                  <FileExcelOutlined v-if="!isExporting" class="mr-2 h-4 w-4" />
                  {{ isExporting ? 'Exporting...' : 'Export Excel' }}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6 p-6">
          <!-- Tabbed Content -->
          <div class="overflow-hidden rounded border">
            <div class="border-b border-slate-200">
              <nav class="-mb-px flex space-x-8 px-6">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="[
                    'border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'border-slate-700 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                  ]"
                >
                  {{ tab.label }}
                </button>
              </nav>
            </div>
            <div class="min-h-96 p-6">
              <!-- Tab Content -->
              <div class="space-y-4">
                <!-- Overview Tab -->
                <div v-if="activeTab === 'overview'" class="space-y-4">
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="rounded-lg bg-slate-50 p-4">
                      <h4 class="mb-2 font-medium text-slate-900">
                        Legal Basis
                      </h4>
                      <p class="text-sm text-slate-600">
                        {{
                          selectedWorksheet.legalBasis || 'Income Tax Act 1967'
                        }}
                      </p>
                    </div>
                    <div class="rounded-lg bg-slate-50 p-4">
                      <h4 class="mb-2 font-medium text-slate-900">Purpose</h4>
                      <p class="text-sm text-slate-600">
                        {{
                          selectedWorksheet.purpose ||
                          'Tax computation worksheet'
                        }}
                      </p>
                    </div>
                  </div>
                  <div class="rounded-lg bg-slate-50 p-4">
                    <h4 class="mb-2 font-medium text-slate-900">
                      Status Information
                    </h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span class="text-slate-500">Status:</span>
                        <span class="ml-2 font-medium text-slate-900">{{
                          selectedWorksheet.status
                        }}</span>
                      </div>
                      <div>
                        <span class="text-slate-500">Last Updated:</span>
                        <span class="ml-2 font-medium text-slate-900">{{
                          formatDate(selectedWorksheet.lastUpdated)
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Compliance Tab -->
                <div v-if="activeTab === 'compliance'" class="space-y-4">
                  <div class="rounded-lg bg-slate-50 p-4">
                    <h4 class="mb-3 font-medium text-slate-900">
                      Required Documents
                    </h4>
                    <ul class="space-y-2">
                      <li
                        v-for="doc in selectedWorksheet.requiredDocuments || []"
                        :key="doc"
                        class="flex items-center text-sm text-slate-600"
                      >
                        <div
                          class="mr-3 h-2 w-2 rounded-full bg-slate-400"
                        ></div>
                        {{ doc }}
                      </li>
                    </ul>
                  </div>
                  <div class="rounded-lg bg-slate-50 p-4">
                    <h4 class="mb-3 font-medium text-slate-900">Key Fields</h4>
                    <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div
                        v-for="field in selectedWorksheet.keyFields || []"
                        :key="field"
                        class="text-sm text-slate-600"
                      >
                        • {{ field }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Form Structure Tab -->
                <div v-if="activeTab === 'structure'" class="space-y-4">
                  <div class="rounded-lg bg-slate-50 p-4">
                    <h4 class="mb-3 font-medium text-slate-900">
                      Related Forms
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="form in selectedWorksheet.relatedForms || []"
                        :key="form"
                        class="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700"
                      >
                        {{ form }}
                      </span>
                    </div>
                  </div>
                  <div class="rounded-lg bg-slate-50 p-4">
                    <h4 class="mb-3 font-medium text-slate-900">
                      Form Preview
                    </h4>
                    <div class="py-8 text-center text-slate-500">
                      <FileTextOutlined class="mb-4 text-4xl" />
                      <p class="text-lg font-medium">
                        {{ selectedWorksheet.code }} Structure
                      </p>
                      <p class="text-sm">
                        Detailed form structure and fields will be displayed
                        here
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Form Preview Tab -->
                <div v-if="activeTab === 'form-preview'" class="space-y-4">
                  <div class="rounded-lg bg-slate-50 p-4">
                    <h4 class="mb-3 font-medium text-slate-900">
                      Visual Form Template - {{ selectedWorksheet.code }}
                    </h4>
                    <p class="mb-4 text-sm text-slate-600">
                      This is a non-editable visual representation of the
                      {{ selectedWorksheet.code }} form structure.
                    </p>

                    <!-- Form Template Display -->
                    <div class="relative">
                      <!-- Form Container -->
                      <div
                        class="form-display-container overflow-auto rounded border bg-white p-6 transition-all duration-300"
                        style="min-height: 800px; max-height: 90vh"
                      >
                        <!-- Form Content -->
                        <div class="form-content-wrapper mx-auto max-w-full">
                          <HKEFormTemplate
                            v-if="selectedWorksheet.code === 'HK-E'"
                          />
                          <HKE1FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-E1'"
                          />
                          <HKE2FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-E2'"
                          />
                          <HKC16FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-C16'"
                          />
                          <HKPC1FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-PC1'"
                          />
                          <HKPC1AFormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-PC1A'"
                          />
                          <HKPC2FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-PC2'"
                          />
                          <HKPC3FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-PC3'"
                          />
                          <HKPC4FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-PC4'"
                          />
                          <HKPC5FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-PC5'"
                          />
                          <HKPC6FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-PC6'"
                          />
                          <HKPC7FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-PC7'"
                          />
                          <HKPC8FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-PC8'"
                          />
                          <HKPC9FormTemplate
                            v-else-if="selectedWorksheet.code === 'HK-PC9'"
                          />
                          <CP204FormTemplate
                            v-else-if="selectedWorksheet.code === 'CP-204'"
                          />
                          <CP204AFormTemplate
                            v-else-if="selectedWorksheet.code === 'CP-204A'"
                          />
                          <CP204BFormTemplate
                            v-else-if="selectedWorksheet.code === 'CP-204B'"
                          />
                          <PaymentInstalmentsTemplate
                            v-else-if="
                              selectedWorksheet.code === 'CP204-PAYMENT'
                            "
                          />
                          <OtherParticularsMainTemplate
                            v-else-if="selectedWorksheet.code === 'OP-MAIN'"
                          />
                          <ControlledTransactionsTemplate
                            v-else-if="selectedWorksheet.code === 'OP-CT'"
                          />
                          <LabuanDetailsTemplate
                            v-else-if="selectedWorksheet.code === 'OP-LABUAN'"
                          />
                          <CbcrTemplate
                            v-else-if="selectedWorksheet.code === 'OP-CBCR'"
                          />
                          <div v-else class="py-16 text-center text-slate-500">
                            <FileTextOutlined class="mb-6 text-6xl" />
                            <p class="text-2xl font-medium">
                              Form Template Not Available
                            </p>
                            <p class="text-lg">
                              Visual form template for
                              {{ selectedWorksheet.code }} is not yet
                              implemented.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div></WorksheetPreviewModal
    >
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Button, Input, Select, SelectOption, message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';
import { useMalaysianWorksheetsStore } from '#/store';
import type { MalaysianTaxWorksheet } from '#/store';
import {
  FileTextOutlined,
  CloseOutlined,
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  FormOutlined,
  FileProtectOutlined,
} from '@ant-design/icons-vue';
import HKEFormTemplate from './forms/HKEFormTemplate.vue';
import HKE1FormTemplate from './forms/HKE1FormTemplate.vue';
import HKE2FormTemplate from './forms/HKE2FormTemplate.vue';
import HKC16FormTemplate from '../../../components/forms/HKC16FormTemplate.vue';
import HKPC1FormTemplate from './forms/HKPC1FormTemplate.vue';
import TaxFormInput from './TaxFormInput.vue';
import HKPC1AFormTemplate from './forms/HKPC1AFormTemplate.vue';
import HKPC2FormTemplate from './forms/HKPC2FormTemplate.vue';
import HKPC3FormTemplate from './forms/HKPC3FormTemplate.vue';
import HKPC4FormTemplate from './forms/HKPC4FormTemplate.vue';
import HKPC5FormTemplate from './forms/HKPC5FormTemplate.vue';
import HKPC6FormTemplate from './forms/HKPC6FormTemplate.vue';
import HKPC7FormTemplate from './forms/HKPC7FormTemplate.vue';
import HKPC8FormTemplate from './forms/HKPC8FormTemplate.vue';
import HKPC9FormTemplate from './forms/HKPC9FormTemplate.vue';
import CP204FormTemplate from './forms/CP204FormTemplate.vue';
import CP204AFormTemplate from './forms/CP204AFormTemplate.vue';
import CP204BFormTemplate from './forms/CP204BFormTemplate.vue';
import OtherParticularsMainTemplate from './forms/OtherParticularsMainTemplate.vue';
import ControlledTransactionsTemplate from './forms/ControlledTransactionsTemplate.vue';
import LabuanDetailsTemplate from './forms/LabuanDetailsTemplate.vue';
import CbcrTemplate from './forms/CbcrTemplate.vue';
import PaymentInstalmentsTemplate from './forms/PaymentInstalmentsTemplate.vue';
import { usePdfExport } from '#/composables/usePdfExport';
import { usePdfExportContext } from '#/composables/usePdfExportContext';

// Store and route
const route = useRoute();
const worksheetsStore = useMalaysianWorksheetsStore();

// PDF Export composable
const { exportWorksheet, isExporting, isFormTemplateAvailable, isPdfExport } =
  usePdfExport();

// PDF Export context for child components
const pdfContext = usePdfExportContext();

// Reactive state
const searchQuery = ref('');
const selectedSection = ref('');
const selectedWorksheet = ref<MalaysianTaxWorksheet | null>(null);
const activeTab = ref('overview');

// Props and Emits
interface Props {
  visible?: boolean;
}

interface Emits {
  (e: 'visibility-change', visible: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
});

const isOpen = ref(props.visible);
const emit = defineEmits<Emits>();

// Fullscreen functionality will be handled through CSS and component state

// Initialize VbenModal for worksheet preview
const [WorksheetPreviewModal, worksheetPreviewModalApi] = useVbenModal({
  title: 'Malaysian Tax Worksheet Preview',
  showConfirmButton: false,
  width: '95vw',
  style: {
    top: '20px',
    maxWidth: '1400px',
  },
  bodyStyle: {
    padding: '0',
    maxHeight: '90vh',
    overflow: 'hidden',
  },
});

// Expose modal API
defineExpose({
  worksheetPreviewModalApi,
});

// Register components
const components = {
  TaxFormInput,
};

// Tab configuration
const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'structure', label: 'Form Structure' },
  { id: 'form-preview', label: 'Form Preview' },
];

// Initialize store with session ID
onMounted(() => {
  const sessionId = (route.query.sessionId as string) || 'default-session';
  console.log('🔧 Malaysian Worksheets: Initializing session:', sessionId);

  // Clear any existing session data to force fresh initialization
  worksheetsStore.clearSession(sessionId);

  // Initialize with fresh data
  worksheetsStore.initializeSession(sessionId);

  // Debug: Log store state after initialization
  setTimeout(() => {
    console.log('🔧 Malaysian Worksheets: Store state after init:', {
      currentSessionId: worksheetsStore.currentSessionId,
      currentWorksheets: worksheetsStore.currentWorksheets,
      worksheetSections: worksheetsStore.worksheetSections,
      completionStats: worksheetsStore.completionStats,
    });

    // Force reactivity update
    if (worksheetsStore.currentWorksheets.length === 0) {
      worksheetsStore.initializeSession(sessionId);
    }
  }, 200);
});

// Computed properties from store
const filteredSections = computed(() => {
  let sections = worksheetsStore.worksheetSections;

  // Filter by section if selected
  if (selectedSection.value) {
    sections = sections.filter(
      (section) => section.id === selectedSection.value,
    );
    console.log('🔧 Malaysian Worksheets: After section filter:', sections);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    sections = sections
      .map((section) => ({
        ...section,
        worksheets: section.worksheets.filter(
          (worksheet) =>
            worksheet.code.toLowerCase().includes(query) ||
            worksheet.description.toLowerCase().includes(query),
        ),
      }))
      .filter((section) => section.worksheets.length > 0);
    console.log('🔧 Malaysian Worksheets: After search filter:', sections);
  }

  console.log('🔧 Malaysian Worksheets: Final filteredSections:', sections);
  sections.forEach((section, index) => {
    console.log(
      `🔧 Malaysian Worksheets: Section ${index + 1} (${section.title}):`,
      section.worksheets.length,
      'worksheets',
    );
  });
  return sections;
});

const completionStats = computed(() => worksheetsStore.completionStats);

// Methods
const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  emit('visibility-change', isOpen.value);
};

const closeSidebar = () => {
  isOpen.value = false;
  emit('visibility-change', false);
};

const previewWorksheet = (worksheet: MalaysianTaxWorksheet) => {
  selectedWorksheet.value = worksheet;
  // Auto-open to Form Preview tab for forms that have visual templates
  const formsWithTemplates = [
    'HK-E',
    'HK-E1',
    'HK-E2',
    'HK-C16',
    'HK-PC1',
    'HK-PC1A',
    'HK-PC2',
    'HK-PC3',
    'HK-PC4',
    'HK-PC5',
    'HK-PC6',
    'HK-PC7',
    'HK-PC8',
    'HK-PC9',
    'CP-204',
    'CP-204A',
    'CP-204B',
    'OP-MAIN',
    'OP-CT',
    'OP-LABUAN',
    'OP-CBCR',
  ];
  activeTab.value = formsWithTemplates.includes(worksheet.code)
    ? 'form-preview'
    : 'overview';
  worksheetPreviewModalApi.open();
};

const handleExport = async (
  worksheet: MalaysianTaxWorksheet,
  format: 'pdf' | 'excel' = 'pdf',
) => {
  // Check if form template is available for export
  if (!isFormTemplateAvailable(worksheet.code)) {
    message.warning(
      `Form template for ${worksheet.code} is not available for export. Please ensure the form preview is loaded.`,
    );
    return;
  }

  // Ensure the form preview tab is active and modal is open
  if (
    !selectedWorksheet.value ||
    selectedWorksheet.value.code !== worksheet.code
  ) {
    // Open the worksheet preview first
    previewWorksheet(worksheet);
    // Wait a moment for the modal to render
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Switch to form preview tab if not already active
  if (activeTab.value !== 'form-preview') {
    activeTab.value = 'form-preview';
    // Wait for tab content to render
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Perform the export
  await exportWorksheet(worksheet, format);
};

const getWorksheetIcon = (section: string) => {
  switch (section) {
    case 'Main Forms': {
      return FormOutlined;
    }
    case 'Income Schedules': {
      return CalculatorOutlined;
    }
    case 'Supporting Forms': {
      return FileProtectOutlined;
    }
    default: {
      return FileTextOutlined;
    }
  }
};

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'Not available';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

// Watch for props changes
watch(
  () => props.visible,
  (visible) => {
    isOpen.value = visible;
  },
);
</script>

<style scoped>
/* Print media queries for PDF export */
@media print {
  .pdf-text-only {
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
    font-family: Arial, sans-serif;
  }

  .pdf-text-table-cell,
  .pdf-text-standard,
  .pdf-text-small {
    color: #000 !important;
    background: transparent !important;
    border-color: #000 !important;
  }

  /* Hide input elements during print */
  input:not(.pdf-text-only),
  textarea:not(.pdf-text-only),
  select:not(.pdf-text-only) {
    display: none !important;
  }
}

/* Enhanced PDF Export Optimizations with Modern CSS */
@media print {
  .tax-form-input-base {
    /* Maintain advanced positioning in PDF */
    display: grid !important;
    place-items: center !important;
    font-size: 10px !important;
    line-height: 1 !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }

  .tax-form-input-table {
    /* Preserve grid positioning */
    display: grid !important;
    place-items: center end !important;
    height: 16px !important;
    min-height: 16px !important;
    padding: 0 4px !important;
    line-height: 1 !important;
    background: transparent !important;
    border: none !important;
    transform: translateY(-0.5px) !important;
  }

  .tax-form-input-standard {
    /* Preserve flexbox positioning */
    display: flex !important;
    align-items: center !important;
    height: 20px !important;
    min-height: 20px !important;
    padding: 0 6px !important;
    line-height: 1 !important;
    border: 1px solid #666 !important;
    transform: translateY(-0.5px) !important;
  }

  .tax-form-input-small {
    /* Preserve grid positioning */
    display: grid !important;
    place-items: center !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 4px !important;
    line-height: 1 !important;
    transform: translateY(-0.5px) !important;
  }

  .form-display-container table {
    border-collapse: collapse !important;
  }

  .form-display-container table td {
    padding: 1px !important;
    vertical-align: middle !important;
    border: 1px solid #666 !important;
  }

  .form-display-container table td input {
    box-sizing: border-box !important;
    width: 100% !important;
    padding: 1px 2px !important;
    margin: 0 !important;
    background: transparent !important;
    border: none !important;
  }

  /* Ensure text alignment is preserved in PDF */
  .tax-form-text-right {
    text-align: right !important;
  }

  .tax-form-text-center {
    text-align: center !important;
  }

  .tax-form-text-left {
    text-align: left !important;
  }
}

/* Transitions */
.toggle-fade-enter-active,
.toggle-fade-leave-active {
  transition: all 0.3s ease;
}

.toggle-fade-enter-from,
.toggle-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.8);
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}

/* Custom scrollbar */
.max-h-\[calc\(100vh-200px\)\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[calc\(100vh-200px\)\]::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.max-h-\[calc\(100vh-200px\)\]::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.max-h-\[calc\(100vh-200px\)\]::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Modal customization */
.worksheet-preview-modal .ant-modal-body {
  padding: 24px;
}

.worksheet-preview-modal .ant-tabs-content-holder {
  max-height: calc(80vh - 200px);
  overflow-y: auto;
}

/* Form display enhancements */
.form-display-container {
  background: #fff;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 10%),
    0 2px 4px -1px rgb(0 0 0 / 6%);
}

.form-display-container:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 10%);
}

/* Form display enhancements */
.form-content-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

/* Advanced Input Positioning System */
.tax-form-input-base {
  @apply transition-all duration-200 focus:outline-none;

  /* Modern CSS for perfect vertical centering */
  display: grid;
  place-items: center;
  align-content: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1;

  /* Alternative flexbox approach */

  /* display: flex;
     align-items: center;
     justify-content: center; */
}

/* Enhanced Input Container with CSS Grid */
.tax-form-input-container {
  position: relative;
  display: grid;

  /* Ensure proper text baseline alignment */
  place-content: center stretch;
  place-items: center;
  width: 100%;
  min-height: 32px;
}

/* Flexbox Alternative for Input Container */
.tax-form-input-container-flex {
  position: relative;
  display: flex;

  /* Fine-tune vertical positioning */
  place-content: center center;
  align-items: center;
  width: 100%;
  min-height: 32px;
}

/* Table Cell Inputs - Enhanced with CSS Grid positioning */
.tax-form-input-table {
  @apply tax-form-input-base w-full border-0 bg-transparent text-right text-xs;

  /* Advanced positioning for perfect vertical centering */
  display: grid;
  place-items: center end; /* Center vertically, align right horizontally */
  height: 100%;
  min-height: 20px;
  padding: 0 6px;

  /* Ensure text stays within bounds */
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;

  /* Fallback for older browsers */
  vertical-align: middle;
  white-space: nowrap;

  /* CSS Transform for micro-adjustments */
  transform: translateY(-1px); /* Move text up slightly */
}

/* Standard Form Inputs - Enhanced with Flexbox positioning */
.tax-form-input-standard {
  @apply tax-form-input-base border border-gray-400 bg-white text-sm;

  box-sizing: border-box;

  /* Flexbox for precise vertical centering */
  display: flex;
  align-items: center;
  height: 32px;
  min-height: 32px;
  padding: 0 8px;
  line-height: 1;

  /* CSS Transform for fine-tuning */
  transform: translateY(-0.5px); /* Subtle upward adjustment */
}

/* Small Form Inputs - Enhanced with CSS Grid */
.tax-form-input-small {
  @apply tax-form-input-base border border-gray-400 bg-white text-xs;

  box-sizing: border-box;

  /* CSS Grid for perfect centering */
  display: grid;
  place-items: center;
  height: 24px;
  min-height: 24px;
  padding: 0 6px;
  line-height: 1;

  /* CSS Transform for micro-positioning */
  transform: translateY(-1px); /* Move text up slightly */
}

/* Text Alignment Classes with Enhanced Positioning */
.tax-form-text-left {
  place-items: center start;
  justify-content: flex-start;
  text-align: left;
}

.tax-form-text-center {
  place-items: center;
  justify-content: center;
  text-align: center;
}

.tax-form-text-right {
  place-items: center end;
  justify-content: flex-end;
  text-align: right;
}

/* Vertical Positioning Adjustment Classes */
.tax-form-text-up-1 {
  transform: translateY(-1px);
}

.tax-form-text-up-2 {
  transform: translateY(-2px);
}

.tax-form-text-up-3 {
  transform: translateY(-3px);
}

.tax-form-text-down-1 {
  transform: translateY(1px);
}

.tax-form-text-down-2 {
  transform: translateY(2px);
}

/* Combined Transform Classes for Fine-Tuning */
.tax-form-input-perfect-center {
  display: grid;
  place-items: center;
  line-height: 1;
  transform: translateY(-1px);
}

.tax-form-input-flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transform: translateY(-0.5px);
}

/* Width Classes */
.tax-form-w-full {
  width: 100%;
}

.tax-form-w-32 {
  width: 8rem;
}

.tax-form-w-40 {
  width: 10rem;
}

/* Enhanced form display for fullscreen within modal */
.form-display-container.h-full .form-content-wrapper {
  margin: 0;
  background: white;
  border-radius: 12px;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 10%),
    0 4px 6px -2px rgb(0 0 0 / 5%);
}

/* Smooth transitions for fullscreen toggle */
.form-display-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar for form container */
.form-display-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.form-display-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.form-display-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.form-display-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Ensure forms are properly sized */
.form-content-wrapper > * {
  width: 100%;
  max-width: none;
}

/* Modal fullscreen enhancements */
.form-display-container.h-full {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* Improved form scaling in fullscreen */
.form-content-wrapper {
  overflow: visible;
}

/* Better spacing for fullscreen forms */
.form-display-container.h-full .form-content-wrapper {
  min-height: fit-content;
}

/* PDF Export Text-Only Styling */
.pdf-text-only {
  display: inline-block;
  min-height: 20px;
  line-height: 1.2;
  vertical-align: top;
}

/* Text elements for PDF export - Table cells */
.pdf-text-table-cell {
  @apply pdf-text-only;

  width: 100%;
  padding: 2px 6px 6px;
  font-size: 12px;
  color: #000;
  text-align: right;
  background: transparent;
  border: none;
}

/* Text elements for PDF export - Standard form fields */
.pdf-text-standard {
  @apply pdf-text-only;

  min-width: 120px;
  padding: 4px 8px 8px;
  font-size: 14px;
  line-height: 1.2;
  color: #000;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

/* Text elements for PDF export - Small form fields */
.pdf-text-small {
  @apply pdf-text-only;

  min-width: 80px;
  padding: 2px 6px 6px;
  font-size: 12px;
  line-height: 1.1;
  color: #000;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 3px;
}

/* Text alignment classes for PDF export */
.pdf-text-left {
  text-align: left;
}

.pdf-text-center {
  text-align: center;
}

.pdf-text-right {
  text-align: right;
}

/* PDF-specific table cell text styling */
.pdf-table-text {
  box-sizing: border-box;
  display: block;
  width: 100%;
  height: 100%;
  padding: 4px 6px;
  margin: 0;
  font-size: 11px;
  line-height: 1.2;
  color: #000;
  text-align: right;
  background: transparent;
  border: none;
}

/* Ensure text elements maintain proper spacing in tables */
td .pdf-text-only,
th .pdf-text-only {
  display: block;
  width: 100%;
  height: auto;
  min-height: 18px;
}

/* Enhanced Input Alignment for PDF Export */
.form-display-container input {
  @apply tax-form-input-base;

  box-sizing: border-box;
  vertical-align: top;
}

/* Table-specific input styling */
.form-display-container table input {
  @apply tax-form-input-table;
}

/* Ensure consistent table cell padding */
.form-display-container table td {
  padding: 2px;
  vertical-align: middle;
}

/* Fix input alignment in table cells */
.form-display-container table td input {
  display: block;
  width: 100%;
  margin: 0;
  vertical-align: middle;
}

/*
  ENHANCED INPUT POSITIONING SYSTEM
  
  This component now includes multiple approaches for perfect vertical text alignment:
  
  1. CSS Grid Approach (tax-form-input-table):
     - Uses `display: grid` with `place-items: center end`
     - Perfect for table cells with right-aligned text
     - Provides precise control over both axes
  
  2. Flexbox Approach (tax-form-input-standard):
     - Uses `display: flex` with `align-items: center`
     - Great for standard form inputs
     - Excellent browser support
  
  3. CSS Transform Fine-tuning:
     - `translateY(-1px)` for micro-adjustments
     - Utility classes for different positioning needs
     - Maintains positioning in PDF exports
  
  4. TaxFormInput Component:
     - Custom Ant Design Vue wrapper
     - Advanced positioning with multiple variants
     - Consistent API across all form templates
  
  Usage Examples:
  - Table inputs: Use .tax-form-input-table class
  - Standard inputs: Use .tax-form-input-standard class
  - Custom positioning: Add .tax-form-text-up-1, .tax-form-text-up-2, etc.
  - Perfect centering: Use .tax-form-input-perfect-center
  - Component approach: <TaxFormInput variant="table" textAlign="right" />
*/
</style>
