<template>
  <div class="cp204-form-template bg-white p-6 text-sm">
    <div class="mb-6">
      <div
        class="flex items-center justify-between bg-gray-600 px-4 py-2 text-white"
      >
        <span class="font-bold">CP204:</span>
        <span class="font-bold">ESTIMATION OF TAX PAYABLE</span>
      </div>
    </div>

    <!-- Fields -->
    <div class="space-y-4">
      <!-- Row 1 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">CP204 / CP205 Date</label>
        <template v-if="!isPdfExport">
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-input"
          />
        </template>
        <template v-else>
          <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm">DD/MM/YYYY</div>
        </template>
      </div>
      <!-- Row 2 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >Estimated Revised for previous year</label
        >
        <template v-if="!isPdfExport">
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="field-value-input"
          />
        </template>
        <template v-else>
          <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
        </template>
      </div>
      <!-- Row 3 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >Estimated tax for current assessment year</label
        >
        <template v-if="!isPdfExport">
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="field-value-input"
          />
        </template>
        <template v-else>
          <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
        </template>
      </div>
      <!-- Row 4 -->
      <div class="flex items-center">
        <Checkbox :checked="false" disabled class="print-checkbox" />
        <label class="ml-2 font-medium">S107A ACP (Non Resident)</label>
      </div>
      <!-- Row 5 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Accounting Period</label>
        <div class="ml-4 flex flex-1 items-center">
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              placeholder="DD/MM/YYYY"
              class="field-value-small-input"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm">DD/MM/YYYY</div>
          </template>
          <span class="mx-2 font-medium">To</span>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              placeholder="DD/MM/YYYY"
              class="field-value-small-input"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm">DD/MM/YYYY</div>
          </template>
        </div>
      </div>
      <!-- Row 6 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Basis Period</label>
        <div class="ml-4 flex flex-1 items-center">
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              placeholder="DD/MM/YYYY"
              class="field-value-small-input"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm">DD/MM/YYYY</div>
          </template>
          <span class="mx-2 font-medium">To</span>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              placeholder="DD/MM/YYYY"
              class="field-value-small-input"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm">DD/MM/YYYY</div>
          </template>
        </div>
      </div>
      <!-- Row 7 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >New company business commenced on</label
        >
        <template v-if="!isPdfExport">
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-input"
          />
        </template>
        <template v-else>
          <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm">DD/MM/YYYY</div>
        </template>
      </div>
      <!-- Row 8 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >New Company with SME status only, TA</label
        >
        <div class="ml-4 flex flex-1 items-center">
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              placeholder="YYYY"
              class="field-value-small-input"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm">YYYY</div>
          </template>
          <span class="mx-2 font-medium">To</span>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              placeholder="YYYY"
              class="field-value-small-input"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm">YYYY</div>
          </template>
        </div>
      </div>
      <!-- Row 9 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Financial year end</label>
        <template v-if="!isPdfExport">
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-input"
          />
        </template>
        <template v-else>
          <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm">DD/MM/YYYY</div>
        </template>
      </div>
      <!-- Row 10 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">1 to 11 Installments</label>
        <template v-if="!isPdfExport">
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="field-value-input"
          />
        </template>
        <template v-else>
          <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
        </template>
      </div>
      <!-- Row 11 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Final installment</label>
        <template v-if="!isPdfExport">
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="field-value-input"
          />
        </template>
        <template v-else>
          <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
        </template>
      </div>
    </div>

    <!-- New section: New company or change of financial year end -->
    <div class="mb-12 mt-8">
      <h3 class="mb-4 border-b text-lg font-semibold">
        New company or change of financial year end
      </h3>
      <div class="space-y-4">
        <!-- Fields for this section -->
        <div class="flex items-center">
          <label class="w-1/2 font-medium"
            >Following assessment basis period</label
          >
          <div class="ml-4 flex flex-1 items-center">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                placeholder="DD/MM/YYYY"
                class="field-value-small-input"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm">DD/MM/YYYY</div>
            </template>
            <span class="mx-2 font-medium">To</span>
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                placeholder="DD/MM/YYYY"
                class="field-value-small-input"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm">DD/MM/YYYY</div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/2 font-medium">Next assessment basis period</label>
          <div class="ml-4 flex flex-1 items-center">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                placeholder="DD/MM/YYYY"
                class="field-value-small-input"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm">DD/MM/YYYY</div>
            </template>
            <span class="mx-2 font-medium">To</span>
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                placeholder="DD/MM/YYYY"
                class="field-value-small-input"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm">DD/MM/YYYY</div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <span class="font-bold">-- End of CP204 --</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Checkbox } from '@vben-core/shadcn-ui';
import { usePdfExportContext } from '#/composables/usePdfExportContext';

const { isPdfExport } = usePdfExportContext();
</script>

<style scoped>
.cp204-form-template {
  line-height: 1.4;
}

.field-value-input {
  @apply ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm;
}

.field-value-small-input {
  @apply flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm;
}

.print-checkbox {
  @apply h-4 w-4 border-2 border-gray-700;
}

/* PDF export helper class */
.pdf-text-only {
  display: inline-block;
  line-height: 1.4;
  color: #000;
}

/* Ensure borders are visible in PDF export */
@media print {
  .cp204-form-template {
    font-size: 12px;
    color: black;
  }
  
  .pdf-text-only {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .border-gray-400 {
    border-color: #000 !important;
  }
}
</style>

