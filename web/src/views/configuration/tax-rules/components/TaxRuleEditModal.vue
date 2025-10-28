<template>
  <div class="flex h-[calc(85vh-140px)] max-h-[800px]">
    <!-- Main Edit Area -->
    <div class="flex-1 overflow-y-auto">
      <div class="space-y-8 p-8">
        <!-- Header Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold">Edit Tax Rule Section</h2>
              <p class="text-sm opacity-70">
                Section {{ section?.sectionNumber }} • Version
                {{ section?.version }}
              </p>
            </div>
          </div>

          <!-- Section Info Cards -->
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-xl border p-4 shadow-sm">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-lg border"
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium">Last Modified</p>
                  <p class="text-xs opacity-70">
                    {{ formatDate(section?.lastModified || '') }}
                  </p>
                </div>
              </div>
            </div>
            <div class="rounded-xl border p-4 shadow-sm">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-lg border"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium">Modified By</p>
                  <p class="text-xs opacity-70">{{ section?.modifiedBy }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Section Title -->
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z"
                ></path>
              </svg>
              <label class="text-lg font-semibold"> Section Title * </label>
            </div>
            <div class="relative">
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full rounded-xl border px-4 py-3 text-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                placeholder="Enter a clear and descriptive title"
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  v-if="form.title"
                  class="h-5 w-5 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Section Content -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <label class="text-lg font-semibold"> Section Content * </label>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm opacity-70"
                  >{{ form.content.length }} characters</span
                >
                <div class="h-4 w-px opacity-30"></div>
                <button
                  type="button"
                  @click="formatContent"
                  class="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-all hover:shadow-sm"
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
                      d="M4 6h16M4 12h8m-8 6h16"
                    ></path>
                  </svg>
                  Format
                </button>
              </div>
            </div>

            <div class="rounded-xl border shadow-sm">
              <textarea
                v-model="form.content"
                required
                rows="14"
                class="w-full resize-none rounded-xl border-0 p-4 text-sm leading-relaxed focus:outline-none focus:ring-0"
                placeholder="Enter the detailed content for this tax rule section. Be clear and comprehensive as this will be used for legal reference."
              ></textarea>
            </div>
          </div>

          <!-- Subsections -->
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
                <label class="text-lg font-semibold"> Subsections </label>
                <span
                  class="rounded-full border px-2 py-0.5 text-xs font-medium"
                  >{{ form.subsections.length }}</span
                >
              </div>
              <button
                type="button"
                @click="addSubsection"
                class="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:shadow-md"
              >
                <Plus class="h-4 w-4" />
                Add Subsection
              </button>
            </div>

            <div class="space-y-6">
              <div
                v-for="(subsection, index) in form.subsections"
                :key="subsection.id || index"
                class="group rounded-2xl border shadow-sm transition-all hover:shadow-md"
              >
                <div class="border-b p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div
                        class="flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold"
                      >
                        {{ index + 1 }}
                      </div>
                      <h4 class="font-semibold">Subsection {{ index + 1 }}</h4>
                    </div>
                    <button
                      type="button"
                      @click="removeSubsection(index)"
                      class="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:shadow-sm"
                      title="Remove subsection"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div class="space-y-6 p-6">
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2">
                      <label
                        class="flex items-center gap-2 text-sm font-medium"
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
                            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                          ></path>
                        </svg>
                        Subsection Number
                      </label>
                      <input
                        v-model="subsection.subsectionNumber"
                        type="text"
                        class="w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                        placeholder="e.g., 2(1)(a)"
                      />
                    </div>
                    <div class="space-y-2">
                      <label
                        class="flex items-center gap-2 text-sm font-medium"
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
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z"
                          ></path>
                        </svg>
                        Subsection Title
                      </label>
                      <input
                        v-model="subsection.title"
                        type="text"
                        class="w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                        placeholder="Enter subsection title"
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm font-medium">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      Content
                    </label>
                    <textarea
                      v-model="subsection.content"
                      rows="4"
                      class="w-full rounded-lg border px-3 py-2 text-sm leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      placeholder="Enter detailed subsection content"
                    ></textarea>
                  </div>

                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <!-- Examples -->
                    <div class="space-y-2">
                      <label
                        class="flex items-center gap-2 text-sm font-medium"
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
                            d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m5 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-5 4h4"
                          ></path>
                        </svg>
                        Examples
                        <span class="text-xs opacity-70">(one per line)</span>
                      </label>
                      <textarea
                        v-model="subsection.examplesText"
                        rows="3"
                        class="w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                        placeholder="Example 1&#10;Example 2&#10;Example 3"
                      ></textarea>
                    </div>

                    <!-- References -->
                    <div class="space-y-2">
                      <label
                        class="flex items-center gap-2 text-sm font-medium"
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
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          ></path>
                        </svg>
                        References
                        <span class="text-xs opacity-70">(one per line)</span>
                      </label>
                      <textarea
                        v-model="subsection.referencesText"
                        rows="3"
                        class="w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                        placeholder="Section 1 - Reference&#10;Section 2 - Reference&#10;Public Ruling No. X"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div
                v-if="form.subsections.length === 0"
                class="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center"
              >
                <div
                  class="mb-4 flex h-16 w-16 items-center justify-center rounded-full border"
                >
                  <svg
                    class="h-8 w-8 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    ></path>
                  </svg>
                </div>
                <h3 class="mb-2 font-medium">No subsections yet</h3>
                <p class="mb-4 text-sm opacity-70">
                  Add subsections to provide detailed breakdowns of this tax
                  rule
                </p>
                <button
                  type="button"
                  @click="addSubsection"
                  class="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:shadow-md"
                >
                  <Plus class="h-4 w-4" />
                  Add First Subsection
                </button>
              </div>
            </div>
          </div>

          <!-- Change Reason -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <label class="text-lg font-semibold"> Reason for Change * </label>
            </div>
            <div class="rounded-xl border p-4 shadow-sm">
              <div class="mb-3 flex items-center gap-2 text-sm">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span class="font-medium"
                  >This information is required for audit trail and
                  compliance</span
                >
              </div>
              <textarea
                v-model="form.reason"
                required
                rows="4"
                class="w-full rounded-lg border px-4 py-3 text-sm leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                placeholder="Please provide a detailed reason for this change. Include the business justification, legal requirements, or policy updates that necessitate this modification."
              ></textarea>
              <div
                class="mt-2 flex items-center justify-between text-xs opacity-70"
              >
                <span>{{ form.reason.length }} characters</span>
                <span>Minimum 10 characters recommended</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Side Panel - Change Preview -->
    <div class="w-96 overflow-y-auto border-l">
      <div class="sticky top-0 border-b p-6">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              ></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold">Change Preview</h3>
            <p class="text-sm opacity-70">Review your modifications</p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <!-- Changes Summary -->
        <div class="space-y-4">
          <div v-if="hasChanges.title" class="rounded-xl border p-4 shadow-sm">
            <div class="mb-3 flex items-center gap-2">
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z"
                ></path>
              </svg>
              <span class="font-medium">Title Changed</span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-start gap-2">
                <span class="mt-0.5 text-xs">−</span>
                <span class="line-through opacity-70">{{
                  section?.title
                }}</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="mt-0.5 text-xs">+</span>
                <span class="font-medium">{{ form.title }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="hasChanges.content"
            class="rounded-xl border p-4 shadow-sm"
          >
            <div class="mb-3 flex items-center gap-2">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <span class="font-medium">Content Modified</span>
            </div>
            <div class="rounded-lg border p-3 text-sm">
              {{ getContentChangesSummary() }}
            </div>
          </div>

          <div
            v-if="hasChanges.subsections"
            class="rounded-xl border p-4 shadow-sm"
          >
            <div class="mb-3 flex items-center gap-2">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
              <span class="font-medium">Subsections Changed</span>
            </div>
            <div class="rounded-lg border p-3 text-sm">
              {{ getSubsectionsChangesSummary() }}
            </div>
          </div>

          <!-- No Changes State -->
          <div
            v-if="!hasAnyChanges"
            class="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center"
          >
            <div
              class="mb-3 flex h-12 w-12 items-center justify-center rounded-full border"
            >
              <svg
                class="h-6 w-6 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m5 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-5 4h4"
                ></path>
              </svg>
            </div>
            <p class="text-sm font-medium">No changes detected</p>
            <p class="text-xs opacity-70">Make changes to see a preview</p>
          </div>

          <!-- Version Info -->
          <div class="rounded-xl border p-4">
            <div class="mb-3 flex items-center gap-2">
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
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 10h6M9 14h6"
                ></path>
              </svg>
              <span class="font-medium">Version Information</span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="opacity-70">Current Version:</span>
                <span class="font-medium">v{{ section?.version || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="opacity-70">New Version:</span>
                <span class="font-medium"
                  >v{{ (section?.version || 0) + 1 }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="flex w-full items-center justify-between border-t p-6">
    <div class="flex items-center gap-3">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg border">
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <div class="text-sm">
        <p class="font-medium">
          Changes will create version {{ (section?.version || 0) + 1 }}
        </p>
        <p class="opacity-70">All modifications are tracked for compliance</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="$emit('close')"
        class="flex items-center gap-2 rounded-xl border px-6 py-2.5 font-medium transition-all hover:shadow-md"
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
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
        Cancel
      </button>
      <button
        @click="handleSubmit"
        :disabled="loading || !hasAnyChanges || !form.reason.trim()"
        class="flex items-center gap-2 rounded-xl border px-6 py-2.5 font-medium transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div
          v-if="loading"
          class="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current"
        ></div>
        <svg
          v-else
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
        {{ loading ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import type {
  TaxRuleSection,
  TaxRuleSubsection,
  UpdateTaxRuleRequest,
} from '#/api/configuration/tax-rules';
import { updateTaxRuleSection } from '#/api/configuration/tax-rules';

interface Props {
  section: TaxRuleSection | null;
}

interface Emits {
  close: [];
  save: [];
  confirm: [];
  cancel: [];
}

interface FormSubsection
  extends Omit<TaxRuleSubsection, 'examples' | 'references'> {
  examplesText: string;
  referencesText: string;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// State
const loading = ref(false);
const form = reactive({
  title: '',
  content: '',
  subsections: [] as FormSubsection[],
  reason: '',
});

// Computed
const hasChanges = computed(() => ({
  title: form.title !== props.section?.title,
  content: form.content !== props.section?.content,
  subsections:
    JSON.stringify(
      form.subsections.map((s) => ({
        ...s,
        examples: s.examplesText.split('\n').filter((e) => e.trim()),
        references: s.referencesText.split('\n').filter((r) => r.trim()),
      })),
    ) !== JSON.stringify(props.section?.subsections || []),
}));

const hasAnyChanges = computed(() =>
  Object.values(hasChanges.value).some(Boolean),
);

// Methods
const addSubsection = () => {
  form.subsections.push({
    id: `temp-${Date.now()}`,
    subsectionNumber: '',
    title: '',
    content: '',
    examplesText: '',
    referencesText: '',
  });
};

const removeSubsection = (index: number) => {
  form.subsections.splice(index, 1);
};

const formatContent = () => {
  if (!form.content.trim()) {
    return;
  }

  // Enhanced formatting for legal text
  let formatted = form.content
    // Normalize line endings
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    // Remove excessive whitespace
    .replaceAll(/[ \t]+/g, ' ')
    // Remove multiple consecutive line breaks (more than 2)
    .replaceAll(/\n{3,}/g, '\n\n')
    // Trim whitespace from each line
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    // Remove leading/trailing whitespace
    .trim();

  // Add proper spacing after periods if missing
  formatted = formatted.replaceAll(/\.([A-Z])/g, '. $1');

  // Ensure proper spacing after colons
  formatted = formatted.replaceAll(/:([A-Z])/gi, ': $1');

  // Fix spacing around parentheses
  formatted = formatted
    .replaceAll(/\s*\(\s*/g, ' (')
    .replaceAll(/\s*\)\s*/g, ') ');

  // Clean up any double spaces that might have been created
  formatted = formatted.replaceAll(/ {2,}/g, ' ');

  // Final trim
  formatted = formatted.trim();

  form.content = formatted;
};

const getContentChangesSummary = () => {
  const originalLength = props.section?.content.length || 0;
  const newLength = form.content.length;
  const diff = newLength - originalLength;

  if (diff > 0) {
    return `+${diff} characters added`;
  } else if (diff < 0) {
    return `${Math.abs(diff)} characters removed`;
  }
  return 'Content modified';
};

const getSubsectionsChangesSummary = () => {
  const originalCount = props.section?.subsections.length || 0;
  const newCount = form.subsections.length;
  const diff = newCount - originalCount;

  if (diff > 0) {
    return `+${diff} subsections added`;
  } else if (diff < 0) {
    return `${Math.abs(diff)} subsections removed`;
  }
  return 'Subsections modified';
};

const handleSubmit = async () => {
  if (!props.section || !hasAnyChanges.value || !form.reason.trim()) {
    return;
  }

  try {
    loading.value = true;

    // Convert form subsections to API format
    const subsections = form.subsections.map((s) => ({
      id: s.id.startsWith('temp-') ? '' : s.id,
      subsectionNumber: s.subsectionNumber,
      title: s.title,
      content: s.content,
      examples: s.examplesText.split('\n').filter((e) => e.trim()),
      references: s.referencesText.split('\n').filter((r) => r.trim()),
    }));

    const updateData: UpdateTaxRuleRequest = {
      content: form.content,
      subsections,
      reason: form.reason,
    };

    await updateTaxRuleSection(props.section.id, updateData);
    message.success('Tax rule section updated successfully');
    emit('save');
  } catch (error) {
    message.error('Failed to update tax rule section');
    console.error('Error updating section:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Initialize form with section data
watch(
  () => props.section,
  (section) => {
    if (section) {
      form.title = section.title;
      form.content = section.content;
      form.subsections = section.subsections.map((s) => ({
        ...s,
        examplesText: (s.examples || []).join('\n'),
        referencesText: (s.references || []).join('\n'),
      }));
      form.reason = '';
    }
  },
  { immediate: true },
);
</script>
