<template>
  <div class="payment-instalments-template bg-white p-6 text-sm">
    <div class="mb-6">
      <div
        class="flex items-center justify-between bg-gray-600 px-4 py-2 text-white"
      >
        <span class="font-bold">CP204 - PAYMENT</span>
      </div>
    </div>
    <table class="w-full border-collapse border border-gray-400 text-sm">
      <thead>
        <tr class="bg-gray-200">
          <th class="border border-gray-400 p-2 text-left">Instalment</th>
          <th class="border border-gray-400 p-2 text-left">Amount (RM)</th>
          <th class="border border-gray-400 p-2 text-left">Due Date Payable</th>
          <th class="border border-gray-400 p-2 text-left">Bill</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in 12" :key="i">
          <td class="border border-gray-400 p-2">{{ i }}</td>
          <td class="border border-gray-400 p-1">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                class="w-full border-0 bg-transparent px-1 py-1 text-right focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </td>
          <td class="border border-gray-400 p-1">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                class="w-full border-0 bg-transparent px-1 py-1 text-center focus:outline-none"
                placeholder="DD/MM/YYYY"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only h-full w-full bg-white p-1 text-center text-sm"
              >
                DD/MM/YYYY
              </div>
            </template>
          </td>
          <td class="border border-gray-400 p-1">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                class="w-full border-0 bg-transparent px-1 py-1 focus:outline-none"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
              ></div>
            </template>
          </td>
        </tr>
        <tr class="bg-gray-100 font-semibold">
          <td class="border border-gray-400 p-2">TOTAL</td>
          <td class="border border-gray-400 p-1">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                class="w-full border-0 bg-transparent px-1 py-1 text-right focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </td>
          <td class="border border-gray-400 p-2"></td>
          <td class="border border-gray-400 p-2"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { usePdfExportContext } from '#/composables/usePdfExportContext';

const { isPdfExport } = usePdfExportContext();
</script>

<style scoped>
.payment-instalments-template {
  line-height: 1.4;
}

/* PDF export helper class */
.pdf-text-only {
  display: inline-block;
  line-height: 1.4;
  color: #000;
}

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
</style>
