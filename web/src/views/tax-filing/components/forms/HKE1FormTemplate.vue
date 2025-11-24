<template>
  <div class="hke1-form-template bg-white p-6">
    <!-- Form Header -->
    <div class="mb-6 text-center">
      <div class="bg-gray-600 p-2 text-lg font-bold text-white">
        HK-E1: SUMMARY OF REINVESTMENT ALLOWANCE UNDER SCHEDULE 7A
      </div>
    </div>

    <!-- Schedule 7A Allowance During Qualifying Period -->
    <div class="mb-6">
      <div class="mb-2 bg-gray-500 p-2 font-semibold text-white">
        SCHEDULE 7A ALLOWANCE DURING THE QUALIFYING PERIOD
      </div>

      <table :class="['w-full border-collapse border border-gray-400 text-sm', isPdfExport ? 'pdf-text-only' : '']">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-32 border border-gray-400 p-2 text-center">
              TYPE OF RA
            </th>
            <th class="w-24 border border-gray-400 p-2 text-center">
              (a)<br />BALANCE BROUGHT FORWARD
            </th>
            <th class="w-32 border border-gray-400 p-2 text-center">
              (b)<br />AMOUNT OF ALLOWANCE ENTITLED TO BE CLAIMED IN RESPECT OF
              CAPITAL EXPENDITURE INCURRED IN THE CURRENT YEAR OF ASSESSMENT
            </th>
            <th class="w-24 border border-gray-400 p-2 text-center">
              (c)<br />AMOUNT WITHDRAWN PURSUANT TO PARAGRAPH 2A OF SCHEDULE 7A
            </th>
            <th class="w-32 border border-gray-400 p-2 text-center">
              (d)<br />AMOUNT CANNOT BE CARRIED FORWARD DUE TO CESSATION OF
              BUSINESS OF THE QUALIFYING PROJECT
            </th>
            <th class="w-24 border border-gray-400 p-2 text-center">
              (e)<br />AMOUNT ABSORBED IN THE CURRENT YEAR OF ASSESSMENT
            </th>
            <th class="w-24 border border-gray-400 p-2 text-center">
              (f)<br />BALANCE CARRIED FORWARD
            </th>
          </tr>
          <tr class="bg-gray-100">
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs">
              ( f = a + b - c - d - e )
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="h-8">
            <td class="border border-gray-400 p-2 font-medium">
              * (ORDINARY / PENJANA)
            </td>
            <td :class="['border border-gray-400 p-1', isPdfExport ? 'pdf-text-only' : '']">
              <template v-if="!isPdfExport">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
                />
              </template>
              <template v-else>
                <div class="pdf-text-only w-full px-1 py-1 text-right text-xs">0.00</div>
              </template>
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Schedule 7A Allowance After Qualifying Period -->
    <div class="mb-6">
      <div class="mb-2 bg-gray-500 p-2 font-semibold text-white">
        SCHEDULE 7A ALLOWANCE AFTER THE QUALIFYING PERIOD
      </div>

      <div class="mb-4 grid grid-cols-2 gap-4">
        <div class="bg-gray-100 p-3">
          <div class="mb-2 text-center font-semibold">
            ALLOWANCE CANNOT BE CARRIED FORWARD AND<br />
            ALLOWANCE DISREGARDED / ABSORBED UNTIL THE YEAR<br />
            OF ASSESSMENT PRECEDING THE CURRENT YEAR OF<br />
            ASSESSMENT
          </div>
        </div>
        <div class="bg-gray-100 p-3">
          <div class="mb-2 text-center font-semibold">
            ALLOWANCE CANNOT BE CARRIED FORWARD AND<br />
            ALLOWANCE DISREGARDED / ABSORBED IN THE<br />
            CURRENT YEAR OF ASSESSMENT
          </div>
        </div>
      </div>

      <table :class="['w-full border-collapse border border-gray-400 text-sm', isPdfExport ? 'pdf-text-only' : '']">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-24 border border-gray-400 p-2 text-center">
              FIRST YEAR OF ASSESSMENT FOR THE PURPOSE OF PARAGRAPH 4B OF
              SCHEDULE 7A
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              TYPE OF RA *
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (g)<br />AMOUNT OF ALLOWANCE
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (h)<br />AMOUNT WITHDRAWN PURSUANT TO PARAGRAPH 2A OF SCHEDULE 7A
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (i)<br />AMOUNT CANNOT BE CARRIED FORWARD DUE TO CESSATION OF
              BUSINESS OF THE QUALIFYING PROJECT
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (k)<br />AMOUNT ABSORBED
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (m)<br />BALANCE OF ALLOWANCE
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (n)<br />ALLOWANCE WITHDRAWN PURSUANT TO PARAGRAPH 2A OF SCHEDULE
              7A
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (o)<br />AMOUNT CANNOT BE CARRIED FORWARD DUE TO CESSATION OF
              BUSINESS OF THE QUALIFYING PROJECT
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (p)<br />AMOUNT DISREGARDED UNDER PARAGRAPH 4B OF SCHEDULE 7A
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (q)<br />AMOUNT ABSORBED
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (r)<br />BALANCE CARRIED FORWARD
            </th>
          </tr>
          <tr class="bg-gray-100">
            <th class="border border-gray-400 p-1 text-xs">
              (ORDINARY / PENJANA)
            </th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs">
              ( m = g - h - i - k )
            </th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs"></th>
            <th class="border border-gray-400 p-1 text-xs">
              ( s = m - n - p - q - r )
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="h-8">
            <td class="border border-gray-400 p-2 font-medium">
              2018 &amp; before
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="text"
                readonly
                placeholder="Type"
                class="w-full border-0 bg-transparent px-1 py-1 text-center text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-300 p-2"></td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
          <tr class="h-8">
            <td class="border border-gray-400 p-2 font-medium">2019</td>
            <td class="border border-gray-400 p-1">
              <input
                type="text"
                readonly
                placeholder="Type"
                class="w-full border-0 bg-transparent px-1 py-1 text-center text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-300 p-2"></td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
          <tr class="h-8">
            <td class="border border-gray-400 p-2 font-medium">2020</td>
            <td class="border border-gray-400 p-1">
              <input
                type="text"
                readonly
                placeholder="Type"
                class="w-full border-0 bg-transparent px-1 py-1 text-center text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-300 p-2"></td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
          <tr class="h-8">
            <td class="border border-gray-400 p-2 font-medium">2021</td>
            <td class="border border-gray-400 p-1">
              <input
                type="text"
                readonly
                placeholder="Type"
                class="w-full border-0 bg-transparent px-1 py-1 text-center text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-300 p-2"></td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
          <tr class="h-8">
            <td class="border border-gray-400 p-2 font-medium">2022</td>
            <td class="border border-gray-400 p-1">
              <input
                type="text"
                readonly
                placeholder="Type"
                class="w-full border-0 bg-transparent px-1 py-1 text-center text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-300 p-2"></td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-transparent px-1 py-1 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Footer -->
    <div class="mt-6 text-right">
      <div class="font-semibold">HK-E1</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// This is a read-only form template for HKE1
// No interactive functionality needed
import { usePdfExportContext } from '#/composables/usePdfExportContext';

const { isPdfExport } = usePdfExportContext();
</script>

<style scoped>
.hke1-form-template {
  font-family: 'Arial', sans-serif;
  max-width: 100%;
  overflow-x: auto;
}

.hke1-form-template table {
  font-size: 10px;
}

.hke1-form-template th,
.hke1-form-template td {
  white-space: nowrap;
}

.pdf-text-only {
  display: block;
  color: #000;
}

@media print {
  .pdf-text-only {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .border-gray-400 {
    border-color: #000 !important;
  }
}

@media (max-width: 768px) {
  .hke1-form-template {
    font-size: 9px;
  }
}
</style>
