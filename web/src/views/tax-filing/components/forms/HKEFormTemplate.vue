<template>
  <div class="hke-form-template bg-white p-6">
    <!-- Form Header -->
    <div class="mb-6 text-center">
      <div class="bg-gray-600 p-2 text-lg font-bold text-white">
        HK-E: PARTICULARS OF CAPITAL ALLOWANCES AND CHARGES UNDER SCHEDULE 3
      </div>
    </div>

    <!-- Business Section -->
    <div class="mb-8">
      <div class="mb-2 bg-gray-500 p-2 font-semibold text-white">
        PART X: BUSINESS
      </div>

      <!-- Table Header -->
      <table class="w-full border-collapse border border-gray-400 text-sm">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-12 border border-gray-400 p-2 text-left">No.</th>
            <th class="w-32 border border-gray-400 p-2 text-left">
              Business Identity
            </th>
            <th class="w-24 border border-gray-400 p-2 text-left">
              Business Code
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (A)<br />Balancing Charge
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (B)<br />Balance Brought Forward
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (C)<br />Amount Disregarded
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (D)<br />Balancing Allowance
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (E)<br />Capital Allowance
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (F)<br />Allowance Absorbed
            </th>
            <th class="w-24 border border-gray-400 p-2 text-center">
              (G)<br />Balance Carried Forward<br />(B - C + D + E - F)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i" class="h-8">
            <td class="border border-gray-400 p-2">
              <span v-if="i <= 4">{{
                ['i)', 'ii)', 'iii)', 'iv)'][i - 1]
              }}</span>
              <span v-else-if="i === 5">v)</span>
            </td>
            <td class="border border-gray-400 p-2">
              <span v-if="i <= 4">Business {{ i }}</span>
              <span v-else-if="i === 5">Business 5 + 6 and so forth</span>
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="text"
                readonly
                placeholder="Code"
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
          </tr>
          <tr class="bg-gray-100 font-semibold">
            <td colspan="3" class="border border-gray-400 p-2">TOTAL X:</td>
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
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Partnership Section -->
    <div class="mb-8">
      <div class="mb-2 bg-gray-500 p-2 font-semibold text-white">
        PART Y: PARTNERSHIP
      </div>

      <!-- Partnership Table -->
      <table class="w-full border-collapse border border-gray-400 text-sm">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-12 border border-gray-400 p-2 text-left">No.</th>
            <th class="w-32 border border-gray-400 p-2 text-left">
              Partnership Identity
            </th>
            <th class="w-32 border border-gray-400 p-2 text-left">
              Partnership Tax Identification No. (TIN)
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (A)<br />Balancing Charge
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (B)<br />Balance Brought Forward
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (C)<br />Amount Disregarded
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (D)<br />Balancing Allowance
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (E)<br />Capital Allowance
            </th>
            <th class="w-20 border border-gray-400 p-2 text-center">
              (F)<br />Allowance Absorbed
            </th>
            <th class="w-24 border border-gray-400 p-2 text-center">
              (G)<br />Balance Carried Forward<br />(B - C + D + E - F)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 3" :key="i" class="h-8">
            <td class="border border-gray-400 p-2">
              <span v-if="i === 1">i)</span>
              <span v-else-if="i === 2">ii)</span>
              <span v-else-if="i === 3">iii)</span>
            </td>
            <td class="border border-gray-400 p-2">
              <span v-if="i === 1">Partnership 1</span>
              <span v-else-if="i === 2">Partnership 2</span>
              <span v-else-if="i === 3">Partnership 3 + 4 and so forth</span>
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="text"
                readonly
                placeholder="TIN"
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
          </tr>
          <tr class="bg-gray-100 font-semibold">
            <td colspan="3" class="border border-gray-400 p-2">TOTAL Y:</td>
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
          </tr>
          <tr class="bg-gray-100 font-semibold">
            <td colspan="3" class="border border-gray-400 p-2">
              GRAND TOTAL ( X + Y ):
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
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Footer -->
    <div class="mt-6 text-right">
      <div class="font-semibold">HK-E</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// This is a read-only form template for HKE
// No interactive functionality needed
</script>

<style scoped>
.hke-form-template {
  font-family: 'Arial', sans-serif;
  max-width: 100%;
  overflow-x: auto;
}

.hke-form-template table {
  font-size: 11px;
}

.hke-form-template th,
.hke-form-template td {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .hke-form-template {
    font-size: 10px;
  }
}
</style>
