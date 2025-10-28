<template>
  <div class="hk-pc6-form-template bg-white p-6 text-sm">
    <!-- Form Header -->
    <div class="mb-6">
      <div class="bg-gray-600 px-4 py-2 text-center text-white">
        <div class="font-bold">
          HK-PC6: COMPUTATION OF STATUTORY INCOME FOR OPERATIONAL
        </div>
        <div class="font-bold">HEADQUARTERS COMPANY</div>
      </div>
    </div>

    <!-- Subheader -->
    <div class="mb-6 text-center">
      <div class="bg-blue-600 px-4 py-2 font-bold text-white">
        PROVISION OF SERVICES IN MALAYSIA BY OPERATIONAL HEADQUARTERS COMPANY
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
            placeholder="Enter company name"
            class="w-full border border-gray-400 bg-white px-2 py-1 text-sm focus:outline-none"
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
              placeholder="000000000000"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
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
              placeholder="000000000000000"
              class="w-40 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
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
        </div>
        <div class="flex items-center">
          <label class="font-medium">Year of Assessment</label>
          <div class="ml-4">
            <input
              type="text"
              readonly
              maxlength="4"
              placeholder="2024"
              class="w-16 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
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
              placeholder="Enter business activity"
              class="w-80 border border-gray-400 bg-white px-2 py-1 text-sm focus:outline-none"
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
              placeholder="00000"
              class="w-20 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
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
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>
        <div class="ml-8 mt-2 text-xs text-gray-600">
          (If loss, fill in '0' in this box and transfer the amount<br />
          of adjusted loss to Working Sheet HK-F2)
        </div>
      </div>

      <div class="ml-8">
        <div class="mb-2">
          <span class="font-medium">ADD:</span>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span>2. Balancing Charge</span>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span>3. TOTAL (A1 + A2)</span>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
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
        <div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
          />
        </div>
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
        <div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
          />
        </div>
      </div>
      <div class="ml-8 mt-2">
        <span class="font-medium">LESS:</span>
      </div>
    </div>

    <!-- Section D: Tax exempt Statutory Income -->
    <div class="mb-6">
      <div class="flex items-center justify-between border-b border-black pb-2">
        <div class="flex items-center">
          <span class="mr-4 font-bold">D.</span>
          <span class="font-medium">Tax exempt Statutory Income</span>
        </div>
        <div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
          />
        </div>
      </div>
      <div class="ml-8 mt-2 text-xs text-gray-600">(amount from F4)</div>
    </div>

    <!-- Section E: Taxable Statutory Income -->
    <div class="mb-6">
      <div class="flex items-center justify-between border-b border-black pb-2">
        <div class="flex items-center">
          <span class="mr-4 font-bold">E.</span>
          <span class="font-medium">TAXABLE STATUTORY INCOME (C - D)</span>
        </div>
        <div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Form Footer -->
    <div class="mt-8 text-center">
      <span class="font-bold">HK-PC6 1/2</span>
    </div>

    <!-- Page Break -->
    <div class="my-8 border-t-2 border-dashed border-gray-400"></div>
    <div class="mb-6 text-center text-sm text-gray-600">--- Page 2 ---</div>

    <!-- Section F: Computation of Tax Exempt Statutory Income -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-4 font-bold">F.</span>
          <span class="font-medium"
            >COMPUTATION OF TAX EXEMPT STATUTORY INCOME</span
          >
        </div>
      </div>

      <div class="ml-8 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <span>1(a) Amount of all income from the</span><br />
            <span class="ml-4">provision of qualifying services</span>
          </div>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span>1(b) F1(a)</span>
            <span class="mx-2">×</span>
            <div class="flex flex-col items-center text-xs">
              <span>20</span>
              <hr class="w-6 border-black" />
              <span>80</span>
            </div>
          </div>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span>2. Amount of Gross Income</span><br />
            <span class="ml-4">from services in Malaysia</span>
          </div>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span>3. Amount of Statutory Income</span><br />
            <span class="ml-4">from services in Malaysia</span>
          </div>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-24 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span>4. Tax exempt Statutory Income:</span>
            <div class="mx-2 flex items-center text-xs">
              <span>F1(b)</span>
              <hr class="mx-1 w-4 border-black" />
              <span>F2</span>
            </div>
            <span class="mx-2">×</span>
            <span>F3</span>
            <span class="mx-2">=</span>
          </div>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Horizontal Line Separator -->
    <hr class="my-6 border-black" />

    <!-- Section G: Adjustment of Capital Allowance -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-4 font-bold">G.</span>
          <span class="font-medium">ADJUSTMENT OF CAPITAL ALLOWANCE</span>
        </div>
      </div>

      <div class="ml-8 space-y-4">
        <div class="flex items-center justify-between">
          <span>1. Balance brought forward</span>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
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
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-24 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span>3. TOTAL (G1 - G2)</span>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>

        <div class="mb-2">
          <span class="font-medium">ADD:</span>
        </div>

        <div class="flex items-center justify-between">
          <span>4. Balancing Allowance</span>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span>5. Capital Allowance</span>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span>6. TOTAL (G3 + G4 + G5)</span>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>

        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span>7. Claim absorbed in the current year</span><br />
            <span class="ml-4 text-xs text-gray-600">(amount from B)</span>
          </div>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span>8. Balance carried forward (G6 - G7)</span>
          <div>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Form Footer -->
    <div class="mt-8 text-center">
      <span class="font-bold">HK-PC6 2/2</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
// HK-PC6 Form Template - Computation of Statutory Income for Operational Headquarters Company
// This is a non-editable visual representation of the official form
</script>

<style scoped>
.hk-pc6-form-template {
  /* Ensure consistent spacing and typography */
  line-height: 1.4;
}

/* Print-friendly styles */
@media print {
  .hk-pc6-form-template {
    font-size: 12px;
    color: black;
  }
}
</style>
