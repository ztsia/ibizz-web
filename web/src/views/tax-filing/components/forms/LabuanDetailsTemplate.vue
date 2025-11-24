<template>
  <div class="form-container bg-white p-6 text-sm">
    <!-- Subsidiary Companies Section -->
    <div class="mb-6">
      <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
        Subsidiary Companies or Related Entities in the Federal Territory of
        Labuan
      </div>
      <table class="w-full border-collapse border border-gray-400 text-xs">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-400 p-2">Name of Company</th>
            <th class="border border-gray-400 p-2">Registration No.</th>
            <th class="border border-gray-400 p-2">Income Tax No</th>
            <th class="border border-gray-400 p-2">
              Transaction with Subsidiary Company/Related Entity(ies)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
          </tr>
          <tr>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
          </tr>
          <tr>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payments to Labuan Entities Section -->
    <div class="mb-6">
      <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
        Made Payments to Labuan Entity(ies)
      </div>
      <table class="w-full border-collapse border border-gray-400 text-xs">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-400 p-2">Type of Payment</th>
            <th class="border border-gray-400 p-2">
              Payment to Related Labuan Entity(ies)
            </th>
            <th class="border border-gray-400 p-2">Total of Payment (RM)</th>
            <th class="border border-gray-400 p-2">
              Amounts Allowed for Deduction [Exemption from the provisions of
              paragraph 39(1)(r) ITA under PUA 425/2021] (RM)
            </th>
            <th class="border border-gray-400 p-2">
              Amounts Allowed for Deduction (RM)
            </th>
            <th class="border border-gray-400 p-2">
              Amounts Not Allowed for Deduction under Paragraph 39(1)(r) (RM)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
          </tr>
          <tr>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
          </tr>
          <tr>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-left"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePdfExportContext } from '#/composables/usePdfExportContext';

const { isPdfExport } = usePdfExportContext();
</script>

<style scoped>
/* Ensure borders are visible in PDF export */
@media print {
  .pdf-text-only {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .border-gray-400 {
    border-color: #000 !important;
  }
}

.form-container {
  font-family: Arial, sans-serif;
}

/* PDF export helper class */
.pdf-text-only {
  display: inline-block;
  line-height: 1.4;
  color: #000;
}
</style>
