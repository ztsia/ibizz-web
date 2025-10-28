<template>
  <div class="hk-pc1a-form-template bg-white p-6 text-sm">
    <!-- Form Header -->
    <div class="mb-6">
      <div
        class="flex items-center justify-between bg-gray-600 px-4 py-2 text-white"
      >
        <span class="font-bold">HK-PC1A:</span>
        <span class="font-bold"
          >COMPUTATION OF STATUTORY INCOME FOR PARTNERSHIP</span
        >
      </div>
    </div>

    <!-- Basic Information Section -->
    <div class="mb-6 space-y-4">
      <!-- Name Field -->
      <div class="flex items-center">
        <label class="w-16 font-medium">Name</label>
        <div class="ml-4 flex-1">
          <input
            type="text"
            readonly
            placeholder="Enter partnership name"
            class="w-full border border-gray-400 bg-white px-3 py-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      <!-- TIN and Registration No -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="w-16 font-medium">TIN</label>
          <div class="ml-4">
            <input
              type="text"
              readonly
              maxlength="12"
              placeholder="TIN Number"
              class="w-32 border border-gray-400 bg-white px-3 py-2 text-center text-sm focus:outline-none"
            />
          </div>
        </div>
        <div class="flex items-center">
          <label class="font-medium">Registration No.</label>
          <div class="ml-4">
            <input
              type="text"
              readonly
              maxlength="15"
              placeholder="Registration Number"
              class="w-40 border border-gray-400 bg-white px-3 py-2 text-center text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Business and Year of Assessment -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="font-medium">Business</label>
          <div class="ml-4 flex space-x-2">
            <div v-for="i in 5" :key="i" class="flex flex-col items-center">
              <input
                type="checkbox"
                disabled
                class="h-6 w-6 border border-gray-400"
              />
              <span class="mt-1 text-xs">{{ i }}</span>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-xs text-red-600">
              ▲ Enter 'X' in the relevant box
            </div>
          </div>
        </div>
        <div class="flex items-center">
          <label class="font-medium">Year of Assessment</label>
          <div class="ml-4">
            <input
              type="text"
              readonly
              maxlength="4"
              placeholder="YYYY"
              class="w-16 border border-gray-400 bg-white px-3 py-2 text-center text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Type of Business Activity and Business Code -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="font-medium">Type of<br />Business Activity</label>
          <div class="ml-4">
            <input
              type="text"
              readonly
              placeholder="Business activity description"
              class="w-80 border border-gray-400 bg-white px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>
        <div class="flex items-center">
          <label class="font-medium">Business Code</label>
          <div class="ml-4">
            <input
              type="text"
              readonly
              maxlength="5"
              placeholder="Code"
              class="w-20 border border-gray-400 bg-white px-3 py-2 text-center text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Section A: Adjusted Partnership Income -->
    <div class="mb-6">
      <div class="mb-4">
        <div
          class="flex items-center justify-between border-b border-black pb-2"
        >
          <div class="flex items-center">
            <span class="mr-4 font-bold">A.</span>
            <span class="font-medium">1. Adjusted Partnership Income</span>
          </div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>
        <div class="ml-8 mt-2 text-xs text-gray-600">
          (If loss, fill in '0' in this box and transfer the amount<br />
          of adjusted loss to Working Sheet HK-F1)
        </div>
      </div>

      <div class="ml-8">
        <div class="mb-2">
          <span class="font-medium">ADD:</span>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span>2. Balancing Charge</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span>3. TOTAL (A1 + A2)</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>
        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>
      </div>
    </div>

    <!-- Section B: Capital Allowance -->
    <div class="mb-6">
      <div class="flex items-center justify-between border-b border-black pb-2">
        <div class="flex items-center">
          <span class="mr-4 font-bold">B.</span>
          <span class="font-medium">Capital Allowance absorbed</span>
        </div>
        <input
          type="number"
          readonly
          placeholder="0.00"
          class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
        />
      </div>
      <div class="ml-8 mt-2 text-xs text-gray-600">
        (Restricted to the amount in A3)
      </div>
    </div>

    <!-- Section C: Statutory Income -->
    <div class="mb-6">
      <div class="flex items-center justify-between border-b border-black pb-2">
        <div class="flex items-center">
          <span class="mr-4 font-bold">C.</span>
          <span class="font-medium">STATUTORY INCOME (A3 - B)</span>
        </div>
        <input
          type="number"
          readonly
          placeholder="0.00"
          class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
        />
      </div>
    </div>

    <!-- Section D: Adjustment of Capital Allowance -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-4 font-bold">D.</span>
          <span class="font-medium">ADJUSTMENT OF CAPITAL ALLOWANCE</span>
        </div>
      </div>

      <div class="ml-8 space-y-4">
        <div class="flex items-center justify-between">
          <span>1. Balance brought forward</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span>2. Amount disregarded due to substantial</span><br />
            <span class="ml-4 text-xs text-gray-600"
              >change in shareholding (if relevant)</span
            >
          </div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-24 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>3. TOTAL (D1 - D2)</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="mb-2">
          <span class="font-medium">ADD:</span>
        </div>

        <div class="flex items-center justify-between">
          <span>4. Balancing Allowance</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>5. Capital Allowance</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>6. TOTAL (D3 + D4 + D5)</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span>7. Claim absorbed in the current year</span><br />
            <span class="ml-4 text-xs text-gray-600">(amount from B)</span>
          </div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>8. Balance carried forward (D6 - D7)</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Form Footer -->
    <div class="mt-8 text-center">
      <span class="font-bold">HK-PC1A</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
// HK-PC1A Form Template - Computation of Statutory Income for Partnership
// This is a non-editable visual representation of the official form
</script>

<style scoped>
.hk-pc1a-form-template {
  /* Ensure consistent spacing and typography */
  line-height: 1.4;
}

/* Print-friendly styles */
@media print {
  .hk-pc1a-form-template {
    font-size: 12px;
    color: black;
  }
}
</style>
