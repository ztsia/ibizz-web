<template>
  <div class="hk-pc4-form-template bg-white p-6 text-sm">
    <!-- Form Header -->
    <div class="mb-6">
      <div class="bg-gray-600 px-4 py-2 text-center text-white">
        <div class="text-lg font-bold">
          HK-PC4: COMPUTATION OF STATUTORY INCOME FOR A COMPANY WHICH HAS BEEN
        </div>
        <div class="text-lg font-bold">
          GRANTED INVESTMENT TAX ALLOWANCE (ITA) INCENTIVE/P.U. (A) 370/2021
        </div>
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
            class="w-full border border-gray-400 px-2 py-1 text-sm focus:outline-none"
            placeholder="Enter company name"
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
              class="w-32 border border-gray-400 px-2 py-1 text-center text-sm focus:outline-none"
              placeholder="TIN Number"
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
              class="w-40 border border-gray-400 px-2 py-1 text-center text-sm focus:outline-none"
              placeholder="Registration Number"
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
                class="h-4 w-4 border border-gray-400"
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
              class="w-16 border border-gray-400 px-2 py-1 text-center text-sm focus:outline-none"
              placeholder="Year"
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
              class="w-80 border border-gray-400 px-2 py-1 text-sm focus:outline-none"
              placeholder="Business Activity Description"
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
              class="w-20 border border-gray-400 px-2 py-1 text-center text-sm focus:outline-none"
              placeholder="Code"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Section A: Adjusted Business Income -->
    <div class="mb-6">
      <div class="mb-4">
        <div
          class="flex items-center justify-between border-b border-black pb-2"
        >
          <div class="flex items-center">
            <span class="mr-4 font-bold">A.</span>
            <span class="font-medium">1. Adjusted Business Income</span>
          </div>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
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
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span>3. TOTAL (A1 + A2)</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
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
          class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
          placeholder="0.00"
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
          class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
          placeholder="0.00"
        />
      </div>
      <div class="ml-8 mt-2">
        <span class="font-medium">LESS:</span>
      </div>
    </div>

    <!-- Section D: Computation of Claim on Investment Tax Allowance -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-4 font-bold">D.</span>
          <span class="font-medium"
            >COMPUTATION OF CLAIM ON INVESTMENT TAX ALLOWANCE (ITA)/P.U. (A)
            370/2021</span
          >
        </div>
      </div>

      <div class="ml-8 space-y-4">
        <div class="flex items-center justify-between">
          <span>1. Balance of ITA brought forward</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span>2. ITA for current year:</span>
            <input
              type="number"
              readonly
              class="ml-4 w-20 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0"
            />
            <span class="mx-2">%</span>
            <span class="mx-2">x</span>
            <span class="mx-2">C</span>
            <span class="mx-2">=</span>
          </div>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>
        <div class="ml-8 text-xs text-gray-600">
          (Qualifying capital expenditure)
        </div>

        <div class="flex items-center justify-between">
          <span>3. TOTAL (D1 + D2)</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>

    <!-- Section E: Restriction on Statutory Income -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="mr-4 font-bold">E.</span>
          <span class="font-medium">Restriction on Statutory Income:</span>
          <input
            type="number"
            readonly
            class="ml-4 w-20 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0"
          />
          <span class="mx-2">%</span>
          <span class="mx-2">x</span>
          <span class="mx-2">C</span>
          <span class="mx-2">=</span>
        </div>
        <input
          type="number"
          readonly
          class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
          placeholder="0.00"
        />
      </div>
    </div>

    <!-- Section F: Investment Tax Allowance absorbed -->
    <div class="mb-6">
      <div class="flex items-center justify-between border-b border-black pb-2">
        <div class="flex items-center">
          <span class="mr-4 font-bold">F.</span>
          <span class="font-medium">Investment Tax Allowance absorbed</span>
        </div>
        <input
          type="number"
          readonly
          class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
          placeholder="0.00"
        />
      </div>
      <div class="ml-8 mt-2 text-xs text-gray-600">
        (Restricted to the amount in E)
      </div>
    </div>

    <!-- Section G: Taxable Statutory Income -->
    <div class="mb-6">
      <div class="flex items-center justify-between border-b border-black pb-2">
        <div class="flex items-center">
          <span class="mr-4 font-bold">G.</span>
          <span class="font-medium">TAXABLE STATUTORY INCOME (C - F)</span>
        </div>
        <input
          type="number"
          readonly
          class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
          placeholder="0.00"
        />
      </div>
    </div>

    <!-- Form Footer Page 1 -->
    <div class="mt-8 text-center">
      <span class="font-bold">HK-PC4 1/2</span>
    </div>

    <!-- Page Break -->
    <div class="my-8 border-t-2 border-dashed border-gray-400"></div>

    <!-- Page 2 Content -->
    <!-- Section H: Adjustment of Investment Tax Allowance -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-4 font-bold">H.</span>
          <span class="font-medium"
            >ADJUSTMENT OF INVESTMENT TAX ALLOWANCE/P.U. (A) 370/2021</span
          >
        </div>
      </div>

      <div class="ml-8 space-y-4">
        <div class="flex items-center justify-between">
          <span>1. Balance brought forward</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="mb-2">
          <span class="font-medium">ADD:</span>
        </div>

        <div class="flex items-center justify-between">
          <span>2. Current year claim</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>3. TOTAL (H1 + H2)</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span>4. Claim absorbed in the current year</span><br />
            <span class="ml-4 text-xs text-gray-600">(amount from F)</span>
          </div>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>5. Balance carried forward (H3 - H4)</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>

    <!-- Horizontal Line Separator -->
    <div class="my-6 border-t border-black"></div>

    <!-- Section J: Adjustment of Capital Allowance -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-4 font-bold">J.</span>
          <span class="font-medium">ADJUSTMENT OF CAPITAL ALLOWANCE</span>
        </div>
      </div>

      <div class="ml-8 space-y-4">
        <div class="flex items-center justify-between">
          <span>1. Balance brought forward</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
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
            class="w-24 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>3. TOTAL (J1 - J2)</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
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
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>5. Capital Allowance</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>6. TOTAL (J3 + J4 + J5)</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
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
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>8. Balance carried forward (J6 - J7)</span>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>

    <!-- Form Footer Page 2 -->
    <div class="mt-8 text-center">
      <span class="font-bold">HK-PC4 2/2</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
// HK-PC4 Form Template - Computation of Statutory Income for Company with ITA Incentive
// This is a non-editable visual representation of the official form
</script>

<style scoped>
.hk-pc4-form-template {
  /* Ensure consistent spacing and typography */
  line-height: 1.4;
}

/* Print-friendly styles */
@media print {
  .hk-pc4-form-template {
    font-size: 12px;
    color: black;
  }
}
</style>
