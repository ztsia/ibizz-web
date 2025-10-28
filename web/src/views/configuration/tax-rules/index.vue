<template>
  <div class="min-h-screen">
    <div class="space-y-8 p-8">
      <!-- Header Section -->
      <div class="rounded-2xl border p-8 shadow-lg">
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <h1 class="text-4xl font-bold">Tax Rules Configuration</h1>
            <p class="text-lg font-medium">
              Malaysia Income Tax Act 1967 - Editable Sections
            </p>
            <div class="mt-4 flex items-center gap-2">
              <div class="h-2 w-2 animate-pulse rounded-full"></div>
              <span class="text-sm"
                >{{ sections.length }} sections available</span
              >
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button
              @click="changeLogModalApi.open()"
              class="group flex items-center gap-3 rounded-xl border px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <History
                class="h-5 w-5 transition-transform group-hover:rotate-12"
              />
              <span class="font-medium">Change Log</span>
            </button>
            <button
              @click="exportRules"
              class="group flex items-center gap-3 rounded-xl border px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Download
                class="h-5 w-5 transition-transform group-hover:-translate-y-1"
              />
              <span class="font-medium">Export Rules</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="rounded-2xl border p-6 shadow-lg">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div class="flex-1">
            <label class="mb-2 block text-sm font-semibold"
              >Search Tax Rules</label
            >
            <div class="group relative">
              <Search
                class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform transition-colors"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search sections, titles, or content..."
                class="w-full rounded-xl border py-3 pl-12 pr-4 transition-all duration-300 focus:outline-none"
              />
            </div>
          </div>
          <div class="flex flex-col gap-4 sm:flex-row">
            <div class="space-y-2">
              <label class="block text-sm font-semibold">Category</label>
              <select
                v-model="filterCategory"
                class="min-w-[180px] rounded-xl border px-4 py-3 transition-all duration-300 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option
                  v-for="category in categories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-semibold">View</label>
              <button
                @click="toggleViewMode"
                class="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300 hover:shadow-md focus:outline-none"
              >
                <component
                  :is="viewMode === 'list' ? Grid : List"
                  class="h-5 w-5 transition-transform group-hover:scale-110"
                />
                <span class="font-medium">{{
                  viewMode === 'list' ? 'Grid View' : 'List View'
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-16"
      >
        <div class="relative">
          <div
            class="border-muted h-12 w-12 animate-spin rounded-full border-4"
          ></div>
          <div
            class="border-t-primary absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent"
          ></div>
        </div>
        <p class="mt-4 animate-pulse text-lg font-medium">
          Loading tax rules...
        </p>
      </div>

      <!-- Tax Rules Sections -->
      <div v-else>
        <!-- List View -->
        <div v-if="viewMode === 'list'" class="space-y-6">
          <div
            v-for="section in filteredSections"
            :key="section.id"
            class="group relative overflow-hidden rounded-2xl border shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            <div class="relative p-8">
              <div class="mb-6 flex items-start justify-between">
                <div class="flex-1">
                  <div class="mb-4 flex items-center gap-4">
                    <span
                      class="inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold shadow-lg"
                    >
                      Section {{ section.sectionNumber }}
                    </span>
                    <span
                      class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
                      >v{{ section.version }}</span
                    >
                    <div class="flex items-center gap-2">
                      <div class="h-2 w-2 rounded-full"></div>
                      <span class="text-xs">Active</span>
                    </div>
                  </div>
                  <h3 class="mb-3 text-2xl font-bold transition-colors">
                    {{ section.title }}
                  </h3>
                  <p class="line-clamp-3 text-base leading-relaxed">
                    {{ section.content }}
                  </p>
                </div>
                <div class="ml-6 flex items-center gap-3">
                  <button
                    @click="editSection(section)"
                    class="group/btn flex items-center justify-center rounded-xl border p-3 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    title="Edit Section"
                  >
                    <Edit
                      class="h-5 w-5 transition-transform group-hover/btn:rotate-12"
                    />
                  </button>
                  <button
                    @click="viewSectionHistory(section)"
                    class="group/btn flex items-center justify-center rounded-xl border p-3 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    title="View History"
                  >
                    <Clock
                      class="h-5 w-5 transition-transform group-hover/btn:-rotate-12"
                    />
                  </button>
                  <button
                    @click="compareSectionVersions(section)"
                    class="group/btn flex items-center justify-center rounded-xl border p-3 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    title="Compare Versions"
                  >
                    <GitCompare
                      class="h-5 w-5 transition-transform group-hover/btn:scale-110"
                    />
                  </button>
                </div>
              </div>

              <!-- Subsections Preview -->
              <div v-if="section.subsections.length > 0" class="mt-6">
                <div class="mb-4 flex items-center gap-3">
                  <div
                    class="flex items-center justify-center rounded-lg border p-2"
                  >
                    <FileText class="h-5 w-5" />
                  </div>
                  <span class="text-lg font-semibold"
                    >{{ section.subsections.length }} Subsections</span
                  >
                </div>
                <div
                  class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
                >
                  <div
                    v-for="subsection in section.subsections.slice(0, 6)"
                    :key="subsection.id"
                    class="group/sub rounded-xl border p-4 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    <span
                      class="inline-block rounded-md border px-2 py-1 text-xs font-bold shadow-sm transition-colors"
                      >{{ subsection.subsectionNumber }}</span
                    >
                    <p
                      class="mt-2 line-clamp-2 text-sm font-medium transition-colors"
                    >
                      {{ subsection.title }}
                    </p>
                  </div>
                  <div
                    v-if="section.subsections.length > 6"
                    class="flex items-center justify-center rounded-xl border border-dashed p-4"
                  >
                    <span class="text-sm font-semibold"
                      >+{{ section.subsections.length - 6 }} more</span
                    >
                  </div>
                </div>
              </div>

              <!-- Last Modified Info -->
              <div class="mt-8 flex items-center justify-between border-t pt-6">
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2">
                    <div class="h-2 w-2 rounded-full"></div>
                    <span class="text-sm font-medium">
                      Last modified {{ formatDate(section.lastModified) }}
                    </span>
                  </div>
                  <div class="text-sm">by {{ section.modifiedBy }}</div>
                </div>
                <button
                  @click="toggleSectionExpansion(section.id)"
                  class="group flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105"
                >
                  <span>{{
                    expandedSections.has(section.id) ? 'Show Less' : 'Show More'
                  }}</span>
                  <div
                    class="transition-transform duration-300"
                    :class="
                      expandedSections.has(section.id) ? 'rotate-180' : ''
                    "
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </button>
              </div>

              <!-- Expanded Content -->
              <div
                v-if="expandedSections.has(section.id)"
                class="mt-4 border-t pt-4"
              >
                <div class="prose max-w-none">
                  <div class="whitespace-pre-wrap">
                    {{ section.content }}
                  </div>

                  <!-- Detailed Subsections -->
                  <div v-if="section.subsections.length > 0" class="mt-6">
                    <h4 class="mb-4 text-lg font-medium">Subsections</h4>
                    <div class="space-y-4">
                      <div
                        v-for="subsection in section.subsections"
                        :key="subsection.id"
                        class="rounded-lg border p-4"
                      >
                        <div class="mb-2 flex items-center gap-2">
                          <span
                            class="rounded border px-2 py-1 text-xs font-medium"
                          >
                            {{ subsection.subsectionNumber }}
                          </span>
                          <h5 class="font-medium">
                            {{ subsection.title }}
                          </h5>
                        </div>
                        <p class="whitespace-pre-wrap text-sm">
                          {{ subsection.content }}
                        </p>

                        <!-- Examples -->
                        <div
                          v-if="
                            subsection.examples &&
                            subsection.examples.length > 0
                          "
                          class="mt-3"
                        >
                          <h6 class="mb-2 text-sm font-medium">Examples:</h6>
                          <ul class="list-inside list-disc space-y-1 text-sm">
                            <li
                              v-for="example in subsection.examples"
                              :key="example"
                            >
                              {{ example }}
                            </li>
                          </ul>
                        </div>

                        <!-- References -->
                        <div
                          v-if="
                            subsection.references &&
                            subsection.references.length > 0
                          "
                          class="mt-3"
                        >
                          <h6 class="mb-2 text-sm font-medium">References:</h6>
                          <ul class="list-inside list-disc space-y-1 text-sm">
                            <li
                              v-for="reference in subsection.references"
                              :key="reference"
                            >
                              {{ reference }}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div
          v-else
          class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
        >
          <div
            v-for="section in filteredSections"
            :key="section.id"
            class="group cursor-pointer overflow-hidden rounded-2xl border shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            @click="editSection(section)"
          >
            <!-- Card Header -->
            <div class="border-b p-6">
              <div class="flex items-center justify-between">
                <span
                  class="inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold"
                >
                  Section {{ section.sectionNumber }}
                </span>
                <span
                  class="rounded-full border px-2 py-1 text-xs font-semibold"
                  >v{{ section.version }}</span
                >
              </div>
            </div>

            <div class="p-6">
              <h3 class="mb-3 line-clamp-2 text-xl font-bold transition-colors">
                {{ section.title }}
              </h3>
              <p class="mb-6 line-clamp-3 text-sm leading-relaxed">
                {{ section.content }}
              </p>

              <!-- Stats Section -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div
                    class="flex items-center justify-center rounded-lg border p-2"
                  >
                    <FileText class="h-4 w-4" />
                  </div>
                  <span class="text-sm font-semibold"
                    >{{ section.subsections.length }} subsections</span
                  >
                </div>
                <div class="text-xs">
                  {{ formatDate(section.lastModified) }}
                </div>
              </div>

              <!-- Hover indicator -->
              <div
                class="mt-4 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <div class="flex items-center gap-2 text-sm font-medium">
                  <span>Click to edit</span>
                  <svg
                    class="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && filteredSections.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border p-16 text-center shadow-lg"
      >
        <div class="mb-6 rounded-full border p-6">
          <BookOpen class="h-16 w-16" />
        </div>
        <h3 class="mb-3 text-2xl font-bold">No tax rules found</h3>
        <p class="mb-6 max-w-md text-lg">
          Try adjusting your search or filter criteria to find the tax rules
          you're looking for.
        </p>
        <button
          @click="
            searchQuery = '';
            filterCategory = '';
          "
          class="rounded-xl border px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          Clear Filters
        </button>
      </div>

      <!-- Edit Section Modal -->
      <EditSectionModal @cancel="closeEditModal" @confirm="handleSectionSave">
        <template #title>
          <div>
            <h2 class="text-xl font-semibold">
              Edit Section {{ selectedSection?.sectionNumber }}
            </h2>
            <p class="mt-1 text-sm">{{ selectedSection?.title }}</p>
          </div>
        </template>
        <TaxRuleEditModal
          :section="selectedSection"
          @close="closeEditModal"
          @save="handleSectionSave"
        />
      </EditSectionModal>

      <!-- Change Log Modal -->
      <ChangeLogModal
        @cancel="() => changeLogModalApi.close()"
        @confirm="() => changeLogModalApi.close()"
      >
        <template #title>
          <div>
            <h2 class="text-xl font-semibold">Change Log</h2>
            <p class="mt-1 text-sm">
              {{
                selectedSectionId
                  ? 'Section-specific changes'
                  : 'All tax rule changes'
              }}
            </p>
          </div>
        </template>
        <TaxRuleChangeLogModal
          :section-id="selectedSectionId"
          @close="() => changeLogModalApi.close()"
        />
      </ChangeLogModal>

      <!-- Version Comparison Modal -->
      <VersionCompareModal
        @cancel="() => versionCompareModalApi.close()"
        @confirm="() => versionCompareModalApi.close()"
      >
        <template #title>
          <div>
            <h2 class="text-xl font-semibold">Version Comparison</h2>
            <p class="mt-1 text-sm">
              Section {{ selectedSection?.sectionNumber }} -
              {{ selectedSection?.title }}
            </p>
          </div>
        </template>
        <TaxRuleVersionCompareModal
          :section="selectedSection"
          @close="() => versionCompareModalApi.close()"
        />
      </VersionCompareModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Search,
  Edit,
  Clock,
  GitCompare,
  History,
  Download,
  FileText,
  BookOpen,
  Grid,
  List,
} from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';
import type { TaxRuleSection } from '#/api/configuration/tax-rules';
import {
  getTaxRuleSections,
  getTaxRuleCategories,
} from '#/api/configuration/tax-rules';
import TaxRuleEditModal from './components/TaxRuleEditModal.vue';
import TaxRuleChangeLogModal from './components/TaxRuleChangeLogModal.vue';
import TaxRuleVersionCompareModal from './components/TaxRuleVersionCompareModal.vue';

// Initialize VbenModal instances
const [EditSectionModal, editSectionModalApi] = useVbenModal({
  width: 1200,
});
const [ChangeLogModal, changeLogModalApi] = useVbenModal({
  width: 1200,
});
const [VersionCompareModal, versionCompareModalApi] = useVbenModal({
  width: 1400,
});

// State
const loading = ref(false);
const sections = ref<TaxRuleSection[]>([]);
const categories = ref<string[]>([]);
const searchQuery = ref('');
const filterCategory = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const expandedSections = ref(new Set<string>());
const selectedSection = ref<TaxRuleSection | null>(null);
const selectedSectionId = ref<string | null>(null);

// Computed
const filteredSections = computed(() => {
  return sections.value.filter((section) => {
    const matchesSearch =
      section.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      section.sectionNumber
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());

    // For now, we'll use a simple category filter based on section number ranges
    const matchesCategory =
      !filterCategory.value ||
      getCategoryForSection(section.sectionNumber) === filterCategory.value;

    return matchesSearch && matchesCategory;
  });
});

// Methods
const loadSections = async () => {
  try {
    loading.value = true;
    const [sectionsData, categoriesData] = await Promise.all([
      getTaxRuleSections(),
      getTaxRuleCategories(),
    ]);
    sections.value = sectionsData;
    categories.value = categoriesData;
  } catch (error) {
    message.error('Failed to load tax rule sections');
    console.error('Error loading sections:', error);
  } finally {
    loading.value = false;
  }
};

const editSection = (section: TaxRuleSection) => {
  selectedSection.value = section;
  editSectionModalApi.open();
};

const viewSectionHistory = (section: TaxRuleSection) => {
  selectedSectionId.value = section.id;
  changeLogModalApi.open();
};

const compareSectionVersions = (section: TaxRuleSection) => {
  selectedSection.value = section;
  versionCompareModalApi.open();
};

const toggleSectionExpansion = (sectionId: string) => {
  if (expandedSections.value.has(sectionId)) {
    expandedSections.value.delete(sectionId);
  } else {
    expandedSections.value.add(sectionId);
  }
};

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list';
};

const closeEditModal = () => {
  editSectionModalApi.close();
  selectedSection.value = null;
};

const handleSectionSave = () => {
  closeEditModal();
  loadSections();
};

const exportRules = () => {
  // Implementation for exporting rules
  message.info('Export functionality will be implemented');
};

const getCategoryForSection = (sectionNumber: string) => {
  // Simple categorization based on section number ranges
  const num = Number.parseInt(sectionNumber);
  if (num >= 1 && num <= 20) return 'General Provisions';
  if (num >= 21 && num <= 40) return 'Income Tax';
  if (num >= 41 && num <= 60) return 'Deductions';
  if (num >= 61 && num <= 80) return 'Assessment';
  if (num >= 81 && num <= 100) return 'Collection';
  return 'Other Provisions';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  loadSections();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose {
  max-width: none;
}

/* Custom animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur(12px)) {
  .backdrop-blur-sm {
    background-color: rgba(255, 255, 255, 0.9);
  }
  .backdrop-blur-xl {
    background-color: rgba(255, 255, 255, 0.95);
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
