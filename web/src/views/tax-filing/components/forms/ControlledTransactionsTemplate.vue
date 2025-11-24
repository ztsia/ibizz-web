<template>
  <div class="form-container bg-white p-6 text-sm">
    <!-- Part A: Company Information Section -->
    <div class="mb-6">
      <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
        Part A: Company Information
      </div>
      <div class="space-y-4">
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Is the company required to prepare a Contemporaneous Transfer
            Pricing Documentation?</label
          >
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly flex-1"
              placeholder="Enter details"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Manufacturing activities performed</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Characterization of manufacturing activity</label
          >
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly flex-1"
              placeholder="Enter characterization"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Distribution activities performed</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Characterization of distribution activity</label
          >
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly flex-1"
              placeholder="Enter characterization"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium">Service activities performed</label>
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Characterization of service activity</label
          >
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly flex-1"
              placeholder="Enter characterization"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Business restructuring during the basis period</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >State the nature of business restructuring</label
          >
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly flex-1"
              placeholder="Enter nature of restructuring"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Performed any research and development activity</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >State the types of R&D activity</label
          >
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly flex-1"
              placeholder="Enter types of R&D"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Does the company own any trade/ brand name/ intellectual
            property?</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Has the company involved in any cash pooling activities?</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Role in the cash pooling activity</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> cash pool
                leader</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> cash pool
                member</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>cash pool leader</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>cash pool member</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Is the company a PE as defined under the TP Rules?</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Does the company make any interest, royalties and service payments
            to the company's head office?</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Has the company involved in any Cost Contribution Arrangement
            (CCA)</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Part B: Controlled Transactions Section -->
    <div class="mb-6">
      <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
        Part B: Controlled Transactions
      </div>
      <p class="mb-4">Controlled Transaction List</p>
      <table class="w-full border-collapse border border-gray-400 text-xs">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-400 p-2">Transaction Type</th>
            <th class="border border-gray-400 p-2">
              Sales/Revenue (In Malaysia)
            </th>
            <th class="border border-gray-400 p-2">
              Sales/Revenue (Outside Malaysia)
            </th>
            <th class="border border-gray-400 p-2">
              Purchases/Expenditure (In Malaysia)
            </th>
            <th class="border border-gray-400 p-2">
              Purchases/Expenditure (Outside Malaysia)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1"
                  placeholder="Transaction Type"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
          </tr>
          <tr>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1"
                  placeholder="Transaction Type"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
          </tr>
          <tr>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1"
                  placeholder="Transaction Type"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-left text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
            <td class="h-8 border border-gray-400 p-1">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-full bg-transparent p-1 text-right"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only h-full w-full bg-white p-1 text-right text-sm"
                ></div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePdfExportContext } from '#/composables/usePdfExportContext';

const { isPdfExport } = usePdfExportContext();
</script>

<style scoped>
/* Ensure borders are visible in PDF export */
@media print {
  .pdf-text-only {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .border-gray-400 {
    border-color: #000 !important;
  }
}

.form-container {
  font-family: Arial, sans-serif;
}

.form-input-readonly {
  @apply border border-gray-400 bg-white px-3 py-2 text-sm;
}

/* PDF export helper class */
.pdf-text-only {
  display: inline-block;
  line-height: 1.4;
  color: #000;
}
</style>
