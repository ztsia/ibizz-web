<template>
  <div class="hk-pc3-form-template bg-white p-6 text-sm">
    <!-- Form Header -->
    <div class="mb-6">
      <div
        class="flex items-center justify-between bg-gray-600 px-4 py-2 text-white"
      >
        <span class="font-bold">HK-PC3:</span>
        <span class="font-bold"
          >COMPUTATION OF STATUTORY INCOME FOR APPROVED SERVICE PROJECT</span
        >
      </div>
    </div>

    <!-- Basic Information Section -->
    <div class="mb-6 space-y-4">
      <!-- Name Field -->
      <div class="flex items-center">
        <label class="w-16 font-medium">Name</label>
        <div class="ml-4 flex-1">
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              placeholder="Enter name"
              class="w-full border border-gray-400 bg-white px-2 py-1 text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-full border border-gray-400 bg-white px-2 py-1 text-sm"
            >
              Enter name
            </div>
          </template>
        </div>
      </div>

      <!-- TIN and Registration No -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="w-16 font-medium">TIN</label>
          <div class="ml-4">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                maxlength="12"
                placeholder="TIN Number"
                class="w-32 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-center text-sm"
              >
                TIN Number
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="font-medium">Registration No.</label>
          <div class="ml-4">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                maxlength="15"
                placeholder="Registration Number"
                class="w-40 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 bg-white px-2 py-1 text-center text-sm"
              >
                Registration Number
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Business and Year of Assessment -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="font-medium">Business</label>
          <div class="ml-4 flex space-x-2">
            <div v-for="i in 5" :key="i" class="flex flex-col items-center">
              <template v-if="!isPdfExport">
                <input
                  type="checkbox"
                  disabled
                  class="h-4 w-4 border border-gray-400"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
              </template>
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
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                maxlength="4"
                placeholder="YYYY"
                class="w-16 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-16 border border-gray-400 bg-white px-2 py-1 text-center text-sm"
              >
                YYYY
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Type of Business Activity and Business Code -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="font-medium">Type of<br />Business Activity</label>
          <div class="ml-4">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                placeholder="Business Activity"
                class="w-80 border border-gray-400 bg-white px-2 py-1 text-sm focus:outline-none"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-80 border border-gray-400 bg-white px-2 py-1 text-sm"
              >
                Business Activity
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="font-medium">Business Code</label>
          <div class="ml-4">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                maxlength="5"
                placeholder="Code"
                class="w-20 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-20 border border-gray-400 bg-white px-2 py-1 text-center text-sm"
              >
                Code
              </div>
            </template>
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
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>
        <div class="ml-8 mt-2 text-xs text-gray-600">
          (If loss, fill in '0' in this box and transfer the amount<br />
          of adjusted loss to Working Sheet HK-F1 / HK-C2 worksheet<br />
          as relevant)
        </div>
      </div>

      <div class="ml-8">
        <div class="mb-2">
          <span class="font-medium">ADD:</span>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span>2. Balancing Charge</span>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span>3. TOTAL (A1 + A2)</span>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
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
        <template v-if="!isPdfExport">
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
          />
        </template>
        <template v-else>
          <div
            class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
          >
            0.00
          </div>
        </template>
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
        <template v-if="!isPdfExport">
          <input
            type="number"
            readonly
            placeholder="0.00"
            class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
          />
        </template>
        <template v-else>
          <div
            class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
          >
            0.00
          </div>
        </template>
      </div>
    </div>

    <!-- Section D: Taxable Statutory Income -->
    <div class="mb-6">
      <div class="flex items-center justify-between border-b border-black pb-2">
        <div class="flex items-center">
          <span class="mr-4 font-bold">D.</span>
          <span class="font-medium">Taxable Statutory Income:</span>
        </div>
        <div class="flex items-center space-x-2">
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0"
              class="w-16 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-16 border border-gray-400 bg-white px-2 py-1 text-center text-sm"
            >
              0
            </div>
          </template>
          <span class="text-sm">%</span>
          <span class="text-sm">x</span>
          <span class="text-sm">C</span>
          <span class="text-sm">=</span>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Section E: Tax exempt Statutory Income -->
    <div class="mb-6">
      <div class="flex items-center justify-between border-b border-black pb-2">
        <div class="flex items-center">
          <span class="mr-4 font-bold">E.</span>
          <span class="font-medium">Tax exempt Statutory Income:</span>
        </div>
        <div class="flex items-center space-x-2">
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0"
              class="w-16 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-16 border border-gray-400 bg-white px-2 py-1 text-center text-sm"
            >
              0
            </div>
          </template>
          <span class="text-sm">%</span>
          <span class="text-sm">x</span>
          <span class="text-sm">C</span>
          <span class="text-sm">=</span>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Form Footer Page 1 -->
    <div class="mt-8 text-center">
      <span class="font-bold">HK-PC3 1/2</span>
    </div>

    <!-- Page Break -->
    <div class="page-break my-8 border-t-2 border-dashed border-gray-300"></div>

    <!-- Section F: Adjustment of Capital Allowance -->
    <div class="mb-6">
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-4 font-bold">F.</span>
          <span class="font-medium">ADJUSTMENT OF CAPITAL ALLOWANCE</span>
        </div>
      </div>

      <div class="ml-8 space-y-4">
        <div class="flex items-center justify-between">
          <span>1. Balance brought forward</span>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
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
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-24 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-24 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>

        <div class="flex items-center justify-between">
          <span>3. TOTAL (F1 - F2)</span>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>

        <div class="mb-2">
          <span class="font-medium">ADD:</span>
        </div>

        <div class="flex items-center justify-between">
          <span>4. Balancing Allowance</span>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>

        <div class="flex items-center justify-between">
          <span>5. Capital Allowance</span>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>

        <div class="flex items-center justify-between">
          <span>6. TOTAL (F3 + F4 + F5)</span>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>

        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span>7. Claim absorbed in the current year</span><br />
            <span class="ml-4 text-xs text-gray-600">(amount from B)</span>
          </div>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>

        <div class="flex items-center justify-between">
          <span>8. Balance carried forward (F6 - F7)</span>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              placeholder="0.00"
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Form Footer Page 2 -->
    <div class="mt-8 text-center">
      <span class="font-bold">HK-PC3 2/2</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
// HK-PC3 Form Template - Computation of Statutory Income for Approved Service Project
// This is a non-editable visual representation of the official form
import { usePdfExportContext } from '../../../../composables/usePdfExportContext';

const { isPdfExport } = usePdfExportContext();
</script>

<style scoped>
/* Print-friendly styles */
@media print {
  .hk-pc3-form-template {
    font-size: 12px;
    color: black;
  }

  .page-break {
    margin: 0;
    border: none;
    page-break-before: always;
  }
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

.hk-pc3-form-template {
  /* Ensure consistent spacing and typography */
  line-height: 1.4;
}

.page-break {
  /* Visual page break indicator */
  margin: 2rem 0;
}

.pdf-text-only {
  display: inline-block;
  line-height: 1.4;
  color: #000;
}
</style>
