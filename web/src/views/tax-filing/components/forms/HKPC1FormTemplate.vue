<template>
  <div class="hk-pc1-form-template bg-white p-6">
    <!-- Form Header -->
    <div class="mb-6 text-center">
      <div class="bg-gray-600 p-2 text-lg font-bold text-white">
        HK-PC1: COMPUTATION OF STATUTORY INCOME FOR BUSINESS
      </div>
    </div>

    <!-- Basic Information Section -->
    <div class="mb-6 space-y-3">
      <!-- Name Field -->
      <div class="flex items-center">
        <label class="w-16 text-sm font-medium">Name</label>
        <div class="ml-4 flex-1">
          <input
            type="text"
            readonly
            class="h-6 w-full border border-gray-400 bg-white px-2 text-sm focus:outline-none"
            placeholder="Enter name here"
          />
        </div>
      </div>

      <!-- TIN and Registration No -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="w-16 text-sm font-medium">TIN</label>
          <div class="ml-4">
            <input
              type="text"
              readonly
              class="h-6 w-32 border border-gray-400 bg-white px-2 text-center text-sm focus:outline-none"
              placeholder="000000000000"
              maxlength="12"
            />
          </div>
        </div>
        <div class="flex items-center">
          <label class="text-sm font-medium">Registration No.</label>
          <div class="ml-4">
            <input
              type="text"
              readonly
              class="h-6 w-40 border border-gray-400 bg-white px-2 text-center text-sm focus:outline-none"
              placeholder="000000000000000"
              maxlength="15"
            />
          </div>
        </div>
      </div>

      <!-- Business and Year of Assessment -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="text-sm font-medium">Business</label>
          <div class="ml-4 flex space-x-2">
            <div v-for="i in 5" :key="i" class="flex flex-col items-center">
              <input
                type="checkbox"
                disabled
                class="h-5 w-5 rounded-none border border-gray-400"
              />
              <span class="mt-1 text-xs">{{ i }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center">
          <label class="text-sm font-medium">Year of Assessment</label>
          <div class="ml-4">
            <input
              type="text"
              readonly
              class="h-6 w-16 border border-gray-400 bg-white px-2 text-center text-sm focus:outline-none"
              placeholder="2024"
              maxlength="4"
            />
          </div>
        </div>
      </div>

      <!-- Type of Business Activity and Business Code -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="text-sm font-medium"
            >Type of<br />Business Activity</label
          >
          <div class="ml-4">
            <input
              type="text"
              readonly
              class="h-6 w-64 border border-gray-400 bg-white px-2 text-sm focus:outline-none"
              placeholder="Enter business activity type"
            />
          </div>
        </div>
        <div class="flex items-center">
          <label class="text-sm font-medium">Business Code</label>
          <div class="ml-4">
            <input
              type="text"
              readonly
              class="h-6 w-20 border border-gray-400 bg-white px-2 text-center text-sm focus:outline-none"
              placeholder="00000"
              maxlength="5"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Section A: Adjusted Business Income -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="mr-2 font-bold">A.</span>
            <span class="text-sm font-medium">1. Adjusted Business Income</span>
          </div>
          <input
            type="number"
            readonly
            class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>
        <div class="ml-6 mt-1 text-xs text-gray-600">
          (If loss, fill in '0' in this box and transfer the amount<br />
          of adjusted loss to Working Sheet HK-F1)
        </div>
      </div>

      <div class="ml-6 space-y-2">
        <div class="text-sm font-medium">ADD:</div>

        <div class="flex items-center justify-between">
          <span class="text-sm">2. Balancing Charge</span>
          <input
            type="number"
            readonly
            class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm">3. TOTAL (A1 + A2)</span>
          <input
            type="number"
            readonly
            class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="text-sm font-medium">LESS:</div>
      </div>
    </div>

    <!-- Section B: Capital Allowance -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="mr-2 font-bold">B.</span>
          <span class="text-sm font-medium">Capital Allowance absorbed</span>
        </div>
        <input
          type="number"
          readonly
          class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
          placeholder="0.00"
        />
      </div>
      <div class="ml-6 mt-1 text-xs text-gray-600">
        (Restricted to the amount in A3)
      </div>
    </div>

    <!-- Section C: Statutory Income -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="mr-2 font-bold">C.</span>
          <span class="text-sm font-medium">STATUTORY INCOME (A3 - B)</span>
        </div>
        <input
          type="number"
          readonly
          class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
          placeholder="0.00"
        />
      </div>
    </div>

    <!-- Section D: Adjustment of Capital Allowance -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-2 font-bold">D.</span>
          <span class="text-sm font-medium"
            >ADJUSTMENT OF CAPITAL ALLOWANCE</span
          >
        </div>
      </div>

      <div class="ml-6 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm">1. Balance brought forward</span>
          <input
            type="number"
            readonly
            class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="text-sm font-medium">LESS:</div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <span>2. Amount disregarded due to substantial</span><br />
            <span class="ml-4 text-xs text-gray-600"
              >change in shareholding (if relevant)</span
            >
          </div>
          <input
            type="number"
            readonly
            class="h-6 w-32 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm">3. TOTAL (D1 - D2)</span>
          <input
            type="number"
            readonly
            class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="text-sm font-medium">ADD:</div>

        <div class="flex items-center justify-between">
          <span class="text-sm">4. Balancing Allowance</span>
          <input
            type="number"
            readonly
            class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm">5. Capital Allowance</span>
          <input
            type="number"
            readonly
            class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm">6. TOTAL (D3 + D4 + D5)</span>
          <input
            type="number"
            readonly
            class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="text-sm font-medium">LESS:</div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <span>7. Claim absorbed in the current year</span><br />
            <span class="ml-4 text-xs text-gray-600">(amount from B)</span>
          </div>
          <input
            type="number"
            readonly
            class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm">8. Balance carried forward (D6 - D7)</span>
          <input
            type="number"
            readonly
            class="h-6 w-40 border border-gray-400 bg-white px-2 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>

    <!-- Form Footer -->
    <div class="mt-6 text-right">
      <div class="font-semibold">HK-PC1</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// HK-PC1 Form Template - Computation of Statutory Income for Business
// This is a non-editable visual representation of the official form
</script>

<style scoped>
.hk-pc1-form-template {
  font-family: 'Arial', sans-serif;
  max-width: 100%;
  overflow-x: auto;
  line-height: 1.4;
}

/* Print-friendly styles */
@media print {
  .hk-pc1-form-template {
    font-size: 12px;
    color: black;
  }
}

@media (max-width: 768px) {
  .hk-pc1-form-template {
    font-size: 11px;
  }
}
</style>
