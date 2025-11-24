<template>
  <div class="hk-pc7-form-template bg-white p-6 text-sm">
    <!-- Form Header -->
    <div class="mb-6">
      <div class="bg-gray-600 px-4 py-2 text-center text-white">
        <span class="font-bold"
          >HK-PC7: COMPUTATION OF STATUTORY INCOME FOR SHIPPING BUSINESS CARRIED
          ON BY A RESIDENT COMPANY</span
        >
      </div>
    </div>

    <!-- Subheader -->
    <div class="mb-6">
      <div class="bg-blue-600 px-4 py-2 text-center text-white">
        <span class="font-bold">SHIPPING OPERATION – SECTION 54a ITA 1967</span>
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
                class="w-full border border-gray-400 bg-white px-2 py-1 text-sm focus:outline-none"
                placeholder="Enter company name"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-full border border-gray-400 bg-white px-2 py-1 text-sm">Enter company name</div>
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
                class="w-32 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
                placeholder="TIN Number"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-center text-sm">TIN Number</div>
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
                class="w-40 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
                placeholder="Registration Number"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-40 border border-gray-400 bg-white px-2 py-1 text-center text-sm">Registration Number</div>
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
                <div class="pdf-text-only h-4 w-4 border border-gray-400"></div>
              </template>
              <span class="mt-1 text-xs">{{ i }}</span>
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
                class="w-16 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
                placeholder="Year"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-16 border border-gray-400 bg-white px-2 py-1 text-center text-sm">Year</div>
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
                class="w-80 border border-gray-400 bg-white px-2 py-1 text-sm focus:outline-none"
                placeholder="Business Activity"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-80 border border-gray-400 bg-white px-2 py-1 text-sm">Business Activity</div>
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
                class="w-20 border border-gray-400 bg-white px-2 py-1 text-center text-sm focus:outline-none"
                placeholder="Code"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-20 border border-gray-400 bg-white px-2 py-1 text-center text-sm">Code</div>
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
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm">0.00</div>
            </template>
          </div>
        </div>
        <div class="ml-8 mt-2 text-xs text-gray-600">
          (If loss, fill in '0' in this box and transfer the amount<br />
          of adjusted loss to Item (a) of Working Sheet HK-F2)
        </div>
      </div>

      <div class="ml-8">
        <div class="mb-2">
          <span class="font-medium">ADD:</span>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span>2. Balancing Charge</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm">0.00</div>
            </template>
          </div>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span>3. TOTAL (A1 + A2)</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm">0.00</div>
            </template>
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
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm">0.00</div>
          </template>
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
            class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>
      </div>
      <div class="ml-8 mt-2">
        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>
      </div>
    </div>

    <!-- Section D: Brought forward losses -->
    <div class="mb-6">
      <div class="flex items-center justify-between border-b border-black pb-2">
        <div class="flex items-center">
          <span class="mr-4 font-bold">D.</span>
          <span class="font-medium"
            >Brought forward losses from shipping operations</span
          >
        </div>
        <div>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>
      </div>
      <div class="ml-8 mt-2 text-xs text-gray-600">
        (Restricted to the amount in C)
      </div>
    </div>

    <!-- Section E: Tax Exempt Income -->
    <div class="mb-6">
      <div class="flex items-center justify-between border-b border-black pb-2">
        <div class="flex items-center">
          <span class="mr-4 font-bold">E.</span>
          <span class="font-medium">TAX EXEMPT INCOME (C - D)</span>
        </div>
        <div>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>

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
          <div>
            <input
              type="number"
              readonly
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
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
              <template v-if="!isPdfExport">
                <input
                  type="number"
                  readonly
                  class="w-24 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div class="pdf-text-only w-24 border border-gray-400 bg-white px-2 py-1 text-right text-sm">0.00</div>
              </template>
            </div>
        </div>

        <div class="flex items-center justify-between">
          <span>3. TOTAL (F1 - F2)</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm">0.00</div>
            </template>
          </div>
        </div>

        <div class="mb-2">
          <span class="font-medium">ADD:</span>
        </div>

        <div class="flex items-center justify-between">
          <span>4. Balancing Allowance</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm">0.00</div>
            </template>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span>5. Capital Allowance</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-24 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-24 border border-gray-400 bg-white px-2 py-1 text-right text-sm">0.00</div>
            </template>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span>6. TOTAL (F3 + F4 + F5)</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm">0.00</div>
            </template>
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
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div class="pdf-text-only w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm">0.00</div>
            </template>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span>8. Balance carried forward (F6 - F7)</span>
          <div>
            <input
              type="number"
              readonly
              class="w-32 border border-gray-400 bg-white px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Form Footer -->
    <div class="mt-8 text-center">
      <span class="font-bold">HK-PC7</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
// HK-PC7 Form Template - Computation of Statutory Income for Shipping Business
// Carried on by a Resident Company - Shipping Operation Section 54a ITA 1967
// This is a non-editable visual representation of the official form
import { usePdfExportContext } from '../../../../composables/usePdfExportContext';

const { isPdfExport } = usePdfExportContext();
</script>

<style scoped>
.hk-pc7-form-template {
  /* Ensure consistent spacing and typography */
  line-height: 1.4;
}

/* Helper for showing text-only fields during PDF export */
.pdf-text-only {
  display: inline-block;
  line-height: 1.4;
  color: #000;
}

/* Print-friendly styles */
@media print {
  .hk-pc7-form-template {
    font-size: 12px;
    color: black;
  }
}

@media print {
  .border-gray-400 {
    border-color: #000 !important;
  }
}
</style>
