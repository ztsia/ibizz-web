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
            <input
              type="text"
              readonly
              class="w-full border-0 bg-transparent px-1 py-1 text-right focus:outline-none"
              placeholder="0.00"
            />
          </td>
          <td class="border border-gray-400 p-1">
            <input
              type="text"
              readonly
              class="w-full border-0 bg-transparent px-1 py-1 text-center focus:outline-none"
              placeholder="DD/MM/YYYY"
            />
          </td>
          <td class="border border-gray-400 p-1">
            <input
              type="text"
              readonly
              class="w-full border-0 bg-transparent px-1 py-1 focus:outline-none"
            />
          </td>
        </tr>
        <tr class="bg-gray-100 font-semibold">
          <td class="border border-gray-400 p-2">TOTAL</td>
          <td class="border border-gray-400 p-1">
            <input
              type="text"
              readonly
              class="w-full border-0 bg-transparent px-1 py-1 text-right focus:outline-none"
              placeholder="0.00"
            />
          </td>
          <td class="border border-gray-400 p-2"></td>
          <td class="border border-gray-400 p-2"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
// This is a view-only template for the Payment Instalments table.
</script>

<style scoped>
.payment-instalments-template {
  line-height: 1.4;
}
</style>
