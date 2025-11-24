<template>
  <div class="cp204a-form-template bg-white p-6 text-sm">
    <div class="mb-6">
      <div
        class="flex items-center justify-between bg-gray-600 px-4 py-2 text-white"
      >
        <span class="font-bold">CP204A:</span>
        <span class="font-bold">REVISION OF ESTIMATION OF TAX PAYABLE</span>
      </div>
    </div>

    <!-- 1st Revision -->
    <div class="mb-8">
      <h3 class="mb-4 border-b text-lg font-semibold">1st Revision</h3>
      <div class="space-y-4">
        <div class="flex items-center">
          <Checkbox :checked="false" disabled class="h-4 w-4 border-2 border-gray-700" />
          <label class="ml-2 font-medium"
            >Application made before the 15th day of the sixth month</label
          >
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">CP204A Date</label>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              placeholder="DD/MM/YYYY"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm">DD/MM/YYYY</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Revised estimated tax payable</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Less Tax paid to date</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Balance estimated tax payable</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium"
            >Revised installment tax payment 6th to 11th installment @</label
          >
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Final Installment</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
      </div>
    </div>

    <!-- 2nd Revision -->
    <div class="mb-8">
      <h3 class="mb-4 border-b text-lg font-semibold">2nd Revision</h3>
      <div class="space-y-4">
        <div class="flex items-center">
          <Checkbox :checked="false" disabled class="h-4 w-4 border-2 border-gray-700" />
          <label class="ml-2 font-medium"
            >Application made before the 15th day of the ninth month</label
          >
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">CP204A Date</label>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              placeholder="DD/MM/YYYY"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm">DD/MM/YYYY</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Revised estimated tax payable</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Less Tax paid to date</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Balance estimated tax payable</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium"
            >Revised installment tax payment 9th to 11th installment @</label
          >
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Final Installment</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
      </div>
    </div>

    <!-- 3rd Revision -->
    <div class="mb-8">
      <h3 class="mb-4 border-b text-lg font-semibold">3rd Revision</h3>
      <div class="space-y-4">
        <div class="flex items-center">
          <Checkbox :checked="false" disabled class="h-4 w-4 border-2 border-gray-700" />
          <label class="ml-2 font-medium"
            >Application made before the 15th day of the eleventh month</label
          >
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">CP204A Date</label>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              placeholder="DD/MM/YYYY"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm">DD/MM/YYYY</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Revised estimated tax payable</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Less Tax paid to date</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Balance estimated tax payable</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium"
            >Revised installment tax payment 11th installment @</label
          >
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Final Installment</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm text-right">0.00</div>
          </template>
        </div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <span class="font-bold">-- End of CP204A --</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Checkbox } from '@vben-core/shadcn-ui';
import { usePdfExportContext } from '#/composables/usePdfExportContext';

const { isPdfExport } = usePdfExportContext();
</script>

<style scoped>
.cp204a-form-template {
  line-height: 1.4;
}

.pdf-text-only {
  display: inline-block;
  line-height: 1.4;
  color: #000;
}

@media print {
  .cp204a-form-template {
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
