<template>
  <div class="hk-pc2-form-template bg-white p-6 text-sm">
    <!-- Form Header -->
    <div class="mb-6">
      <div
        class="flex items-center justify-between bg-gray-600 px-4 py-2 text-white"
      >
        <span class="font-bold">HK-PC2:</span>
        <span class="font-bold"
          >COMPUTATION OF STATUTORY INCOME FOR PIONEER BUSINESS</span
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
            placeholder="Enter business name"
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

      <!-- Instructions -->
      <div class="text-xs text-gray-600">
        Enter 'X' in the relevant box. Select one only. Use separate working
        sheets for each type of promoted activity/product.
      </div>
    </div>

    <!-- Approval Section -->
    <div class="mb-6">
      <div class="mb-4">
        <span class="font-bold"
          >APPROVAL UNDER THE PROMOTION OF INVESTMENTS ACT 1986:</span
        >
      </div>

      <div class="mb-4">
        <span class="font-medium"
          >APPLICATION FOR INCENTIVE MADE BEFORE 1/1/1991</span
        >
      </div>

      <div class="mb-2 flex items-center">
        <input
          type="checkbox"
          disabled
          class="mr-4 h-6 w-6 border border-gray-400"
        />
        <span class="font-medium text-blue-600"
          >100% EXEMPTION ON ADJUSTED INCOME</span
        >
      </div>

      <div class="mb-4">
        <span class="font-medium"
          >APPLICATION FOR INCENTIVE MADE ON OR AFTER 1/1/1991</span
        >
      </div>

      <div class="space-y-2">
        <div class="flex items-center">
          <input
            type="checkbox"
            disabled
            class="mr-4 h-6 w-6 border border-gray-400"
          />
          <span class="font-medium text-blue-600"
            >100% EXEMPTION ON STATUTORY INCOME</span
          >
        </div>
        <div class="flex items-center">
          <input
            type="checkbox"
            disabled
            class="mr-4 h-6 w-6 border border-gray-400"
          />
          <span class="font-medium text-blue-600"
            >85% EXEMPTION ON STATUTORY INCOME</span
          >
        </div>
        <div class="flex items-center">
          <input
            type="checkbox"
            disabled
            class="mr-4 h-6 w-6 border border-gray-400"
          />
          <span class="font-medium text-blue-600"
            >70% EXEMPTION ON STATUTORY INCOME</span
          >
        </div>
      </div>
    </div>

    <!-- Type of Promoted Activity -->
    <div class="mb-6">
      <div class="flex items-center">
        <label class="font-medium text-orange-600"
          >TYPE OF PROMOTED ACTIVITY/PRODUCT:</label
        >
        <div class="ml-4 flex-1">
          <input
            type="text"
            readonly
            placeholder="Enter promoted activity/product type"
            class="w-full border border-gray-400 bg-white px-3 py-2 text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Business Information -->
    <div class="mb-6 space-y-4">
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
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>
        <div class="ml-8 mt-2 text-xs text-gray-600">
          (If loss, fill in '0' in this box and transfer the amount of<br />
          adjusted loss to item (a) Working Sheet HK-F2)
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
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span>3. TOTAL (A1 + A2)</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
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
          class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
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
          class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
        />
      </div>
    </div>

    <!-- Page Break Indicator -->
    <div class="my-8 border-t-2 border-dashed border-gray-400 pt-4">
      <div class="text-center text-xs text-gray-500">--- Page 2 ---</div>
    </div>

    <!-- Section D: Computation of taxable and tax exempt Statutory Income -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-4 font-bold">D.</span>
          <span class="font-medium"
            >Computation of taxable and tax exempt Statutory Income</span
          >
        </div>
      </div>

      <div class="ml-8 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span>1. Taxable Statutory Income =</span>
            <input
              type="number"
              readonly
              placeholder="0"
              class="mx-2 h-6 w-12 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
            />
            <span>%</span>
            <span class="mx-2">x</span>
            <span>(C)</span>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="mx-2 h-6 w-24 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
            <span>=</span>
          </div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span>2. Tax Exempt Statutory Income =</span>
            <input
              type="number"
              readonly
              placeholder="0"
              class="mx-2 h-6 w-12 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
            />
            <span>%</span>
            <span class="mx-2">x</span>
            <span>(C)</span>
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="mx-2 h-6 w-24 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
            <span>=</span>
          </div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Section E: Value-added income -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-4 font-bold">E.</span>
          <span class="font-medium"
            >Use this Section to compute Value-added income under section
            21c</span
          >
        </div>
      </div>

      <div class="ml-8 space-y-4">
        <div class="flex items-center justify-between">
          <span>1. Value-added income (from item C)</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span>2. Inflation-adjusted Base Income</span><br />
            <span class="ml-4 text-xs text-gray-600"
              >(Refer to item 2(b) of Schedule 21c for computation)</span
            >
          </div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>3. Value-added income</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="mt-2 text-xs text-gray-600">
          Use this section to deduct losses (if any)
        </div>
      </div>
    </div>

    <!-- Section F: Tax Exempt Pioneer Income -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-4 font-bold">F.</span>
          <span class="font-medium"
            >COMPUTATION OF TAX EXEMPT PIONEER INCOME</span
          >
        </div>
      </div>

      <div class="ml-8 space-y-4">
        <div class="flex items-center justify-between">
          <span>1. Amount from item A1/C2/D2/E3</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span>2. Loss under section 21A PTA 1986</span><br />
            <span class="ml-4 text-xs text-gray-600"
              >(non-promoted activity/product)</span
            >
          </div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span>3. Loss under section 25(2) PTA 1986</span><br />
            <span class="ml-4 text-xs text-gray-600"
              >Losses loss brought forward and current year</span
            ><br />
            <span class="ml-4 text-xs text-gray-600"
              >(Promoted activity/product of the same company)</span
            ><br />
            <span class="ml-4 text-xs text-gray-600"
              >(Transfer this amount to item (b)(iv) of Working Sheet HK-F2 of
              relevant business)</span
            >
          </div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <span class="font-bold"
            >4. TAX EXEMPT PIONEER INCOME (F1 - F2 - F3)</span
          >
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>

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
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
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
            class="h-8 w-24 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>3. TOTAL (G1 - G2)</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
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
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>5. Capital Allowance</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>6. TOTAL (G3 + G4 + G5)</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span>7. Claim absorbed in the current year (amount from B)</span>
          </div>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <span>8. Balance carried forward (G6 - G7)</span>
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="h-8 w-32 border border-gray-400 bg-white px-3 py-2 text-right text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Form Footer -->
    <div class="mt-8 text-center">
      <span class="font-bold">HK-PC2: 2/2</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
// HK-PC2 Form Template - Computation of Statutory Income for Pioneer Business
// This is a non-editable visual representation of the official form
</script>

<style scoped>
.hk-pc2-form-template {
  /* Ensure consistent spacing and typography */
  line-height: 1.4;
}

/* Print-friendly styles */
@media print {
  .hk-pc2-form-template {
    font-size: 12px;
    color: black;
  }
}
</style>
